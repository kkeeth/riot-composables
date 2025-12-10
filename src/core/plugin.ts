/**
 * Core plugin that integrates composables support into Riot.js
 * This uses riot.install() to globally enhance all components
 */

import { install, uninstall } from 'riot';
import type { RiotComponent } from 'riot';
import type {
  ComposablesPlugin,
  ComposablesContext,
  EnhancedComponent,
  WatchCallback,
} from '../types';
import { createReactive } from './reactive';
import { createEffect } from './effect';
import { createComputed } from './computed';
import { createWatch } from './watch';

/**
 * Flag to track if plugin is installed
 */
let isInstalled = false;

/**
 * Reference to the plugin function for uninstall
 */
let pluginRef: ComposablesPlugin | null = null;

/**
 * Main plugin function that enhances each Riot component
 */
/* istanbul ignore next -- @preserve */
const composablesPlugin: ComposablesPlugin = function (
  component: RiotComponent,
): RiotComponent {
  // Initialize composables context
  const context: ComposablesContext['__composables__'] = {
    states: new Map(),
    effects: new Map(),
    computed: new Map(),
    watchers: new Map(),
    cleanups: [],
  };

  // Attach context to component
  Object.defineProperty(component, '__composables__', {
    value: context,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  const enhancedComponent = component as EnhancedComponent;

  // Add $reactive helper
  enhancedComponent.$reactive = function <T extends object>(
    initialState: T,
  ): T {
    return createReactive(this, initialState);
  };

  // Add $effect helper
  enhancedComponent.$effect = function (effect, deps) {
    createEffect(this, effect, deps);
  };

  // Add $computed helper
  enhancedComponent.$computed = function <T>(getter: () => T) {
    return createComputed(this, getter);
  };

  // Add $watch helper
  enhancedComponent.$watch = function <T>(
    getter: () => T,
    callback: WatchCallback<T>,
  ) {
    createWatch(this, getter, callback);
  };

  // Wrap lifecycle hooks for cleanup and update tracking
  const originalOnBeforeUpdate = component.onBeforeUpdate;
  const originalOnBeforeUnmount = component.onBeforeUnmount;
  const originalOnUnmounted = component.onUnmounted;

  enhancedComponent.onBeforeUpdate = function (props, state) {
    // Mark all computed values as dirty
    context.computed.forEach((computedData: any) => {
      computedData.dirty = true;
    });

    // Check watchers for changes
    context.watchers.forEach((watchData: any) => {
      try {
        const newValue = watchData.getter();
        if (!Object.is(newValue, watchData.oldValue)) {
          const prevValue = watchData.oldValue;
          watchData.oldValue = newValue;

          try {
            watchData.callback(newValue, prevValue);
          } catch (error) {
            console.error('[riot-composables] Error in watch callback:', error);
          }
        }
      } catch (error) {
        console.error('[riot-composables] Error in watch getter:', error);
      }
    });

    // Check effects for dependency changes
    context.effects.forEach((effectData: any) => {
      if (effectData.deps && effectData.depsGetter) {
        const newDeps = effectData.depsGetter();
        const hasChanged =
          !effectData.deps ||
          effectData.deps.length !== newDeps.length ||
          newDeps.some(
            (dep: any, i: number) => !Object.is(dep, effectData.deps![i]),
          );

        if (hasChanged) {
          effectData.deps = newDeps;

          // Run cleanup from previous effect if exists
          if (effectData.cleanup) {
            try {
              effectData.cleanup();
            } catch (error) {
              console.error(
                '[riot-composables] Error in effect cleanup:',
                error,
              );
            }
          }

          // Run the effect
          try {
            const cleanup = effectData.effect();
            if (typeof cleanup === 'function') {
              effectData.cleanup = cleanup;
            }
          } catch (error) {
            console.error('[riot-composables] Error in effect:', error);
          }
        }
      }
    });

    // Call original hook if exists
    if (originalOnBeforeUpdate) {
      return originalOnBeforeUpdate.call(this, props, state);
    }
  };

  enhancedComponent.onBeforeUnmount = function (props, state) {
    // Run all registered cleanups
    context.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error('[riot-composables] Error in cleanup:', error);
      }
    });

    // Call original hook if exists
    if (originalOnBeforeUnmount) {
      return originalOnBeforeUnmount.call(this, props, state);
    }
  };

  enhancedComponent.onUnmounted = function (props, state) {
    // Clear all maps
    context.states.clear();
    context.effects.clear();
    context.computed.clear();
    context.watchers.clear();
    context.cleanups.length = 0;

    // Call original hook if exists
    if (originalOnUnmounted) {
      return originalOnUnmounted.call(this, props, state);
    }
  };

  return enhancedComponent;
};
/* istanbul ignore stop */

/**
 * Install the composables plugin globally
 * This should be called once at application startup
 */
export function installComposables(): void {
  if (isInstalled) {
    console.warn('[riot-composables] Plugin is already installed');
    return;
  }

  pluginRef = composablesPlugin;
  install(pluginRef);
  isInstalled = true;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[riot-composables] Plugin installed successfully');
  }
}

/**
 * Uninstall the composables plugin
 * Useful for testing or hot module replacement
 */
export function uninstallComposables(): void {
  if (!isInstalled || !pluginRef) {
    console.warn('[riot-composables] Plugin is not installed');
    return;
  }

  uninstall(pluginRef);
  isInstalled = false;
  pluginRef = null;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[riot-composables] Plugin uninstalled');
  }
}

/**
 * Check if composables plugin is installed
 */
export function isComposablesInstalled(): boolean {
  return isInstalled;
}
