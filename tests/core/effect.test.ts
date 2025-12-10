import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEffect } from '../../src/core/effect';
import type { EnhancedComponent } from '../../src/types';

// Helper to create a mock component
function createMockComponent(): EnhancedComponent {
  return {
    update: vi.fn(),
    onMounted: undefined,
    __composables__: {
      states: new Map(),
      effects: new Map(),
      watchers: new Map(),
      computed: new Map(),
      cleanups: [],
    },
  } as any;
}

describe('core/effect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEffect', () => {
    it('should create an effect that runs on mount', () => {
      const component = createMockComponent();
      const effectFn = vi.fn();

      createEffect(component, effectFn);

      // Effect should not run immediately
      expect(effectFn).not.toHaveBeenCalled();

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      // Effect should run on mount
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    it('should store cleanup function from effect', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();
      const effectFn = vi.fn(() => cleanup);

      createEffect(component, effectFn);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(effectFn).toHaveBeenCalled();
      expect(component.__composables__.cleanups).toHaveLength(1);
    });

    it('should run cleanup function before running effect again', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();
      const effectFn = vi.fn(() => cleanup);

      createEffect(component, effectFn);

      // First mount
      component.onMounted?.call(component, {}, {});
      expect(effectFn).toHaveBeenCalledTimes(1);
      expect(cleanup).not.toHaveBeenCalled();

      // Get the effect data to simulate re-running
      const effectData = Array.from(component.__composables__.effects.values())[0];

      // Simulate second mount by calling onMounted again
      // This would normally happen during component lifecycle
      component.onMounted?.call(component, {}, {});

      // The cleanup from first effect should have been called
      // and effect should have run again
      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(effectFn).toHaveBeenCalledTimes(2);
    });

    it('should handle effect without cleanup function', () => {
      const component = createMockComponent();
      const effectFn = vi.fn(() => undefined);

      createEffect(component, effectFn);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    it('should support dependencies', () => {
      const component = createMockComponent();
      const effectFn = vi.fn();
      const deps = vi.fn(() => [1, 2, 3]);

      createEffect(component, effectFn, deps);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(effectFn).toHaveBeenCalled();
      expect(deps).toHaveBeenCalled();

      // Check that deps are stored
      const effectData = Array.from(component.__composables__.effects.values())[0];
      expect(effectData.deps).toEqual([1, 2, 3]);
    });

    it('should preserve existing onMounted hook', () => {
      const component = createMockComponent();
      const originalOnMounted = vi.fn();
      component.onMounted = originalOnMounted;

      const effectFn = vi.fn();
      createEffect(component, effectFn);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(effectFn).toHaveBeenCalled();
      expect(originalOnMounted).toHaveBeenCalled();
    });

    it('should catch and log errors in effect function', () => {
      const component = createMockComponent();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const effectFn = vi.fn(() => {
        throw new Error('Effect error');
      });

      createEffect(component, effectFn);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(consoleError).toHaveBeenCalledWith(
        '[riot-composables] Error in effect:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it('should catch and log errors in cleanup function', () => {
      const component = createMockComponent();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const cleanup = vi.fn(() => {
        throw new Error('Cleanup error');
      });
      const effectFn = vi.fn(() => cleanup);

      createEffect(component, effectFn);

      // First mount
      component.onMounted?.call(component, {}, {});

      // Run onMounted again to trigger cleanup of previous effect
      component.onMounted?.call(component, {}, {});

      expect(consoleError).toHaveBeenCalledWith(
        '[riot-composables] Error in effect cleanup:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it('should register cleanup in component cleanups array', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();
      const effectFn = vi.fn(() => cleanup);

      createEffect(component, effectFn);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      expect(component.__composables__.cleanups).toHaveLength(1);

      // Execute registered cleanup
      component.__composables__.cleanups[0]();

      expect(cleanup).toHaveBeenCalled();
    });

    it('should handle multiple effects on the same component', () => {
      const component = createMockComponent();
      const effect1 = vi.fn();
      const effect2 = vi.fn();

      createEffect(component, effect1);
      createEffect(component, effect2);

      // Simulate mounting
      component.onMounted?.call(component, {}, {});

      // Both effects should run
      expect(effect1).toHaveBeenCalled();
      expect(effect2).toHaveBeenCalled();
    });

    it('should store depsGetter for plugin usage', () => {
      const component = createMockComponent();
      const effectFn = vi.fn();
      const depsGetter = vi.fn(() => [1, 2]);

      createEffect(component, effectFn, depsGetter);

      const effectData = Array.from(component.__composables__.effects.values())[0];
      expect(effectData.depsGetter).toBe(depsGetter);
    });
  });
});
