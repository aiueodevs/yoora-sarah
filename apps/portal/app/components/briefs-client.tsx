"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createBriefAction } from "../briefs/actions";

export function BriefsClient() {
  const router = useRouter();

  useEffect(() => {
    const modal = document.getElementById("new-brief-modal") as HTMLDialogElement | null;
    const trigger = document.getElementById("new-brief-btn");
    const close = document.getElementById("cancel-brief");
    const form = modal?.querySelector("form");
    const message = document.getElementById("brief-form-message");
    const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;

    if (!modal || !trigger) return;

    let isSubmitting = false;

    const setMessage = (text: string, type: "success" | "error" | null = null) => {
      if (!message) {
        return;
      }

      if (!text) {
        message.textContent = "";
        message.className = "message";
        message.setAttribute("hidden", "true");
        return;
      }

      message.textContent = text;
      message.className = `message message-${type ?? "success"}`;
      message.removeAttribute("hidden");
    };

    const openModal = () => {
      setMessage("");
      modal.showModal();
    };

    const closeModal = () => {
      modal.close();
    };

    const handleBackdropClick = (e: Event) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      if (!form || isSubmitting) {
        return;
      }

      isSubmitting = true;
      setMessage("");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Menyimpan...";
      }

      try {
        await createBriefAction(new FormData(form));
        form.reset();
        closeModal();
        router.refresh();
      } catch (err: unknown) {
        setMessage(err instanceof Error ? err.message : "Gagal membuat brief", "error");
      } finally {
        isSubmitting = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Simpan brief";
        }
      }
    };

    trigger.addEventListener("click", openModal);
    
    if (close) {
      close.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", handleBackdropClick);

    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    return () => {
      trigger.removeEventListener("click", openModal);
      if (close) close.removeEventListener("click", closeModal);
      modal.removeEventListener("click", handleBackdropClick);
      if (form) {
        form.removeEventListener("submit", handleSubmit);
      }
    };
  }, [router]);

  return null;
}

export function BriefsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BriefsClient />
      {children}
    </>
  );
}
