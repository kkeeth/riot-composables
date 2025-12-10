# riot-composables

[![npm version](https://img.shields.io/npm/v/riot-composables.svg)](https://www.npmjs.com/package/riot-composables)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Vue 3 Composition API inspired composables for Riot.js. Build reusable logic with a clean, functional approach while maintaining Riot.js's simplicity and small footprint.

## Features

- 🎣 **Composable Functions** - Reusable logic with Vue 3-style composables
- ⚡️ **Reactive State** - Automatic component updates with proxy-based reactivity
- 🔄 **Side Effects** - React-style useEffect with dependency tracking
- 💎 **Computed Values** - Cached computed properties
- 👁️ **Watchers** - Watch reactive values and respond to changes
- 📦 **Zero Dependencies** - Only requires Riot.js v10+
- 🎯 **TypeScript First** - Full type safety out of the box
- 🪶 **Lightweight** - Minimal overhead on top of Riot.js

## Installation

```bash
npm install riot-composables
```

## Quick Start

### 1. Install the plugin globally

```typescript
// main.ts
import { installComposables } from 'riot-composables';
import { component } from 'riot';
import App from './App.riot';

// Install composables support (do this once at app startup)
installComposables();

// Mount your app as usual
component(App)(document.getElementById('root'));
```

### 2. Use composables in your components

```riot
<!-- Counter.riot -->
<counter>
  <h1>Count: {reactiveState.count}</h1>
  <button onclick={increment}>+</button>
  <button onclick={decrement}>-</button>
  <button onclick={reset}>Reset</button>

  <script lang="ts">
    import { useReactive } from 'riot-composables'

    export default {
      onBeforeMount() {
        const reactiveState = useReactive(this, { count: 0 })

        // Don't use 'this.state' - it's a special Riot.js property
        this.reactiveState = reactiveState
        this.increment = () => reactiveState.count++
        this.decrement = () => reactiveState.count--
        this.reset = () => reactiveState.count = 0
      }
    }
  </script>
</counter>
```

## Available Composables

### Core Composables

- **`useReactive`** - Create reactive state that automatically triggers component updates
- **`useEffect`** - Handle side effects with dependency tracking (similar to React's useEffect)
- **`useComputed`** - Create cached computed values that recalculate when dependencies change
- **`useWatch`** - Watch values and execute callbacks when they change (similar to Vue's watch)
- **`useMount`** - Convenience wrapper for running code only on component mount
- **`useUnmount`** - Convenience wrapper for cleanup on component unmount

For detailed usage and examples, see the [User Guide](./docs/guide.md).

### Creating Custom Composables

You can create your own composables by combining the core APIs:

```typescript
// Example: Counter with min/max constraints
import { useReactive, useComputed } from 'riot-composables';

export function useCounter(component, initialValue = 0, options = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const state = useReactive(component, {
    count: Math.max(min, Math.min(max, initialValue)),
  });

  const isAtMin = useComputed(component, () => state.count <= min);
  const isAtMax = useComputed(component, () => state.count >= max);

  return {
    get count() { return state.count; },
    increment: () => state.count = Math.min(max, state.count + step),
    decrement: () => state.count = Math.max(min, state.count - step),
    reset: () => state.count = initialValue,
    isAtMin,
    isAtMax,
  };
}
```

More examples in the [User Guide](./docs/guide.md).

## Documentation

- **[User Guide](./docs/guide.md)** - Complete guide with practical examples and best practices
- **[API Reference](./docs/api.md)** - Detailed API documentation and technical reference
- **[Examples](./examples)** - Real-world examples and use cases

## Architecture

riot-composables uses a 3-layer architecture:

1. **Layer 1: Core Plugin** - Uses `riot.install()` to enhance all components
2. **Layer 2: Enhanced API** - Adds `$reactive`, `$effect`, `$computed`, `$watch` methods
3. **Layer 3: Composables** - High-level reusable functions developers use

## TypeScript Support

riot-composables provides full TypeScript support with proper type inference.

```typescript
import type { EnhancedComponent } from 'riot-composables';
import { useReactive } from 'riot-composables';

interface MyState {
  count: number;
  name: string;
}

export default {
  onBeforeMount() {
    const state = useReactive<MyState>(this, {
      count: 0,
      name: 'John',
    });

    this.state = state;
    this.increment = () => state.count++; // Type-safe!
  }
}
```

See the [User Guide](./docs/guide.md#typescript-usage) for more TypeScript examples.

## Why riot-composables?

Riot.js is amazing for its simplicity, but lacks modern patterns for logic reuse:

- ❌ No hooks like React
- ❌ No composition API like Vue 3
- ❌ Limited state management options
- ❌ Mixin system removed in v4+

riot-composables solves these problems while maintaining Riot.js's philosophy of simplicity.

## Comparison

| Feature               | React Hooks | Vue 3 Composition API | riot-composables  |
| --------------------- | ----------- | --------------------- | ----------------- |
| Functional components | ✅          | ✅                    | ❌ (object-based) |
| Reactive state        | ✅          | ✅                    | ✅                |
| Side effects          | ✅          | ✅                    | ✅                |
| Computed values       | ❌          | ✅                    | ✅                |
| Watchers              | ❌          | ✅                    | ✅                |
| Composable functions  | ✅          | ✅                    | ✅                |

## License

[MIT](https://github.com/kkeeth/riot-composables/blob/main/LICENSE)

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Credits

Inspired by:

- Vue 3 Composition API
- React Hooks
- Riot.js philosophy
