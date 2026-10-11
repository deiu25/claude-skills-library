import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  hint?: string;
}

/** A labelled input; `name` doubles as its id. */
export function Field({ label, name, hint, ...input }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input id={name} name={name} aria-describedby={hintId} className="input-base" {...input} />
      {hint && (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}
