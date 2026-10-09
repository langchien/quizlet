import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Kết hợp và gộp các class Tailwind CSS an toàn
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
