/**
 * useCounter composable
 * A practical example of a custom composable
 */

import type { EnhancedComponent } from '../src/types';
import { useReactive } from '../src/composables/useReactive';
import { useComputed } from '../src/composables/useComputed';

export interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
  isAtMin: { readonly value: boolean };
  isAtMax: { readonly value: boolean };
}

/**
 * Counter composable with min/max constraints
 *
 * @example
 * ```ts
 * const counter = useCounter(component, 0, { min: 0, max: 10 })
 *
 * console.log(counter.count) // 0
 * counter.increment() // count = 1
 * counter.set(5) // count = 5
 * console.log(counter.isAtMax.value) // false
 * ```
 */
export function useCounter(
  component: EnhancedComponent,
  initialValue = 0,
  options: UseCounterOptions = {},
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const state = useReactive(component, {
    count: Math.max(min, Math.min(max, initialValue)),
  });

  const isAtMin = useComputed(component, () => state.count <= min);
  const isAtMax = useComputed(component, () => state.count >= max);

  const increment = () => {
    state.count = Math.min(max, state.count + step);
  };

  const decrement = () => {
    state.count = Math.max(min, state.count - step);
  };

  const reset = () => {
    state.count = initialValue;
  };

  const set = (value: number) => {
    state.count = Math.max(min, Math.min(max, value));
  };

  return {
    get count() {
      return state.count;
    },
    set count(value: number) {
      set(value);
    },
    increment,
    decrement,
    reset,
    set,
    isAtMin,
    isAtMax,
  };
}
