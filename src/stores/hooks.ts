/**
 * Store Hooks & Utilities
 * 
 * Helper functions to use nanostores in Astro components
 * and vanilla JavaScript.
 */

import type { ReadableAtom, WritableAtom } from 'nanostores';

/**
 * Subscribe to a store and update an element's content
 * @param store - The nanostore to subscribe to
 * @param element - The HTML element to update
 * @param formatter - Optional function to format the value
 */
export function bindStore<T>(
  store: ReadableAtom<T>,
  element: HTMLElement | null,
  formatter?: (value: T) => string
) {
  if (!element) return () => {};
  
  const update = (value: T) => {
    element.textContent = formatter ? formatter(value) : String(value);
  };
  
  update(store.get());
  return store.subscribe(update);
}

/**
 * Subscribe to a store and toggle a class based on value
 */
export function bindClass(
  store: ReadableAtom<boolean>,
  element: HTMLElement | null,
  className: string
) {
  if (!element) return () => {};
  
  const update = (value: boolean) => {
    element.classList.toggle(className, value);
  };
  
  update(store.get());
  return store.subscribe(update);
}

/**
 * Subscribe to a store and update element visibility
 */
export function bindVisibility(
  store: ReadableAtom<boolean>,
  element: HTMLElement | null,
  showWhen = true
) {
  if (!element) return () => {};
  
  const update = (value: boolean) => {
    const shouldShow = showWhen ? value : !value;
    element.style.display = shouldShow ? '' : 'none';
  };
  
  update(store.get());
  return store.subscribe(update);
}

/**
 * Subscribe to a store and update an attribute
 */
export function bindAttribute(
  store: ReadableAtom<any>,
  element: HTMLElement | null,
  attribute: string,
  formatter?: (value: any) => string
) {
  if (!element) return () => {};
  
  const update = (value: any) => {
    const attrValue = formatter ? formatter(value) : String(value);
    element.setAttribute(attribute, attrValue);
  };
  
  update(store.get());
  return store.subscribe(update);
}

/**
 * Create a two-way binding for input elements
 */
export function bindInput<T>(
  store: WritableAtom<T>,
  input: HTMLInputElement | HTMLSelectElement | null,
  parser?: (value: string) => T
) {
  if (!input) return () => {};
  
  // Update input when store changes
  const unsubscribe = store.subscribe((value) => {
    input.value = String(value);
  });
  
  // Update store when input changes
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parser ? parser(target.value) : (target.value as unknown as T);
    store.set(value);
  };
  
  input.addEventListener('input', handleInput);
  input.value = String(store.get());
  
  return () => {
    unsubscribe();
    input.removeEventListener('input', handleInput);
  };
}

/**
 * Subscribe to multiple stores and call callback when any changes
 */
export function subscribeAll(
  stores: ReadableAtom<any>[],
  callback: () => void
) {
  const unsubscribes = stores.map(store => store.subscribe(callback));
  return () => unsubscribes.forEach(unsub => unsub());
}

/**
 * Get current values from multiple stores
 */
export function getAll<T extends ReadableAtom<any>[]>(
  stores: [...T]
): { [K in keyof T]: T[K] extends ReadableAtom<infer V> ? V : never } {
  return stores.map(store => store.get()) as any;
}
