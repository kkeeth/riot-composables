/**
 * Reactive state management for Riot.js composables
 * Uses Proxy to track mutations and trigger component updates
 */

import type { EnhancedComponent } from '../types';

/**
 * Symbol to mark reactive objects
 */
const REACTIVE_MARKER = Symbol('__isReactive__');

/**
 * WeakMap to store original objects for reactive proxies
 */
const reactiveToRaw = new WeakMap<object, object>();
const rawToReactive = new WeakMap<object, object>();

/**
 * Create a reactive state object that automatically triggers component updates
 *
 * @param component - The Riot component instance
 * @param initialState - Initial state object
 * @returns Proxied reactive state
 *
 * @example
 * ```ts
 * const state = createReactive(component, { count: 0 })
 * state.count++ // Automatically triggers component.update()
 * ```
 */
export function createReactive<T extends object>(
  component: EnhancedComponent,
  initialState: T,
): T {
  const stateId = Symbol('reactive-state');

  // Return existing proxy if already reactive
  const existingProxy = rawToReactive.get(initialState);
  if (existingProxy) {
    return existingProxy as T;
  }

  // Create a deep reactive proxy
  const createProxy = <U extends object>(target: U): U => {
    // Check if already proxied
    const existing = rawToReactive.get(target);
    if (existing) {
      return existing as U;
    }

    const proxy = new Proxy(target, {
      get(obj, prop) {
        // Return reactive marker
        if (prop === REACTIVE_MARKER) {
          return true;
        }

        const value = Reflect.get(obj, prop);

        // If value is an object or array, return a proxied version
        if (value !== null && typeof value === 'object') {
          return createProxy(value);
        }

        return value;
      },

      has(obj, prop) {
        // Check for reactive marker
        if (prop === REACTIVE_MARKER) {
          return true;
        }

        return Reflect.has(obj, prop);
      },

      set(obj, prop, value) {
        const oldValue = Reflect.get(obj, prop);

        // Only update if value actually changed
        if (Object.is(oldValue, value)) {
          return true;
        }

        const result = Reflect.set(obj, prop, value);

        // Trigger component update
        try {
          component.update();
        } catch (error) {
          console.error(
            '[riot-composables] Error during component update:',
            error,
          );
        }

        return result;
      },

      deleteProperty(obj, prop) {
        const hadKey = Reflect.has(obj, prop);
        const result = Reflect.deleteProperty(obj, prop);

        // Only trigger update if property existed
        if (hadKey && result) {
          try {
            component.update();
          } catch (error) {
            console.error(
              '[riot-composables] Error during component update:',
              error,
            );
          }
        }

        return result;
      },
    });

    // Store mappings
    reactiveToRaw.set(proxy, target);
    rawToReactive.set(target, proxy);

    return proxy;
  };

  const proxy = createProxy(initialState);

  // Store in component context
  component.__composables__.states.set(stateId, proxy);

  return proxy;
}

/**
 * Check if an object is reactive
 *
 * @param value - Value to check
 * @returns true if value is a reactive proxy
 */
export function isReactive(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    REACTIVE_MARKER in value
  );
}

/**
 * Get the raw (non-proxied) value of a reactive object
 * Useful for comparisons and debugging
 *
 * @param reactive - Reactive object
 * @returns Original non-reactive object
 */
export function toRaw<T>(reactive: T): T {
  if (typeof reactive !== 'object' || reactive === null) {
    return reactive;
  }

  // Get original object from WeakMap
  const raw = reactiveToRaw.get(reactive as object);
  return (raw ?? reactive) as T;
}
