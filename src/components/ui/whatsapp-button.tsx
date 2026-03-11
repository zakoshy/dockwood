import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phoneNumber = "254700000000"; // Replace with real number
  const message = encodeURIComponent("Hello Dockwood Furniture's, I'm interested in your furniture products.");
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-medium">
        Chat with us
      </span>
    </a>
  );
}