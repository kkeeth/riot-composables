/**
 * Computed values for Riot.js composables
 * Similar to Vue's computed properties
 */

import type { EnhancedComponent, ComputedData } from '../types';

/**
 * Create a computed value that is cached until dependencies change
 *
 * @param component - The Riot component instance
 * @param getter - Function to compute the value
 * @returns Object with readonly value property
 *
 * @example
 * ```ts
 * const doubled = createComputed(component, () => state.count * 2)
 * console.log(doubled.value) // Cached result
 * ```
 */
export function createComputed<T>(
  component: EnhancedComponent,
  getter: () => T,
): { readonly value: T } {
  const computedId = Symbol('computed');

  const computedData: ComputedData<T> = {
    getter,
    cache: undefined,
    dirty: true,
  };

  // Store computed data
  component.__composables__.computed.set(computedId, computedData);

  // Create computed ref object
  const computedRef = {
    get value(): T {
      if (computedData.dirty) {
        try {
          computedData.cache = getter();
          computedData.dirty = false;
        } catch (error) {
          console.error('[riot-composables] Error in computed getter:', error);
          throw error;
        }
      }
      return computedData.cache as T;
    },
  };

  // Note: Marking as dirty is handled by the plugin's onBeforeUpdate hook

  return computedRef;
}

/**
 * Create multiple computed values at once
 *
 * @example
 * ```ts
 * const { doubled, tripled } = createComputedObject(component, {
 *   doubled: () => state.count * 2,
 *   tripled: () => state.count * 3
 * })
 * ```
 */
export function createComputedObject<T extends Record<string, () => any>>(
  component: EnhancedComponent,
  computedGetters: T,
): { [K in keyof T]: { readonly value: ReturnType<T[K]> } } {
  const result = {} as any;

  for (const [key, getter] of Object.entries(computedGetters)) {
    result[key] = createComputed(component, getter);
  }

  return result;
}
