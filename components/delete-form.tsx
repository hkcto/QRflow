"use client";

import type { ReactNode } from "react";

export function DeleteForm({
  id,
  action,
  children = "Delete",
  className = "",
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete this QR code? Its short link will stop working immediately."
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
