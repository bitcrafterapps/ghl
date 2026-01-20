import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function formatPhoneLink(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function formatEmailLink(email: string): string {
  return `mailto:${email}`;
}

export function formatAddressLink(address: string, city: string, state: string, zip: string): string {
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
}
