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
    <div className="auth-submit-wrap">
      <div className="auth-door-scene" data-active={pending}>
        <div className="auth-door-frame">
          <div className="auth-door-panel" />
        </div>
        <div className="auth-walker" />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? pendingLabel : label}
      </button>
    </div>
  );
}
