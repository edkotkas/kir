import type { InputHTMLAttributes } from "react";

export function AppInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-bg-300 bg-bg-100 px-3 py-2 text-text-100 focus:border-primary-200 focus:outline-none"
      {...props}
    />
  );
}
