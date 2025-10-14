/**
 * Riot.js Composables Type Definitions
 */

import type { RiotComponent as BaseRiotComponent } from 'riot';

/**
 * Effect cleanup function
 */
export type EffectCleanup = () => void;

/**
 * Effect function that may return a cleanup function
 */
export type EffectFunction = () => void | EffectCleanup;

/**
 * Dependency array getter function
 */
export type DepsGetter = () => any[];

/**
 * Effect data stored internally
 */
export interface EffectData {
  effect: EffectFunction;
  deps?: any[];
  cleanup?: EffectCleanup;
}

/**
 * Computed value data
 */
export interface ComputedData<T = any> {
  getter: () => T;
  cache?: T;
  dirty: boolean;
}

/**
 * Watcher callback
 */
export type WatchCallback<T = any> = (newValue: T, oldValue: T) => void;

/**
 * Watcher data
 */
export interface WatchData<T = any> {
  getter: () => T;
  callback: WatchCallback<T>;
  oldValue?: T;
}

/**
 * Internal composables context attached to each component
 */
export interface ComposablesContext {
  __composables__: {
    states: Map<symbol, any>;
    effects: Map<symbol, EffectData>;
    computed: Map<symbol, ComputedData>;
    watchers: Map<symbol, WatchData>;
    cleanups: Array<() => void>;
  };
}

/**
 * Enhanced Riot component with composables support
 */
export interface EnhancedComponent
  extends BaseRiotComponent,
    ComposablesContext {
  /**
   * Create a reactive state object
   */
  $reactive<T extends object>(initialState: T): T;

  /**
   * Register a side effect
   */
  $effect(effect: EffectFunction, deps?: DepsGetter): void;

  /**
   * Create a computed value
   */
  $computed<T>(getter: () => T): { readonly value: T };

  /**
   * Watch a value and react to changes
   */
  $watch<T>(getter: () => T, callback: WatchCallback<T>): void;
}

/**
 * Composable function type
 */
export type Composable<Args extends any[] = any[], Return = any> = (
  component: EnhancedComponent,
  ...args: Args
) => Return;

/**
 * Plugin function for riot.install
 */
export type ComposablesPlugin = (
  component: BaseRiotComponent,
) => BaseRiotComponent;
