/**
 * Watch system for observing value changes in Riot.js composables
 * Similar to Vue's watch
 */

import type { EnhancedComponent, WatchCallback, WatchData } from '../types';

/**
 * Watch a value and execute a callback when it changes
 *
 * @param component - The Riot component instance
 * @param getter - Function to get the value to watch
 * @param callback - Callback to execute when value changes
 *
 * @example
 * ```ts
 * createWatch(component, () => state.count, (newVal, oldVal) => {
 *   console.log(`Count changed from ${oldVal} to ${newVal}`)
 * })
 * ```
 */
export function createWatch<T>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
): void {
  const watchId = Symbol('watch');

  // Get initial value
  let oldValue: T;
  try {
    oldValue = getter();
  } catch (error) {
    console.error('[riot-composables] Error in watch getter:', error);
    return;
  }

  const watchData: WatchData<T> = {
    getter,
    callback,
    oldValue,
  };

  // Store watch data
  component.__composables__.watchers.set(watchId, watchData);

  // Note: Watch checking is handled by the plugin's onBeforeUpdate hook
}

/**
 * Watch multiple values at once
 *
 * @example
 * ```ts
 * createWatchMultiple(component, [
 *   [() => state.count, (newVal, oldVal) => console.log('count:', newVal)],
 *   [() => state.name, (newVal, oldVal) => console.log('name:', newVal)]
 * ])
 * ```
 */
export function createWatchMultiple(
  component: EnhancedComponent,
  watchers: Array<[getter: () => any, callback: WatchCallback<any>]>,
): void {
  for (const [getter, callback] of watchers) {
    createWatch(component, getter, callback);
  }
}

/**
 * Watch an object with multiple properties
 * Deep watching is not supported by default
 *
 * @example
 * ```ts
 * createWatchObject(component, () => state, (newVal, oldVal) => {
 *   console.log('State changed')
 * })
 * ```
 */
export function createWatchObject<T extends object>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
  options?: { deep?: boolean },
): void {
  if (options?.deep) {
    console.warn('[riot-composables] Deep watching is not yet implemented');
  }

  createWatch(component, getter, callback);
}
