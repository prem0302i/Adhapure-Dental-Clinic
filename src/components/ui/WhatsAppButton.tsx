import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/clinic-config";
import { useClinicSettings } from "@/lib/content";

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  variant?: "solid" | "inline";
  className?: string;
}

export function WhatsAppButton({
  message,
  label = "Chat on WhatsApp",
  variant = "solid",
  className = "",
}: WhatsAppButtonProps) {
  const { settings } = useClinicSettings();
  const href = buildWhatsAppUrl(message, settings.whatsappNumber);
  const base =
    "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-200 min-h-tap focus-visible:outline-none";
  const styles =
    variant === "solid"
      ? "bg-teal-deep text-white hover:bg-teal px-5 py-2.5 text-[0.95rem]"
      : "text-teal-deep hover:text-teal px-2 py-1";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
      aria-label={label}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
