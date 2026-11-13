import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputField({ label, className = "", ...props }: InputFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <input className={`${inputClassName} ${className}`} {...props} />
    </label>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextAreaField({ label, className = "", ...props }: TextAreaFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <textarea
        className={`min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </label>
  );
}
