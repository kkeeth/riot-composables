import { describe, it, expect, vi } from 'vitest';
import {
  createWatch,
  createWatchMultiple,
  createWatchObject,
} from '../../src/core/watch';
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

describe('core/watch', () => {
  describe('createWatch', () => {
    it('should create a watcher', () => {
      const component = createMockComponent();
      const getter = vi.fn(() => 5);
      const callback = vi.fn();

      createWatch(component, getter, callback);

      expect(component.__composables__.watchers.size).toBe(1);
      expect(getter).toHaveBeenCalledTimes(1); // Called to get initial value
    });

    it('should store initial value', () => {
      const component = createMockComponent();
      const getter = () => 10;
      const callback = vi.fn();

      createWatch(component, getter, callback);

      const watchData = Array.from(component.__composables__.watchers.values())[0];
      expect(watchData.oldValue).toBe(10);
    });

    it('should store getter and callback', () => {
      const component = createMockComponent();
      const getter = () => 5;
      const callback = vi.fn();

      createWatch(component, getter, callback);

      const watchData = Array.from(component.__composables__.watchers.values())[0];
      expect(watchData.getter).toBe(getter);
      expect(watchData.callback).toBe(callback);
    });

    it('should handle errors in getter', () => {
      const component = createMockComponent();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getter = vi.fn(() => {
        throw new Error('Getter error');
      });
      const callback = vi.fn();

      createWatch(component, getter, callback);

      expect(consoleError).toHaveBeenCalledWith(
        '[riot-composables] Error in watch getter:',
        expect.any(Error)
      );
      expect(component.__composables__.watchers.size).toBe(0);

      consoleError.mockRestore();
    });

    it('should watch different types of values', () => {
      const component = createMockComponent();

      createWatch(component, () => 42, vi.fn());
      createWatch(component, () => 'string', vi.fn());
      createWatch(component, () => true, vi.fn());
      createWatch(component, () => ({ key: 'value' }), vi.fn());
      createWatch(component, () => [1, 2, 3], vi.fn());

      expect(component.__composables__.watchers.size).toBe(5);
    });

    it('should create multiple watchers independently', () => {
      const component = createMockComponent();
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      createWatch(component, () => 1, callback1);
      createWatch(component, () => 2, callback2);

      expect(component.__composables__.watchers.size).toBe(2);
    });
  });

  describe('createWatchMultiple', () => {
    it('should create multiple watchers at once', () => {
      const component = createMockComponent();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      createWatchMultiple(component, [
        [() => 1, callback1],
        [() => 2, callback2],
        [() => 3, callback3],
      ]);

      expect(component.__composables__.watchers.size).toBe(3);
    });

    it('should handle empty array', () => {
      const component = createMockComponent();

      createWatchMultiple(component, []);

      expect(component.__composables__.watchers.size).toBe(0);
    });

    it('should store correct initial values', () => {
      const component = createMockComponent();

      createWatchMultiple(component, [
        [() => 10, vi.fn()],
        [() => 20, vi.fn()],
      ]);

      const watchers = Array.from(component.__composables__.watchers.values());
      expect(watchers[0].oldValue).toBe(10);
      expect(watchers[1].oldValue).toBe(20);
    });

    it('should work with reactive state', () => {
      const component = createMockComponent();
      const state = { count: 5, name: 'John' };

      createWatchMultiple(component, [
        [() => state.count, vi.fn()],
        [() => state.name, vi.fn()],
      ]);

      const watchers = Array.from(component.__composables__.watchers.values());
      expect(watchers[0].oldValue).toBe(5);
      expect(watchers[1].oldValue).toBe('John');
    });
  });

  describe('createWatchObject', () => {
    it('should create a watcher for an object', () => {
      const component = createMockComponent();
      const getter = () => ({ count: 5 });
      const callback = vi.fn();

      createWatchObject(component, getter, callback);

      expect(component.__composables__.watchers.size).toBe(1);
    });

    it('should store initial object value', () => {
      const component = createMockComponent();
      const obj = { count: 10, name: 'Test' };
      const getter = () => obj;
      const callback = vi.fn();

      createWatchObject(component, getter, callback);

      const watchData = Array.from(component.__composables__.watchers.values())[0];
      expect(watchData.oldValue).toBe(obj);
    });

    it('should warn about deep watching', () => {
      const component = createMockComponent();
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const getter = () => ({ count: 5 });
      const callback = vi.fn();

      createWatchObject(component, getter, callback, { deep: true });

      expect(consoleWarn).toHaveBeenCalledWith(
        '[riot-composables] Deep watching is not yet implemented'
      );

      consoleWarn.mockRestore();
    });

    it('should not warn when deep option is false', () => {
      const component = createMockComponent();
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const getter = () => ({ count: 5 });
      const callback = vi.fn();

      createWatchObject(component, getter, callback, { deep: false });

      expect(consoleWarn).not.toHaveBeenCalled();

      consoleWarn.mockRestore();
    });

    it('should work without options', () => {
      const component = createMockComponent();
      const getter = () => ({ count: 5 });
      const callback = vi.fn();

      createWatchObject(component, getter, callback);

      expect(component.__composables__.watchers.size).toBe(1);
    });

    it('should handle complex objects', () => {
      const component = createMockComponent();
      const obj = {
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
        active: true,
      };
      const getter = () => obj;
      const callback = vi.fn();

      createWatchObject(component, getter, callback);

      const watchData = Array.from(component.__composables__.watchers.values())[0];
      expect(watchData.oldValue).toBe(obj);
    });
  });
});
