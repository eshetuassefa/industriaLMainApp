import { useState, useEffect } from "react";

const TOAST_DURATION = 3000; // 3 seconds

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = "default" }) => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant },
    ]);

    // Remove toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);
  };

  return { toast, toasts };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg ${
            toast.variant === "destructive"
              ? "bg-red-500 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          {toast.title && <div className="font-bold">{toast.title}</div>}
          {toast.description && <div>{toast.description}</div>}
        </div>
      ))}
    </div>
  );
} 