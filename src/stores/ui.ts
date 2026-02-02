import { atom, computed } from 'nanostores';

// ===== MOBILE MENU STATE =====
export const isMobileMenuOpen = atom<boolean>(false);

export function toggleMobileMenu() {
  isMobileMenuOpen.set(!isMobileMenuOpen.get());
}

export function closeMobileMenu() {
  isMobileMenuOpen.set(false);
}

export function openMobileMenu() {
  isMobileMenuOpen.set(true);
}

// ===== LANGUAGE DROPDOWN STATE =====
export const isLangDropdownOpen = atom<boolean>(false);

export function toggleLangDropdown() {
  isLangDropdownOpen.set(!isLangDropdownOpen.get());
}

export function closeLangDropdown() {
  isLangDropdownOpen.set(false);
}

// ===== MODAL STATE =====
export const activeModal = atom<string | null>(null);

export function openModal(modalId: string) {
  activeModal.set(modalId);
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  activeModal.set(null);
  document.body.style.overflow = '';
}

export const isModalOpen = computed(activeModal, (modal) => modal !== null);

// ===== TOAST NOTIFICATIONS =====
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const toasts = atom<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { ...toast, id };
  
  toasts.set([...toasts.get(), newToast]);
  
  // Auto remove after duration
  const duration = toast.duration || 5000;
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
}

export function removeToast(id: string) {
  toasts.set(toasts.get().filter(t => t.id !== id));
}

export function clearToasts() {
  toasts.set([]);
}

// ===== LOADING STATE =====
export const isLoading = atom<boolean>(false);
export const loadingMessage = atom<string>('');

export function startLoading(message = 'Loading...') {
  isLoading.set(true);
  loadingMessage.set(message);
}

export function stopLoading() {
  isLoading.set(false);
  loadingMessage.set('');
}

// ===== SCROLL STATE =====
export const scrollY = atom<number>(0);
export const isScrolled = computed(scrollY, (y) => y > 50);
export const isScrolledFar = computed(scrollY, (y) => y > 300);

// Initialize scroll listener on client
if (typeof window !== 'undefined') {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollY.set(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
