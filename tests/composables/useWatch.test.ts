import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWatch } from '../../src/composables/useWatch';
import { installComposables } from '../../src/core/plugin';
import { createWatch } from '../../src/core/watch';
import type { EnhancedComponent, WatchCallback } from '../../src/types';

// Mock createWatch
vi.mock('../../src/core/watch', () => ({
  createWatch: vi.fn(),
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

  // Add $watch method (normally added by plugin)
  component.$watch = function <T>(
    getter: () => T,
    callback: WatchCallback<T>,
  ): void {
    createWatch(this, getter, callback);
  };

  return component;
}

describe('composables/useWatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call component.$watch', () => {
    const component = createMockComponent();
    const spy = vi.spyOn(component, '$watch');
    const getter = () => 5;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(spy).toHaveBeenCalledWith(getter, callback);
  });

  it('should call createWatch internally', () => {
    const component = createMockComponent();
    const getter = () => 5;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should watch primitive values', () => {
    const component = createMockComponent();
    const getter = () => 42;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should watch reactive state properties', () => {
    const component = createMockComponent();
    const state = { count: 0 };
    const getter = () => state.count;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should accept callback with newVal and oldVal parameters', () => {
    const component = createMockComponent();
    const getter = () => 10;
    const callback = vi.fn((newVal: number, oldVal: number) => {
      console.log(`Changed from ${oldVal} to ${newVal}`);
    });

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should work with different value types', () => {
    const component = createMockComponent();

    useWatch(component, () => 42, vi.fn());
    useWatch(component, () => 'hello', vi.fn());
    useWatch(component, () => true, vi.fn());
    useWatch(component, () => [1, 2, 3], vi.fn());
    useWatch(component, () => ({ key: 'value' }), vi.fn());

    expect(createWatch).toHaveBeenCalledTimes(5);
  });

  it('should support multiple watchers on same component', () => {
    const component = createMockComponent();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    useWatch(component, () => 1, callback1);
    useWatch(component, () => 2, callback2);

    expect(createWatch).toHaveBeenCalledTimes(2);
  });

  it('should watch computed values', () => {
    const component = createMockComponent();
    const state = { count: 5 };
    const computed = { value: state.count * 2 };
    const getter = () => computed.value;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should watch nested properties', () => {
    const component = createMockComponent();
    const state = { user: { name: 'John', age: 30 } };
    const getter = () => state.user.name;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should watch array length', () => {
    const component = createMockComponent();
    const state = { items: [1, 2, 3] };
    const getter = () => state.items.length;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should watch complex expressions', () => {
    const component = createMockComponent();
    const state = { a: 5, b: 10 };
    const getter = () => state.a + state.b;
    const callback = vi.fn();

    useWatch(component, getter, callback);

    expect(createWatch).toHaveBeenCalledWith(component, getter, callback);
  });

  it('should allow multiple watchers for different properties', () => {
    const component = createMockComponent();
    const state = { count: 0, name: 'John', active: true };

    useWatch(component, () => state.count, vi.fn());
    useWatch(component, () => state.name, vi.fn());
    useWatch(component, () => state.active, vi.fn());

    expect(createWatch).toHaveBeenCalledTimes(3);
  });

  it('should pass correct arguments to createWatch', () => {
    const component = createMockComponent();
    const getter = () => 'test';
    const callback = vi.fn();

    useWatch(component, getter, callback);

    const call = (createWatch as any).mock.calls[0];
    expect(call[0]).toBe(component);
    expect(call[1]).toBe(getter);
    expect(call[2]).toBe(callback);
  });

  it('should handle callback with side effects', () => {
    const component = createMockComponent();
    const state = { count: 0 };
    const sideEffect = vi.fn();
    const callback = (newVal: number, oldVal: number) => {
      sideEffect(newVal, oldVal);
    };

    useWatch(component, () => state.count, callback);

    expect(createWatch).toHaveBeenCalledWith(
      component,
      expect.any(Function),
      callback,
    );
  });

  it('should work with TypeScript type inference', () => {
    const component = createMockComponent();
    const state = { count: 0 };

    // TypeScript should infer T as number
    useWatch(
      component,
      () => state.count,
      (newVal, oldVal) => {
        // TypeScript will enforce that newVal and oldVal are numbers
        expect(typeof newVal).toBe('number');
        expect(typeof oldVal).toBe('number');
      },
    );

    expect(createWatch).toHaveBeenCalled();
  });
});
