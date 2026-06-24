import { useEffect } from "react";
import styles from "./Snackbar.module.css";

export function Snackbar({
  message,
  onDone,
  variant = "fixed",
}: {
  message: string | null;
  onDone: () => void;
  variant?: "fixed" | "inline";
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div
      className={variant === "inline" ? styles.snackbarInline : styles.snackbar}
      role="status"
    >
      {message}
    </div>
  );
}
