"use client";

import { Phone, MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const intlNumber = "254741157757";
  const displayMobile = "0741157757";
  const waMessage = encodeURIComponent("Hello Dockwood Furniture's, I'm interested in your furniture products.");
  const waUrl = `https://wa.me/${intlNumber}?text=${waMessage}`;
  const telUrl = `tel:+${intlNumber}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Call Button */}
      <a
        href={telUrl}
        className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        aria-label="Call us"
      >
        <Phone className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-medium">
          Call {displayMobile}
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-medium">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
