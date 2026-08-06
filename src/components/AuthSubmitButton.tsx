"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="auth-submit-btn"
      disabled={pending}
      data-pending={pending}
    >
      <span>{pending ? pendingLabel : label}</span>
      <span className="auth-submit-scene" aria-hidden="true">
        <span className="auth-submit-door">
          <span className="auth-submit-door-panel" />
        </span>
        <span className="auth-submit-runner">
          <span className="auth-submit-runner-frame auth-submit-runner-frame-a" />
          <span className="auth-submit-runner-frame auth-submit-runner-frame-b" />
        </span>
      </span>
    </button>
  );
}
