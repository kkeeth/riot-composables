/**
 * Effect system for handling side effects in Riot.js composables
 * Similar to React's useEffect
 */

import type {
  EnhancedComponent,
  EffectFunction,
  DepsGetter,
  EffectData,
} from '../types';

/**
 * Create a side effect that runs when dependencies change
 *
 * @param component - The Riot component instance
 * @param effect - Effect function to run
 * @param deps - Optional dependency getter function
 *
 * @example
 * ```ts
 * createEffect(component, () => {
 *   console.log('Effect running')
 *   return () => console.log('Cleanup')
 * }, () => [state.count])
 * ```
 */
export function createEffect(
  component: EnhancedComponent,
  effect: EffectFunction,
  deps?: DepsGetter,
): void {
  const effectId = Symbol('effect');

  const effectData: EffectData = {
    effect,
    deps: deps ? deps() : undefined,
    depsGetter: deps,
    cleanup: undefined,
  };

  // Function to run the effect
  const runEffect = () => {
    // Run cleanup from previous effect if exists
    if (effectData.cleanup) {
      try {
        effectData.cleanup();
      } catch (error) {
        console.error('[riot-composables] Error in effect cleanup:', error);
      }
    }

    // Run the effect and store cleanup
    try {
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        effectData.cleanup = cleanup;
      }
    } catch (error) {
      console.error('[riot-composables] Error in effect:', error);
    }
  };

  // Store effect data
  component.__composables__.effects.set(effectId, effectData);

  // Schedule effect to run on mount
  const originalOnMounted = component.onMounted;
  component.onMounted = function (props, state) {
    runEffect();
    if (originalOnMounted) {
      return originalOnMounted.call(this, props, state);
    }
  };

  // Note: Dependency tracking is handled by the plugin's onBeforeUpdate hook

  // Register cleanup function
  component.__composables__.cleanups.push(() => {
    if (effectData.cleanup) {
      effectData.cleanup();
    }
  });
}
