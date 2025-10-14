/**
 * useEffect composable
 * Handles side effects in Riot components
 */

import type { EnhancedComponent, EffectFunction, DepsGetter } from '../types';

/**
 * Execute side effects with optional dependency tracking
 *
 * @param component - The Riot component instance
 * @param effect - Effect function to run
 * @param deps - Optional dependency getter
 *
 * @example
 * ```ts
 * // Run once on mount
 * useEffect(component, () => {
 *   console.log('Component mounted')
 *   return () => console.log('Component unmounting')
 * })
 *
 * // Run when dependencies change
 * useEffect(component, () => {
 *   document.title = `Count: ${state.count}`
 * }, () => [state.count])
 * ```
 */
export function useEffect(
  component: EnhancedComponent,
  effect: EffectFunction,
  deps?: DepsGetter,
): void {
  component.$effect(effect, deps);
}

/**
 * Run effect only on mount
 *
 * @param component - The Riot component instance
 * @param effect - Effect function to run on mount
 *
 * @example
 * ```ts
 * useMount(component, () => {
 *   console.log('Component mounted!')
 * })
 * ```
 */
export function useMount(
  component: EnhancedComponent,
  effect: () => void | (() => void),
): void {
  useEffect(component, effect, () => []);
}

/**
 * Run cleanup only on unmount
 *
 * @param component - The Riot component instance
 * @param cleanup - Cleanup function to run on unmount
 *
 * @example
 * ```ts
 * useUnmount(component, () => {
 *   console.log('Cleaning up...')
 * })
 * ```
 */
export function useUnmount(
  component: EnhancedComponent,
  cleanup: () => void,
): void {
  useEffect(
    component,
    () => cleanup,
    () => [],
  );
}
