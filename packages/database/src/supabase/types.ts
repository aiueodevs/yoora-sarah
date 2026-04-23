export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description_blocks: string[]
          materials: string[]
          care_instructions: string[]
          price: number
          compare_price: number | null
          image: string
          category_id: string
          badge: string | null
          is_featured: boolean
          is_active: boolean
          swatch_count: number
          stock_state: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | null
          trust_badges: string[]
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description_blocks?: string[]
          materials?: string[]
          care_instructions?: string[]
          price: number
          compare_price?: number | null
          image: string
          category_id: string
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          swatch_count?: number
          stock_state?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | null
          trust_badges?: string[]
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description_blocks?: string[]
          materials?: string[]
          care_instructions?: string[]
          price?: number
          compare_price?: number | null
          image?: string
          category_id?: string
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          swatch_count?: number
          stock_state?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | null
          trust_badges?: string[]
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          hero_image: string | null
          eyebrow: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          hero_image?: string | null
          eyebrow?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          hero_image?: string | null
          eyebrow?: string | null
          parent_id?: string | null
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          color_name: string
          color_hex: string
          size_code: string
          stock: number
          image_urls: string[]
          position: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          color_name: string
          color_hex: string
          size_code: string
          stock?: number
          image_urls?: string[]
          position?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          color_name?: string
          color_hex?: string
          size_code?: string
          stock?: number
          image_urls?: string[]
          position?: number
          is_active?: boolean
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          member_state: 'guest' | 'member_active' | 'member_priority'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          member_state?: 'guest' | 'member_active' | 'member_priority'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          member_state?: 'guest' | 'member_active' | 'member_priority'
          created_at?: string
          updated_at?: string
        }
      }
      customer_addresses: {
        Row: {
          id: string
          customer_id: string
          label: string
          recipient_name: string
          phone: string
          address_line: string
          city: string
          province: string
          postal_code: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label: string
          recipient_name: string
          phone: string
          address_line: string
          city: string
          province: string
          postal_code: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string
          recipient_name?: string
          phone?: string
          address_line?: string
          city?: string
          province?: string
          postal_code?: string
          is_default?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: 'awaiting_payment' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered'
          subtotal: number
          shipping_cost: number
          service_fee: number
          total: number
          shipping_address_id: string | null
          payment_method: string
          payment_status: string
          payment_due_at: string | null
          placed_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id: string
          status: 'awaiting_payment' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered'
          subtotal: number
          shipping_cost?: number
          service_fee?: number
          total: number
          shipping_address_id?: string | null
          payment_method: string
          payment_status: string
          payment_due_at?: string | null
          placed_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: 'awaiting_payment' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered'
          subtotal?: number
          shipping_cost?: number
          service_fee?: number
          total?: number
          shipping_address_id?: string | null
          payment_method?: string
          payment_status?: string
          payment_due_at?: string | null
          placed_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          customer_id: string
          status: 'active' | 'converted' | 'abandoned'
          shipping_cost: number
          service_fee: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          status?: 'active' | 'converted' | 'abandoned'
          shipping_cost?: number
          service_fee?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          status?: 'active' | 'converted' | 'abandoned'
          shipping_cost?: number
          service_fee?: number
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          created_at?: string
        }
      }
      support_policy_articles: {
        Row: {
          id: string
          slug: string
          title: string
          summary: string
          href: string
          topics: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          summary: string
          href: string
          topics?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          summary?: string
          href?: string
          topics?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      support_handoffs: {
        Row: {
          id: string
          customer_reference: string | null
          order_reference: string | null
          reason: string
          context_summary: string
          requested_channel: 'whatsapp' | 'human_cs'
          source: 'checkout' | 'order_tracking' | 'buyer_ai' | 'profile'
          status: 'draft' | 'ready' | 'submitted'
          next_action: string
          contact_whatsapp_number: string | null
          contact_whatsapp_href: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_reference?: string | null
          order_reference?: string | null
          reason: string
          context_summary: string
          requested_channel: 'whatsapp' | 'human_cs'
          source: 'checkout' | 'order_tracking' | 'buyer_ai' | 'profile'
          status?: 'draft' | 'ready' | 'submitted'
          next_action: string
          contact_whatsapp_number?: string | null
          contact_whatsapp_href?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_reference?: string | null
          order_reference?: string | null
          reason?: string
          context_summary?: string
          requested_channel?: 'whatsapp' | 'human_cs'
          source?: 'checkout' | 'order_tracking' | 'buyer_ai' | 'profile'
          status?: 'draft' | 'ready' | 'submitted'
          next_action?: string
          contact_whatsapp_number?: string | null
          contact_whatsapp_href?: string | null
          created_at?: string
        }
      }
    }
  }
}
