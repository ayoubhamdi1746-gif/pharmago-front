"use client";

import { motion, AnimatePresence } from "framer-motion";
import { modalOverlayVariants, modalCardVariants } from "@/lib/motion";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  children?: ReactNode;
}

export default function Modal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  children,
}: ModalProps) {
  const btnColor =
    variant === "danger"
      ? "bg-[#FF4D6D] hover:bg-[#E63E5C] text-white"
      : variant === "warning"
      ? "bg-[#E69E3E] hover:bg-[#CC8934] text-white"
      : "bg-[#00D4AA] hover:bg-[#009B7D] text-white";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-[#022C22] mb-2">
              {title}
            </h3>
            {children ? (
              <div className="mb-4">{children}</div>
            ) : message ? (
              <p className="text-sm text-gray-500 mb-6">{message}</p>
            ) : null}
            {(onConfirm || children) && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-btn text-sm font-medium text-gray-600 bg-white border border-[#A7F3D0] hover:bg-[#F0FDF9] transition-all duration-200"
                >
                  {cancelLabel}
                </button>
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${btnColor}`}
                  >
                    {confirmLabel}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
