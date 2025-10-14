/**
 * useWatch composable
 * Watch values and react to changes
 */

import type { EnhancedComponent, WatchCallback } from '../types';

/**
 * Watch a value and execute callback when it changes
 *
 * @param component - The Riot component instance
 * @param getter - Function to get the value to watch
 * @param callback - Callback when value changes
 *
 * @example
 * ```ts
 * useWatch(component,
 *   () => state.count,
 *   (newVal, oldVal) => {
 *     console.log(`Changed from ${oldVal} to ${newVal}`)
 *   }
 * )
 * ```
 */
export function useWatch<T>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
): void {
  component.$watch(getter, callback);
}
