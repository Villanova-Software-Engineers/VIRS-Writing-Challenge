import React from "react";

interface InputFieldProps {
  label?: string;
  id: string;
  extra?: string;
  type: string;
  placeholder?: string;
  variant?: string;
  state?: "error" | "success";
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function InputField(props: InputFieldProps) {
  const { label, id, extra = "", type, placeholder, state, disabled, value, onChange, onBlur } = props;

  const stateClasses =
    state === "error"
      ? "border-red-400/50 shadow-[0_0_0_4px_rgba(248,113,113,0.12)]"
      : state === "success"
        ? "border-emerald-400"
        : "";

  const disabledClass = disabled ? "opacity-60 cursor-not-allowed" : "";

  const className = [
    "w-full mt-1.5 px-3.5 py-3 rounded-[14px] border border-accent/20 bg-background text-text text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,75,145,0.18)]",
    stateClasses,
    disabledClass,
    extra,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-muted tracking-wide">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={className}
      />
    </div>
  );
}

export default InputField;
