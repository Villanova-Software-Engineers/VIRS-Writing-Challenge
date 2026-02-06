import React from "react";
import "./input.css";

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
  const { label, id, extra = "", type, placeholder, variant, state, disabled, value, onChange, onBlur } = props;

  const className = [
    "auth-input",
    variant === "auth" ? "auth-input--primary" : "",
    state === "error" ? "is-error" : "",
    state === "success" ? "is-success" : "",
    disabled ? "is-disabled" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={extra ? extra : undefined}>
      {label && (
        <label htmlFor={id} className="auth-label">
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
