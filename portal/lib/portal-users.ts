import "server-only";

export type PortalUser = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
};

type UserRow = {
  user_id: number;
  email: string;
  full_name: string;
  is_active: boolean;
};

type UserRoleAssignmentRow = {
  user_id: number;
  role_id: number;
};

type RoleRow = {
  role_id: number;
  code: string;
};

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

async function readSupabaseRows<T>(path: string, fallbackValue: T): Promise<T> {
  if (!supabaseUrl || !supabaseSecretKey) {
    return fallbackValue;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      cache: "no-store",
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
      },
    });

    if (!response.ok) {
      return fallbackValue;
    }

    return (await response.json()) as T;
  } catch {
    return fallbackValue;
  }
}

function toPortalUser(
  user: UserRow,
  assignments: UserRoleAssignmentRow[],
  rolesById: Map<number, string>,
): PortalUser {
  return {
    id: `user_${user.user_id}`,
    email: user.email,
    fullName: user.full_name,
    isActive: user.is_active,
    roles: assignments
      .filter((assignment) => assignment.user_id === user.user_id)
      .map((assignment) => rolesById.get(assignment.role_id))
      .filter((role): role is string => Boolean(role)),
  };
}

export async function listPortalUsers(): Promise<PortalUser[]> {
  const [users, assignments, roles] = await Promise.all([
    readSupabaseRows<UserRow[]>(
      "users?select=user_id,email,full_name,is_active&order=user_id.asc",
      [],
    ),
    readSupabaseRows<UserRoleAssignmentRow[]>(
      "user_role_assignments?select=user_id,role_id&order=user_id.asc",
      [],
    ),
    readSupabaseRows<RoleRow[]>("roles?select=role_id,code&order=role_id.asc", []),
  ]);

  const rolesById = new Map<number, string>(roles.map((role) => [role.role_id, role.code]));
  return users.map((user) => toPortalUser(user, assignments, rolesById));
}

export async function findPortalUserByEmail(email: string): Promise<PortalUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const users = await listPortalUsers();
  return (
    users.find((user) => user.email.trim().toLowerCase() === normalizedEmail) ??
    null
  );
}
