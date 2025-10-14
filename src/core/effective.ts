/**
 * Reactive state management for Riot.js composables
 * Uses Proxy to track mutations and trigger component updates
 */

import type { EnhancedComponent } from '../types';

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

  // Check if state already exists (shouldn't happen in normal usage)
  if (component.__composables__.states.has(stateId)) {
    console.warn(
      '[riot-composables] Reactive state already created for this component',
    );
    return component.__composables__.states.get(stateId);
  }

  // Create a deep reactive proxy
  const createProxy = (target: any, path: string[] = []): any => {
    return new Proxy(target, {
      get(obj, prop) {
        const value = obj[prop];

        // If value is an object, return a proxied version
        if (
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          return createProxy(value, [...path, String(prop)]);
        }

        return value;
      },

      set(obj, prop, value) {
        const oldValue = obj[prop];

        // Only update if value actually changed
        if (oldValue === value) {
          return true;
        }

        obj[prop] = value;

        // Trigger component update
        try {
          component.update();
        } catch (error) {
          console.error(
            '[riot-composables] Error during component update:',
            error,
          );
        }

        return true;
      },

      deleteProperty(obj, prop) {
        if (prop in obj) {
          delete obj[prop];

          // Trigger component update
          try {
            component.update();
          } catch (error) {
            console.error(
              '[riot-composables] Error during component update:',
              error,
            );
          }
        }

        return true;
      },
    });
  };

  const proxy = createProxy(initialState);

  // Store in component context
  component.__composables__.states.set(stateId, proxy);

  return proxy;
}

/**
 * Check if an object is reactive
 */
export function isReactive(value: any): boolean {
  return (
    value !== null && typeof value === 'object' && '__isReactive__' in value
  );
}

/**
 * Get the raw (non-proxied) value of a reactive object
 * Useful for comparisons and debugging
 */
export function toRaw<T>(reactive: T): T {
  // Since we're using simple Proxy, we need to create a new object
  // In a production implementation, we'd track the original reference
  if (typeof reactive !== 'object' || reactive === null) {
    return reactive;
  }

  if (Array.isArray(reactive)) {
    return reactive.slice() as T;
  }

  return { ...reactive } as T;
}
