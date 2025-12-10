# API Documentation

Complete API reference for riot-composables.

## Table of Contents

- [Installation](#installation)
- [Core Functions](#core-functions)
  - [installComposables](#installcomposables)
  - [uninstallComposables](#uninstallcomposables)
  - [isComposablesInstalled](#iscomposablesinstalled)
- [Composables](#composables)
  - [useReactive](#usereactive)
  - [useEffect](#useeffect)
  - [useMount](#usemount)
  - [useUnmount](#useunmount)
  - [useComputed](#usecomputed)
  - [useWatch](#usewatch)
- [Low-Level Functions](#low-level-functions)
  - [createReactive](#createreactive)
  - [createEffect](#createeffect)
  - [createComputed](#createcomputed)
  - [createComputedObject](#createcomputedobject)
  - [createWatch](#createwatch)
  - [createWatchMultiple](#createwatchmultiple)
  - [createWatchObject](#createwatchobject)
  - [isReactive](#isreactive)
  - [toRaw](#toraw)
- [TypeScript Types](#typescript-types)
- [Enhanced Component Methods](#enhanced-component-methods)

---

## Installation

Install riot-composables globally at application startup:

```typescript
import { installComposables } from 'riot-composables';

// Install once at startup
installComposables();
```

---

## Core Functions

### installComposables

Installs the composables plugin globally for all Riot.js components.

**Signature:**

```typescript
function installComposables(): void;
```

**Usage:**

```typescript
import { installComposables } from 'riot-composables';

installComposables();
```

**Notes:**

- Must be called once at application startup before mounting any components
- Uses Riot's `install()` API to enhance all components
- Safe to call multiple times (shows warning if already installed)
- In development mode, logs confirmation message

---

### uninstallComposables

Uninstalls the composables plugin.

**Signature:**

```typescript
function uninstallComposables(): void;
```

**Usage:**

```typescript
import { uninstallComposables } from 'riot-composables';

uninstallComposables();
```

**Notes:**

- Useful for testing or hot module replacement scenarios
- Shows warning if plugin is not installed
- In development mode, logs confirmation message

---

### isComposablesInstalled

Checks if the composables plugin is currently installed.

**Signature:**

```typescript
function isComposablesInstalled(): boolean;
```

**Returns:**

- `true` if plugin is installed
- `false` if plugin is not installed

**Usage:**

```typescript
import { isComposablesInstalled } from 'riot-composables';

if (isComposablesInstalled()) {
  console.log('Plugin is ready to use');
}
```

---

## Composables

### useReactive

Creates a reactive state object that automatically triggers component updates when modified.

**Signature:**

```typescript
function useReactive<T extends object>(
  component: EnhancedComponent,
  initialState: T,
): T;
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `initialState` - Initial state object

**Returns:**

- Reactive proxy of the state object

**Usage:**

```riot
<counter>
  <h1>Count: {reactiveState.count}</h1>
  <button onclick={increment}>+</button>

  <script>
    import { useReactive } from 'riot-composables'

    export default {
      onBeforeMount() {
        const reactiveState = useReactive(this, { count: 0 })

        // IMPORTANT: Don't use 'this.state' - it's a special Riot.js property
        this.reactiveState = reactiveState
        this.increment = () => reactiveState.count++ // Auto-updates component
      }
    }
  </script>
</counter>
```

**Notes:**

- Changes to reactive state automatically trigger `component.update()`
- Supports nested objects with deep reactivity
- Supports property deletion with automatic updates
- DO NOT use `this.state` as the property name (it's a Riot.js reserved property)

---

### useEffect

Executes side effects with optional dependency tracking.

**Signature:**

```typescript
function useEffect(
  component: EnhancedComponent,
  effect: EffectFunction,
  deps?: DepsGetter,
): void;
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `effect` - Effect function to run (may return cleanup function)
- `deps` - Optional function that returns dependency array

**Types:**

```typescript
type EffectFunction = () => void | EffectCleanup;
type EffectCleanup = () => void;
type DepsGetter = () => any[];
```

**Usage:**

Run once on mount:

```typescript
useEffect(this, () => {
  console.log('Component mounted');

  return () => {
    console.log('Component unmounting');
  };
});
```

Run when dependencies change:

```typescript
const state = useReactive(this, { count: 0 });

useEffect(
  this,
  () => {
    document.title = `Count: ${state.count}`;

    // Optional cleanup
    return () => {
      document.title = 'Default Title';
    };
  },
  () => [state.count], // Re-run when count changes
);
```

**Notes:**

- Effects run on mount and when dependencies change
- Cleanup functions run before re-execution and on unmount
- If no `deps` provided, effect runs only on mount
- If `deps` provided, effect re-runs when any dependency changes (using `Object.is` comparison)

---

### useMount

Convenience wrapper for running effects only on component mount.

**Signature:**

```typescript
function useMount(
  component: EnhancedComponent,
  effect: () => void | (() => void),
): void;
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `effect` - Effect function to run on mount (may return cleanup function)

**Usage:**

```typescript
useMount(this, () => {
  console.log('Component mounted!');
  fetchData();
});
```

**Notes:**

- Equivalent to `useEffect(component, effect, () => [])`
- Runs only once on mount
- Can return cleanup function for unmount

---

### useUnmount

Convenience wrapper for running cleanup only on component unmount.

**Signature:**

```typescript
function useUnmount(component: EnhancedComponent, cleanup: () => void): void;
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `cleanup` - Cleanup function to run on unmount

**Usage:**

```typescript
useUnmount(this, () => {
  console.log('Cleaning up resources...');
  clearInterval(intervalId);
});
```

**Notes:**

- Equivalent to `useEffect(component, () => cleanup, () => [])`
- Runs only on unmount

---

### useComputed

Creates a cached computed value that automatically recalculates when accessed after dependencies change.

**Signature:**

```typescript
function useComputed<T>(
  component: EnhancedComponent,
  getter: () => T,
): { readonly value: T };
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `getter` - Function to compute the value

**Returns:**

- Object with readonly `value` property

**Usage:**

```riot
<shopping-cart>
  <p>Price: ${reactiveState.price}</p>
  <p>Quantity: {reactiveState.quantity}</p>
  <p>Tax Rate: {reactiveState.taxRate * 100}%</p>
  <h2>Total: ${total.value}</h2>

  <script>
    import { useReactive, useComputed } from 'riot-composables'

    export default {
      onBeforeMount() {
        const reactiveState = useReactive(this, {
          price: 10,
          quantity: 2,
          taxRate: 0.1
        })

        const total = useComputed(this, () => {
          const subtotal = reactiveState.price * reactiveState.quantity
          return (subtotal * (1 + reactiveState.taxRate)).toFixed(2)
        })

        this.reactiveState = reactiveState
        this.total = total
      }
    }
  </script>
</shopping-cart>
```

**Notes:**

- Computed values are cached until component updates
- Marked as "dirty" on each component update
- Only recalculates when `.value` is accessed and dirty flag is set
- Useful for expensive calculations
- Access via `.value` property in templates

---

### useWatch

Watches a value and executes a callback when it changes.

**Signature:**

```typescript
function useWatch<T>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
): void;
```

**Parameters:**

- `component` - The Riot component instance (use `this`)
- `getter` - Function to get the value to watch
- `callback` - Callback function called when value changes

**Types:**

```typescript
type WatchCallback<T> = (newValue: T, oldValue: T) => void;
```

**Usage:**

```typescript
const state = useReactive(this, { count: 0 });

useWatch(
  this,
  () => state.count,
  (newVal, oldVal) => {
    console.log(`Count changed from ${oldVal} to ${newVal}`);

    if (newVal > 10) {
      console.warn('Count is getting high!');
    }
  },
);
```

**Notes:**

- Watches are checked on component updates (in `onBeforeUpdate`)
- Uses `Object.is()` for value comparison
- Stores initial value when watch is created
- Callback receives both new and old values

---

## Low-Level Functions

These functions are used internally by the composables. Most users should use the high-level composables API instead.

### createReactive

Low-level function to create reactive state.

**Signature:**

```typescript
function createReactive<T extends object>(
  component: EnhancedComponent,
  initialState: T,
): T;
```

**Notes:**

- Used internally by `useReactive` and `component.$reactive`
- Creates a Proxy for deep reactivity
- Automatically calls `component.update()` on mutations

---

### createEffect

Low-level function to create side effects.

**Signature:**

```typescript
function createEffect(
  component: EnhancedComponent,
  effect: EffectFunction,
  deps?: DepsGetter,
): void;
```

**Notes:**

- Used internally by `useEffect` and `component.$effect`
- Handles effect scheduling and cleanup
- Integrates with component lifecycle

---

### createComputed

Low-level function to create computed values.

**Signature:**

```typescript
function createComputed<T>(
  component: EnhancedComponent,
  getter: () => T,
): { readonly value: T };
```

**Notes:**

- Used internally by `useComputed` and `component.$computed`
- Implements caching with dirty flag

---

### createComputedObject

Creates multiple computed values at once.

**Signature:**

```typescript
function createComputedObject<T extends Record<string, () => any>>(
  component: EnhancedComponent,
  computedGetters: T,
): { [K in keyof T]: { readonly value: ReturnType<T[K]> } };
```

**Usage:**

```typescript
const { doubled, tripled } = createComputedObject(this, {
  doubled: () => state.count * 2,
  tripled: () => state.count * 3,
});

console.log(doubled.value); // 0
console.log(tripled.value); // 0
```

---

### createWatch

Low-level function to create watchers.

**Signature:**

```typescript
function createWatch<T>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
): void;
```

**Notes:**

- Used internally by `useWatch` and `component.$watch`

---

### createWatchMultiple

Watches multiple values at once.

**Signature:**

```typescript
function createWatchMultiple(
  component: EnhancedComponent,
  watchers: Array<[getter: () => any, callback: WatchCallback<any>]>,
): void;
```

**Usage:**

```typescript
createWatchMultiple(this, [
  [() => state.count, (newVal, oldVal) => console.log('count:', newVal)],
  [() => state.name, (newVal, oldVal) => console.log('name:', newVal)],
]);
```

---

### createWatchObject

Watches an entire object.

**Signature:**

```typescript
function createWatchObject<T extends object>(
  component: EnhancedComponent,
  getter: () => T,
  callback: WatchCallback<T>,
  options?: { deep?: boolean },
): void;
```

**Usage:**

```typescript
createWatchObject(
  this,
  () => state,
  (newVal, oldVal) => {
    console.log('State changed');
  },
);
```

**Notes:**

- Deep watching is not yet implemented (shows warning)

---

### isReactive

Checks if an object is reactive.

**Signature:**

```typescript
function isReactive(value: any): boolean;
```

**Returns:**

- `true` if value is a reactive proxy
- `false` otherwise

**Usage:**

```typescript
const state = useReactive(this, { count: 0 });
console.log(isReactive(state)); // false (current implementation limitation)
```

**Notes:**

- Current implementation has limitations
- Checks for `__isReactive__` property

---

### toRaw

Gets the raw (non-proxied) value of a reactive object.

**Signature:**

```typescript
function toRaw<T>(reactive: T): T;
```

**Parameters:**

- `reactive` - Reactive object

**Returns:**

- Raw copy of the object

**Usage:**

```typescript
const state = useReactive(this, { count: 0 });
const raw = toRaw(state);

// Modifying raw won't trigger updates
raw.count++; // No update
```

**Notes:**

- Returns a shallow copy for objects
- Returns a copy for arrays (using `.slice()`)
- Returns the value as-is for primitives
- Useful for comparisons and debugging

---

## TypeScript Types

### EnhancedComponent

Enhanced Riot component with composables support.

```typescript
interface EnhancedComponent extends RiotComponent, ComposablesContext {
  $reactive<T extends object>(initialState: T): T;
  $effect(effect: EffectFunction, deps?: DepsGetter): void;
  $computed<T>(getter: () => T): { readonly value: T };
  $watch<T>(getter: () => T, callback: WatchCallback<T>): void;
}
```

---

### ComposablesContext

Internal context attached to enhanced components.

```typescript
interface ComposablesContext {
  __composables__: {
    states: Map<symbol, any>;
    effects: Map<symbol, EffectData>;
    computed: Map<symbol, ComputedData>;
    watchers: Map<symbol, WatchData>;
    cleanups: Array<() => void>;
  };
}
```

---

### Composable

Type for composable functions.

```typescript
type Composable<Args extends any[] = any[], Return = any> = (
  component: EnhancedComponent,
  ...args: Args
) => Return;
```

---

### EffectFunction

Effect function that may return a cleanup function.

```typescript
type EffectFunction = () => void | EffectCleanup;
type EffectCleanup = () => void;
```

---

### DepsGetter

Dependency array getter function.

```typescript
type DepsGetter = () => any[];
```

---

### EffectData

Effect data stored internally.

```typescript
interface EffectData {
  effect: EffectFunction;
  deps?: any[];
  cleanup?: EffectCleanup;
}
```

---

### ComputedData

Computed value data.

```typescript
interface ComputedData<T = any> {
  getter: () => T;
  cache?: T;
  dirty: boolean;
}
```

---

### WatchCallback

Watcher callback function.

```typescript
type WatchCallback<T = any> = (newValue: T, oldValue: T) => void;
```

---

### WatchData

Watcher data.

```typescript
interface WatchData<T = any> {
  getter: () => T;
  callback: WatchCallback<T>;
  oldValue?: T;
}
```

---

### ComposablesPlugin

Plugin function for riot.install.

```typescript
type ComposablesPlugin = (component: RiotComponent) => RiotComponent;
```

---

## Enhanced Component Methods

When the plugin is installed, all Riot components are enhanced with the following methods:

### component.$reactive

Create reactive state directly on the component.

**Signature:**

```typescript
$reactive<T extends object>(initialState: T): T
```

**Usage:**

```typescript
export default {
  onBeforeMount() {
    const state = this.$reactive({ count: 0 });
    this.state = state;
  },
};
```

---

### component.$effect

Register a side effect directly on the component.

**Signature:**

```typescript
$effect(effect: EffectFunction, deps?: DepsGetter): void
```

**Usage:**

```typescript
export default {
  onBeforeMount() {
    this.$effect(
      () => {
        console.log('Effect running');
      },
      () => [this.state.count],
    );
  },
};
```

---

### component.$computed

Create a computed value directly on the component.

**Signature:**

```typescript
$computed<T>(getter: () => T): { readonly value: T }
```

**Usage:**

```typescript
export default {
  onBeforeMount() {
    this.doubled = this.$computed(() => this.state.count * 2);
  },
};
```

---

### component.$watch

Watch a value directly on the component.

**Signature:**

```typescript
$watch<T>(getter: () => T, callback: WatchCallback<T>): void
```

**Usage:**

```typescript
export default {
  onBeforeMount() {
    this.$watch(
      () => this.state.count,
      (newVal, oldVal) => console.log('Changed:', newVal),
    );
  },
};
```

---

## Best Practices

1. **Always use composables in `onBeforeMount`**

   - This ensures proper initialization before component rendering

2. **Avoid using `this.state`**

   - `state` is a special Riot.js property
   - Use a different property name like `reactiveState`

3. **Use computed values for expensive calculations**

   - They're cached until dependencies change
   - More efficient than recalculating on every render

4. **Clean up side effects**

   - Always return cleanup functions from effects when needed
   - Prevents memory leaks and unwanted behavior

5. **Use TypeScript for better type safety**

   - Define interfaces for your state
   - Use type parameters with composables

6. **Prefer high-level composables**
   - Use `useReactive`, `useEffect`, etc. instead of low-level functions
   - Better developer experience and clearer intent

---

## Lifecycle Integration

riot-composables integrates with Riot.js lifecycle hooks:

- **onMounted** - Effects are run
- **onBeforeUpdate** - Computed values marked dirty, watchers checked, effects with changed deps re-run
- **onBeforeUnmount** - All cleanup functions executed
- **onUnmounted** - All internal maps and arrays cleared

---

## Error Handling

The library includes comprehensive error handling:

- Errors in effect functions are caught and logged
- Errors in cleanup functions are caught and logged
- Errors in computed getters are caught and re-thrown
- Errors in watch callbacks are caught and logged
- Errors during component updates are caught and logged

All errors are prefixed with `[riot-composables]` for easy identification.

---

## Performance Considerations

1. **Reactive updates** trigger `component.update()` - use wisely
2. **Computed values** are cached - excellent for expensive operations
3. **Deep reactivity** is supported for nested objects
4. **Dependency tracking** uses `Object.is()` for comparison
5. **Effects** only re-run when dependencies actually change

---

## Browser Support

riot-composables requires:

- ES6 Proxy support
- Riot.js v10+

This means it works in all modern browsers (Chrome, Firefox, Safari, Edge).

---

## Migration Guide

### From Riot.js mixins (v3 and earlier)

**Before:**

```javascript
const counterMixin = {
  init() {
    this.count = 0;
  },
  increment() {
    this.count++;
    this.update();
  },
};
```

**After:**

```javascript
function useCounter(component, initialCount = 0) {
  const state = useReactive(component, { count: initialCount });

  return {
    get count() {
      return state.count;
    },
    increment: () => state.count++,
  };
}
```

### From plain Riot.js state

**Before:**

```javascript
export default {
  state: { count: 0 },
  increment() {
    this.state.count++;
    this.update();
  },
};
```

**After:**

```javascript
import { useReactive } from 'riot-composables';

export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 0 });
    this.state = state;
    this.increment = () => state.count++; // Auto-updates!
  },
};
```
