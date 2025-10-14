/**
 * useComputed composable
 * Creates cached computed values
 */

import type { EnhancedComponent } from '../types';

/**
 * Create a computed value with automatic caching
 *
 * @param component - The Riot component instance
 * @param getter - Function to compute the value
 * @returns Object with readonly value property
 *
 * @example
 * ```ts
 * const doubled = useComputed(component, () => state.count * 2)
 * console.log(doubled.value) // Automatically cached
 *
 * // In template
 * <p>Doubled: {doubled.value}</p>
 * ```
 */
export function useComputed<T>(
  component: EnhancedComponent,
  getter: () => T,
): { readonly value: T } {
  return component.$computed(getter);
}
