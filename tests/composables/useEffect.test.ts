import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useEffect,
  useMount,
  useUnmount,
} from '../../src/composables/useEffect';
import { installComposables } from '../../src/core/plugin';
import { createEffect } from '../../src/core/effect';
import type {
  EnhancedComponent,
  EffectFunction,
  DepsGetter,
} from '../../src/types';

// Mock createEffect
vi.mock('../../src/core/effect', () => ({
  createEffect: vi.fn(),
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

  // Add $effect method (normally added by plugin)
  component.$effect = function (
    effect: EffectFunction,
    deps?: DepsGetter,
  ): void {
    createEffect(this, effect, deps);
  };

  return component;
}

describe('composables/useEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEffect', () => {
    it('should call component.$effect', () => {
      const component = createMockComponent();
      const spy = vi.spyOn(component, '$effect');
      const effect = vi.fn();

      useEffect(component, effect);

      expect(spy).toHaveBeenCalledWith(effect, undefined);
    });

    it('should pass dependencies to $effect', () => {
      const component = createMockComponent();
      const spy = vi.spyOn(component, '$effect');
      const effect = vi.fn();
      const deps = () => [1, 2, 3];

      useEffect(component, effect, deps);

      expect(spy).toHaveBeenCalledWith(effect, deps);
    });

    it('should call createEffect internally', () => {
      const component = createMockComponent();
      const effect = vi.fn();

      useEffect(component, effect);

      expect(createEffect).toHaveBeenCalledWith(component, effect, undefined);
    });

    it('should call createEffect with dependencies', () => {
      const component = createMockComponent();
      const effect = vi.fn();
      const deps = () => [1, 2];

      useEffect(component, effect, deps);

      expect(createEffect).toHaveBeenCalledWith(component, effect, deps);
    });

    it('should work without dependencies', () => {
      const component = createMockComponent();
      const effect = vi.fn();

      expect(() => {
        useEffect(component, effect);
      }).not.toThrow();
    });

    it('should accept effect that returns cleanup', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();
      const effect = () => cleanup;

      useEffect(component, effect);

      expect(createEffect).toHaveBeenCalledWith(component, effect, undefined);
    });

    it('should accept effect that returns void', () => {
      const component = createMockComponent();
      const effect = () => {
        console.log('effect');
      };

      useEffect(component, effect);

      expect(createEffect).toHaveBeenCalledWith(component, effect, undefined);
    });
  });

  describe('useMount', () => {
    it('should call useEffect with empty deps', () => {
      const component = createMockComponent();
      const effect = vi.fn();

      useMount(component, effect);

      expect(createEffect).toHaveBeenCalledWith(
        component,
        effect,
        expect.any(Function),
      );

      // Verify deps getter returns empty array
      const call = (createEffect as any).mock.calls[0];
      const depsGetter = call[2];
      expect(depsGetter()).toEqual([]);
    });

    it('should only run once on mount', () => {
      const component = createMockComponent();
      const effect = vi.fn();

      useMount(component, effect);

      // Verify it's called with empty deps (meaning it only runs on mount)
      const call = (createEffect as any).mock.calls[0];
      const depsGetter = call[2];
      expect(depsGetter()).toEqual([]);
    });

    it('should support cleanup function', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();
      const effect = () => cleanup;

      useMount(component, effect);

      expect(createEffect).toHaveBeenCalled();
    });

    it('should work without cleanup', () => {
      const component = createMockComponent();
      const effect = vi.fn();

      useMount(component, effect);

      expect(createEffect).toHaveBeenCalled();
    });
  });

  describe('useUnmount', () => {
    it('should call useEffect with cleanup wrapper', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();

      useUnmount(component, cleanup);

      expect(createEffect).toHaveBeenCalled();

      // Get the effect function and verify it returns the cleanup
      const call = (createEffect as any).mock.calls[0];
      const effectFn = call[1];
      const returnedCleanup = effectFn();

      expect(returnedCleanup).toBe(cleanup);
    });

    it('should only run cleanup on unmount', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();

      useUnmount(component, cleanup);

      // Verify it's called with empty deps (meaning it only runs on mount)
      const call = (createEffect as any).mock.calls[0];
      const depsGetter = call[2];
      expect(depsGetter()).toEqual([]);
    });

    it('should wrap cleanup in effect function', () => {
      const component = createMockComponent();
      const cleanup = vi.fn();

      useUnmount(component, cleanup);

      // Get the effect function
      const call = (createEffect as any).mock.calls[0];
      const effectFn = call[1];

      // Effect function should return the cleanup
      expect(typeof effectFn).toBe('function');
      expect(effectFn()).toBe(cleanup);
    });

    it('should handle multiple unmount hooks', () => {
      const component = createMockComponent();
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      useUnmount(component, cleanup1);
      useUnmount(component, cleanup2);

      expect(createEffect).toHaveBeenCalledTimes(2);
    });
  });

  describe('effect lifecycle', () => {
    it('should allow combining useEffect, useMount, and useUnmount', () => {
      const component = createMockComponent();
      const effect1 = vi.fn();
      const effect2 = vi.fn();
      const cleanup = vi.fn();

      useEffect(component, effect1);
      useMount(component, effect2);
      useUnmount(component, cleanup);

      expect(createEffect).toHaveBeenCalledTimes(3);
    });

    it('should maintain separate effect instances', () => {
      const component = createMockComponent();
      const effect1 = vi.fn();
      const effect2 = vi.fn();

      useEffect(component, effect1, () => [1]);
      useEffect(component, effect2, () => [2]);

      expect(createEffect).toHaveBeenCalledTimes(2);

      // Verify they have different dependencies
      const call1 = (createEffect as any).mock.calls[0];
      const call2 = (createEffect as any).mock.calls[1];

      expect(call1[2]()).toEqual([1]);
      expect(call2[2]()).toEqual([2]);
    });
  });
});
