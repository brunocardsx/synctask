import React, { useState } from "react";

type InputProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
};

export default function Input({
  label,
  id,
  error,
  hint,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  type = "text",
  className = "",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const baseInputClasses =
    "block w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const inputClasses = error
    ? `${baseInputClasses} bg-red-50 border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500`
    : isFocused
      ? `${baseInputClasses} bg-white border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500`
      : `${baseInputClasses} bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500`;

  const labelClasses = error
    ? "block text-sm font-medium text-red-700 mb-1"
    : "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 text-sm">{leftIcon}</div>
          </div>
        )}

        <input
          id={id}
          type={inputType}
          className={`${inputClasses} ${leftIcon ? "pl-10" : ""} ${rightIcon || showPasswordToggle ? "pr-10" : ""} ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {(rightIcon || showPasswordToggle) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {showPasswordToggle && type === "password" ? (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <div className="text-gray-400 text-sm">{rightIcon}</div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
