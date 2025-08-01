import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Remove lingering full-screen overlays so new sections are always accessible
export function cleanupOverlays(): void {
  if (typeof document === 'undefined') return;
  const overlays = document.querySelectorAll<HTMLElement>('.fixed.inset-0');
  overlays.forEach((el) => {
    if (el.dataset.persistent === 'true') return;
    el.remove();
  });
}
