/**
 * useToggle composable example
 * This is NOT part of the riot-composables library
 * It's an example of how to create custom composables
 */

import { useReactive, type EnhancedComponent } from 'riot-composables';

export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

/**
 * Boolean toggle composable
 *
 * @example
 * ```ts
 * const modal = useToggle(component, false)
 *
 * modal.toggle() // true
 * modal.setFalse() // false
 * console.log(modal.value) // false
 * ```
 */
export function useToggle(
  component: EnhancedComponent,
  initialValue = false,
): UseToggleReturn {
  const state = useReactive(component, { value: initialValue });

  const toggle = () => {
    state.value = !state.value;
  };

  const setTrue = () => {
    state.value = true;
  };

  const setFalse = () => {
    state.value = false;
  };

  const setValue = (value: boolean) => {
    state.value = value;
  };

  return {
    get value() {
      return state.value;
    },
    set value(val: boolean) {
      state.value = val;
    },
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}
