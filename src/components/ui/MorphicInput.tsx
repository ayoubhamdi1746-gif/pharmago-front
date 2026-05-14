"use client";

import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";

type MorphicVariant = "input" | "textarea";

interface BaseProps {
  label: string;
  variant?: MorphicVariant;
  containerClassName?: string;
}

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & { variant?: "input" };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { variant: "textarea" };

type MorphicInputProps = InputProps | TextareaProps;

export default function MorphicInput(props: MorphicInputProps) {
  const { label, variant = "input", containerClassName = "", ...rest } = props;
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const id = `morphic-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0);
    (rest as any).onChange?.(e);
  };

  const isFloating = focused || hasValue;

  const inputClasses = `
    w-full px-4 pt-6 pb-2 rounded-btn
    bg-white/80 dark:bg-white/5
    border border-border text-text-1 text-sm
    placeholder-transparent
    focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,212,170,0.12)]
    transition-all duration-200
    ${props.className || ""}
  `.trim();

  return (
    <div className={`relative ${containerClassName}`}>
      {variant === "textarea" ? (
        <textarea
          id={id}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          onFocus={(e) => { setFocused(true); (rest as any).onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); (rest as any).onBlur?.(e); }}
          onChange={handleChange}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          onFocus={(e) => { setFocused(true); (rest as any).onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); (rest as any).onBlur?.(e); }}
          onChange={handleChange}
          className={inputClasses}
        />
      )}

      <motion.label
        htmlFor={id}
        animate={{
          top: isFloating ? 8 : 14,
          fontSize: isFloating ? "10px" : "13px",
          color: isFloating
            ? "var(--color-primary-400)"
            : "var(--color-text-3)",
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="absolute left-4 pointer-events-none"
        style={{ originX: 0 }}
      >
        {label}
      </motion.label>

      {focused && (
        <motion.div
          layoutId="morphic-accent"
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      )}
    </div>
  );
}
