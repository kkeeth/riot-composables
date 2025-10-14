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
import * as riot from 'riot';
import App from './App.riot';

// Install composables support (do this once at app startup)
installComposables();

// Mount your app as usual
const mountApp = riot.component(App);
mountApp(document.getElementById('root'));
```

### 2. Use composables in your components

```riot
<!-- Counter.riot -->
<counter>
  <h1>Count: {count}</h1>
  <button onclick={increment}>+</button>
  <button onclick={decrement}>-</button>
  <button onclick={reset}>Reset</button>
  <p if={isAtMax.value}>Maximum reached!</p>

  <script lang="ts">
    import { useCounter } from 'riot-composables'

    export default {
      onBeforeMount() {
        const counter = useCounter(this, 0, { min: 0, max: 10 })
        Object.assign(this, counter)
      }
    }
  </script>
</counter>
```

## Core Composables

### useReactive

Create reactive state that automatically triggers component updates:

```typescript
import { useReactive } from 'riot-composables';

export default {
  onBeforeMount() {
    const state = useReactive(this, {
      count: 0,
      name: 'John',
    });

    this.state = state;
    this.increment = () => state.count++; // Auto-updates component
  },
};
```

### useEffect

Handle side effects with dependency tracking:

```typescript
import { useEffect } from 'riot-composables';

export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 0 });

    // Run when count changes
    useEffect(
      this,
      () => {
        console.log('Count is now:', state.count);
        document.title = `Count: ${state.count}`;

        // Optional cleanup
        return () => {
          console.log('Cleaning up...');
        };
      },
      () => [state.count],
    );

    this.state = state;
  },
};
```

### useComputed

Create cached computed values:

```typescript
import { useReactive, useComputed } from 'riot-composables';

export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 5 });
    const doubled = useComputed(this, () => state.count * 2);

    console.log(doubled.value); // 10 (cached)

    this.state = state;
    this.doubled = doubled;
  },
};
```

### useWatch

Watch values and react to changes:

```typescript
import { useWatch } from 'riot-composables';

export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 0 });

    useWatch(
      this,
      () => state.count,
      (newVal, oldVal) => {
        console.log(`Count changed from ${oldVal} to ${newVal}`);
      },
    );

    this.state = state;
  },
};
```

## Built-in Composables

### useCounter

```typescript
import { useCounter } from 'riot-composables';

const counter = useCounter(this, 0, {
  min: 0,
  max: 100,
  step: 1,
});

counter.increment();
counter.decrement();
counter.set(50);
console.log(counter.isAtMax.value); // false
```

### useToggle

```typescript
import { useToggle } from 'riot-composables';

const modal = useToggle(this, false);

modal.toggle(); // true
modal.setTrue(); // true
modal.setFalse(); // false
console.log(modal.value); // false
```

## Creating Custom Composables

```typescript
// composables/useForm.ts
import { useReactive, useComputed } from 'riot-composables';
import type { EnhancedComponent } from 'riot-composables';

export function useForm(component: EnhancedComponent, initialValues: any) {
  const state = useReactive(component, {
    values: initialValues,
    errors: {},
    touched: {},
  });

  const isValid = useComputed(component, () => {
    return Object.keys(state.errors).length === 0;
  });

  const handleChange = (field: string, value: any) => {
    state.values[field] = value;
    state.touched[field] = true;
    validate();
  };

  const validate = () => {
    // Your validation logic
  };

  return {
    state,
    isValid,
    handleChange,
    validate,
  };
}
```

Then use it in your component:

```riot
<login-form>
  <input
    value={form.values.email}
    onchange={e => handleChange('email', e.target.value)}
  />
  <span if={form.errors.email}>{form.errors.email}</span>

  <script>
    import { useForm } from './composables/useForm'

    export default {
      onBeforeMount() {
        const { state: form, handleChange } = useForm(this, {
          email: '',
          password: ''
        })

        Object.assign(this, { form, handleChange })
      }
    }
  </script>
</login-form>
```

## Architecture

riot-composables uses a 3-layer architecture:

1. **Layer 1: Core Plugin** - Uses `riot.install()` to enhance all components
2. **Layer 2: Enhanced API** - Adds `$reactive`, `$effect`, `$computed`, `$watch` methods
3. **Layer 3: Composables** - High-level reusable functions developers use

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
import type { EnhancedComponent } from 'riot-composables';

interface MyState {
  count: number;
  name: string;
}

export default {
  onBeforeMount(this: EnhancedComponent) {
    const state = useReactive<MyState>(this, {
      count: 0,
      name: 'John',
    });

    // Full type safety
    state.count = 10; // ✅
    state.invalid = 'error'; // ❌ Type error
  },
};
```

## API Reference

See [API Documentation](./docs/api.md) for complete API reference.

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

MIT

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Credits

Inspired by:

- Vue 3 Composition API
- React Hooks
- Riot.js philosophy
