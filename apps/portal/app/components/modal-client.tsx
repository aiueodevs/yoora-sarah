"use client";

import { useEffect } from "react";

interface ModalClientProps {
  modalId: string;
  triggerId?: string;
  closeId?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export function ModalClient({
  modalId,
  triggerId,
  closeId,
  onOpen,
  onClose,
}: ModalClientProps) {
  useEffect(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    const trigger = triggerId
      ? document.getElementById(triggerId)
      : null;
    const close = closeId
      ? document.getElementById(closeId)
      : modal?.querySelector(".close-btn") ||
        modal?.querySelector('[aria-label="Close"]');

    if (!modal) return;

    const openModal = (e?: Event) => {
      e?.preventDefault();
      modal.showModal();
      onOpen?.();
    };

    const closeModal = (e?: Event) => {
      e?.preventDefault();
      modal.close();
      onClose?.();
    };

    if (trigger) {
      trigger.addEventListener("click", openModal);
    }

    if (close) {
      close.addEventListener("click", closeModal);
    }

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modal.open) {
        closeModal();
      }
    };

    modal.addEventListener("click", handleBackdropClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      if (trigger) {
        trigger.removeEventListener("click", openModal);
      }
      if (close) {
        close.removeEventListener("click", closeModal);
      }
      modal.removeEventListener("click", handleBackdropClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modalId, triggerId, closeId, onOpen, onClose]);

  return null;
}

export function initModals() {
  if (typeof document === "undefined") return;

  document.querySelectorAll("dialog.modal").forEach((modal) => {
    const dialog = modal as HTMLDialogElement;
    const trigger = document.getElementById(
      dialog.id.replace("modal", "btn")
    );
    const close = dialog.querySelector(".close-btn");

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        dialog.showModal();
      });
    }

    if (close) {
      close.addEventListener("click", (e) => {
        e.preventDefault();
        dialog.close();
      });
    }

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(
        'dialog.modal[open]'
      ) as HTMLDialogElement | null;
      if (openModal) {
        openModal.close();
      }
    }
  });
}
