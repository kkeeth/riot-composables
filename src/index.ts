/**
 * riot-composables
 * Composables library for Riot.js
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Plugin
// ============================================================================

export {
  installComposables,
  uninstallComposables,
  isComposablesInstalled,
} from './core/plugin';

// ============================================================================
// Core Functions
// ============================================================================
// These are lower-level functions used internally by composables
// Most users will use the composables API instead

export { createReactive, isReactive, toRaw } from './core/reactive';

export { createEffect } from './core/effect';

export { createComputed, createComputedObject } from './core/computed';

export {
  createWatch,
  createWatchMultiple,
  createWatchObject,
} from './core/watch';

// ============================================================================
// Composables (Main API)
// ============================================================================

export { useReactive } from './composables/useReactive';

export { useEffect, useMount, useUnmount } from './composables/useEffect';

export { useComputed } from './composables/useComputed';

export { useWatch } from './composables/useWatch';

// ============================================================================
// TypeScript Types
// ============================================================================

export type {
  // Component types
  EnhancedComponent,
  ComposablesContext,

  // Function types
  Composable,
  ComposablesPlugin,

  // Effect types
  EffectFunction,
  EffectCleanup,
  EffectData,
  DepsGetter,

  // Computed types
  ComputedData,

  // Watch types
  WatchCallback,
  WatchData,
} from './types';
