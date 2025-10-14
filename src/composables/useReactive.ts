/**
 * useReactive composable
 * Creates a reactive state object for use in Riot components
 */

import type { EnhancedComponent } from '../types';

/**
 * Create a reactive state object that automatically triggers updates
 *
 * @param component - The Riot component instance
 * @param initialState - Initial state object
 * @returns Reactive state proxy
 *
 * @example
 * ```riot
 * <my-component>
 *   <p>Count: {state.count}</p>
 *   <button onclick={increment}>+</button>
 *
 *   <script>
 *     import { useReactive } from 'riot-composables'
 *
 *     export default {
 *       onBeforeMount() {
 *         const state = useReactive(this, { count: 0 })
 *
 *         this.state = state
 *         this.increment = () => state.count++
 *       }
 *     }
 *   </script>
 * </my-component>
 * ```
 */
export function useReactive<T extends object>(
  component: EnhancedComponent,
  initialState: T,
): T {
  return component.$reactive(initialState);
}
