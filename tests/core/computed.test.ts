import { describe, it, expect, vi } from 'vitest';
import { createComputed, createComputedObject } from '../../src/core/computed';
import type { EnhancedComponent } from '../../src/types';

// Helper to create a mock component
function createMockComponent(): EnhancedComponent {
  return {
    update: vi.fn(),
    __composables__: {
      states: new Map(),
      effects: new Map(),
      watchers: new Map(),
      computed: new Map(),
      cleanups: [],
    },
  } as any;
}

describe('core/computed', () => {
  describe('createComputed', () => {
    it('should create a computed value', () => {
      const component = createMockComponent();
      const getter = vi.fn(() => 10);

      const computed = createComputed(component, getter);

      expect(computed.value).toBe(10);
      expect(getter).toHaveBeenCalledTimes(1);
    });

    it('should cache computed value', () => {
      const component = createMockComponent();
      const getter = vi.fn(() => 10);

      const computed = createComputed(component, getter);

      // First access
      const value1 = computed.value;
      // Second access
      const value2 = computed.value;

      expect(value1).toBe(10);
      expect(value2).toBe(10);
      // Getter should only be called once due to caching
      expect(getter).toHaveBeenCalledTimes(1);
    });

    it('should recompute when marked as dirty', () => {
      const component = createMockComponent();
      let count = 0;
      const getter = vi.fn(() => ++count);

      const computed = createComputed(component, getter);

      // First access
      expect(computed.value).toBe(1);
      expect(getter).toHaveBeenCalledTimes(1);

      // Mark as dirty
      const computedData = Array.from(component.__composables__.computed.values())[0];
      computedData.dirty = true;

      // Second access after marking dirty
      expect(computed.value).toBe(2);
      expect(getter).toHaveBeenCalledTimes(2);
    });

    it('should compute with reactive dependencies', () => {
      const component = createMockComponent();
      const state = { count: 5 };
      const getter = vi.fn(() => state.count * 2);

      const doubled = createComputed(component, getter);

      expect(doubled.value).toBe(10);

      // Change state
      state.count = 10;

      // Mark as dirty (normally done by plugin)
      const computedData = Array.from(component.__composables__.computed.values())[0];
      computedData.dirty = true;

      expect(doubled.value).toBe(20);
    });

    it('should be readonly', () => {
      const component = createMockComponent();
      const computed = createComputed(component, () => 10);

      // TypeScript will prevent this at compile time,
      // but at runtime it should not have a setter
      expect(() => {
        (computed as any).value = 20;
      }).toThrow();
    });

    it('should catch and log errors in getter', () => {
      const component = createMockComponent();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getter = vi.fn(() => {
        throw new Error('Getter error');
      });

      const computed = createComputed(component, getter);

      expect(() => {
        const _ = computed.value;
      }).toThrow('Getter error');

      expect(consoleError).toHaveBeenCalledWith(
        '[riot-composables] Error in computed getter:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it('should handle complex computations', () => {
      const component = createMockComponent();
      const state = { items: [1, 2, 3, 4, 5] };
      const getter = vi.fn(() => state.items.reduce((sum, item) => sum + item, 0));

      const sum = createComputed(component, getter);

      expect(sum.value).toBe(15);
    });

    it('should store computed data in component', () => {
      const component = createMockComponent();
      const getter = () => 10;

      createComputed(component, getter);

      expect(component.__composables__.computed.size).toBe(1);
      const computedData = Array.from(component.__composables__.computed.values())[0];
      expect(computedData.getter).toBe(getter);
      expect(computedData.dirty).toBe(true);
    });
  });

  describe('createComputedObject', () => {
    it('should create multiple computed values', () => {
      const component = createMockComponent();
      const state = { count: 5 };

      const computed = createComputedObject(component, {
        doubled: () => state.count * 2,
        tripled: () => state.count * 3,
      });

      expect(computed.doubled.value).toBe(10);
      expect(computed.tripled.value).toBe(15);
    });

    it('should cache each computed value independently', () => {
      const component = createMockComponent();
      const getter1 = vi.fn(() => 10);
      const getter2 = vi.fn(() => 20);

      const computed = createComputedObject(component, {
        first: getter1,
        second: getter2,
      });

      // Access first twice
      computed.first.value;
      computed.first.value;

      // Access second once
      computed.second.value;

      expect(getter1).toHaveBeenCalledTimes(1);
      expect(getter2).toHaveBeenCalledTimes(1);
    });

    it('should handle empty object', () => {
      const component = createMockComponent();

      const computed = createComputedObject(component, {});

      expect(Object.keys(computed)).toHaveLength(0);
    });

    it('should preserve key names', () => {
      const component = createMockComponent();

      const computed = createComputedObject(component, {
        foo: () => 1,
        bar: () => 2,
        baz: () => 3,
      });

      expect(Object.keys(computed)).toEqual(['foo', 'bar', 'baz']);
    });

    it('should work with different return types', () => {
      const component = createMockComponent();

      const computed = createComputedObject(component, {
        number: () => 42,
        string: () => 'hello',
        boolean: () => true,
        array: () => [1, 2, 3],
        object: () => ({ key: 'value' }),
      });

      expect(computed.number.value).toBe(42);
      expect(computed.string.value).toBe('hello');
      expect(computed.boolean.value).toBe(true);
      expect(computed.array.value).toEqual([1, 2, 3]);
      expect(computed.object.value).toEqual({ key: 'value' });
    });

    it('should create separate computed instances', () => {
      const component = createMockComponent();

      createComputedObject(component, {
        first: () => 1,
        second: () => 2,
      });

      expect(component.__composables__.computed.size).toBe(2);
    });
  });
});
