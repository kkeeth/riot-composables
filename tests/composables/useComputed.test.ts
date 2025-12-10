import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useComputed } from '../../src/composables/useComputed';
import { installComposables } from '../../src/core/plugin';
import { createComputed } from '../../src/core/computed';
import type { EnhancedComponent } from '../../src/types';

// Mock createComputed
vi.mock('../../src/core/computed', () => ({
  createComputed: vi.fn((component, getter) => {
    let cache: any;
    let dirty = true;

    return {
      get value() {
        if (dirty) {
          cache = getter();
          dirty = false;
        }
        return cache;
      },
    };
  }),
}));

// Helper to create a mock component
function createMockComponent(): EnhancedComponent {
  const component = {
    update: vi.fn(),
    __composables__: {
      states: new Map(),
      effects: new Map(),
      watchers: new Map(),
      computed: new Map(),
      cleanups: [],
    },
  } as any;

  // Simulate plugin installation
  installComposables();

  // Add $computed method (normally added by plugin)
  component.$computed = function <T>(getter: () => T): { readonly value: T } {
    return createComputed(this, getter);
  };

  return component;
}

describe('composables/useComputed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call component.$computed', () => {
    const component = createMockComponent();
    const spy = vi.spyOn(component, '$computed');
    const getter = () => 10;

    useComputed(component, getter);

    expect(spy).toHaveBeenCalledWith(getter);
  });

  it('should call createComputed internally', () => {
    const component = createMockComponent();
    const getter = () => 10;

    useComputed(component, getter);

    expect(createComputed).toHaveBeenCalledWith(component, getter);
  });

  it('should return computed value object', () => {
    const component = createMockComponent();
    const getter = () => 42;

    const computed = useComputed(component, getter);

    expect(computed.value).toBe(42);
  });

  it('should cache computed values', () => {
    const component = createMockComponent();
    const getter = vi.fn(() => 10);

    const computed = useComputed(component, getter);

    // Access value multiple times
    const val1 = computed.value;
    const val2 = computed.value;
    const val3 = computed.value;

    expect(val1).toBe(10);
    expect(val2).toBe(10);
    expect(val3).toBe(10);

    // Getter should only be called once due to caching
    expect(getter).toHaveBeenCalledTimes(1);
  });

  it('should work with different return types', () => {
    const component = createMockComponent();

    const numberComputed = useComputed(component, () => 42);
    expect(numberComputed.value).toBe(42);

    const stringComputed = useComputed(component, () => 'hello');
    expect(stringComputed.value).toBe('hello');

    const booleanComputed = useComputed(component, () => true);
    expect(booleanComputed.value).toBe(true);

    const arrayComputed = useComputed(component, () => [1, 2, 3]);
    expect(arrayComputed.value).toEqual([1, 2, 3]);

    const objectComputed = useComputed(component, () => ({ key: 'value' }));
    expect(objectComputed.value).toEqual({ key: 'value' });
  });

  it('should compute based on reactive state', () => {
    const component = createMockComponent();
    const state = { count: 5 };

    const doubled = useComputed(component, () => state.count * 2);

    expect(doubled.value).toBe(10);
  });

  it('should handle complex computations', () => {
    const component = createMockComponent();
    const state = {
      items: [1, 2, 3, 4, 5],
      multiplier: 2,
    };

    const total = useComputed(component, () => {
      return (
        state.items.reduce((sum, item) => sum + item, 0) * state.multiplier
      );
    });

    expect(total.value).toBe(30); // (1+2+3+4+5) * 2
  });

  it('should support multiple computed values', () => {
    const component = createMockComponent();
    const state = { count: 10 };

    const doubled = useComputed(component, () => state.count * 2);
    const tripled = useComputed(component, () => state.count * 3);
    const squared = useComputed(component, () => state.count ** 2);

    expect(doubled.value).toBe(20);
    expect(tripled.value).toBe(30);
    expect(squared.value).toBe(100);
  });

  it('should have readonly value property', () => {
    const component = createMockComponent();
    const computed = useComputed(component, () => 10);

    // TypeScript prevents this at compile time
    // At runtime, trying to set should fail
    expect(() => {
      (computed as any).value = 20;
    }).toThrow();
  });

  it('should handle getter that throws', () => {
    const component = createMockComponent();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Override mock to actually throw
    (createComputed as any).mockImplementationOnce(
      (component: any, getter: any) => {
        return {
          get value() {
            try {
              return getter();
            } catch (error) {
              console.error(
                '[riot-composables] Error in computed getter:',
                error,
              );
              throw error;
            }
          },
        };
      },
    );

    const getter = () => {
      throw new Error('Computation error');
    };

    const computed = useComputed(component, getter);

    expect(() => {
      const _ = computed.value;
    }).toThrow('Computation error');

    consoleError.mockRestore();
  });

  it('should work with chained computations', () => {
    const component = createMockComponent();
    const state = { base: 5 };

    const doubled = useComputed(component, () => state.base * 2);
    const quadrupled = useComputed(component, () => doubled.value * 2);

    expect(quadrupled.value).toBe(20);
  });
});
