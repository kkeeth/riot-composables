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

## Core Composables

### useReactive

Create reactive state that automatically triggers component updates:

```typescript
import { useReactive } from 'riot-composables';

export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, {
      count: 0,
      name: 'John',
    });

    // IMPORTANT: Don't use 'this.state' as it's a special Riot.js property
    // Use a different property name instead
    this.reactiveState = reactiveState;
    this.increment = () => reactiveState.count++; // Auto-updates component
  },
};
```

### useEffect

Handle side effects with dependency tracking:

```typescript
import { useReactive, useEffect } from 'riot-composables';

export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, { count: 0 });

    // Run when count changes
    useEffect(
      this,
      () => {
        console.log('Count is now:', reactiveState.count);
        document.title = `Count: ${reactiveState.count}`;

        // Optional cleanup
        return () => {
          console.log('Cleaning up...');
        };
      },
      () => [reactiveState.count],
    );

    this.reactiveState = reactiveState;
    this.increment = () => reactiveState.count++;
  },
};
```

### useComputed

Create cached computed values that automatically recalculate when dependencies change:

```typescript
import { useReactive, useComputed } from 'riot-composables';

export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, {
      price: 10,
      quantity: 1,
      taxRate: 0.1,
    });

    // Computed value automatically updates when dependencies change
    const total = useComputed(this, () => {
      const subtotal = reactiveState.price * reactiveState.quantity;
      return (subtotal * (1 + reactiveState.taxRate)).toFixed(2);
    });

    this.reactiveState = reactiveState;
    this.total = total;
    this.increaseQuantity = () => reactiveState.quantity++;
    this.decreaseQuantity = () => {
      if (reactiveState.quantity > 0) reactiveState.quantity--;
    };
  },
};
```

### useWatch

Watch values and react to changes:

```typescript
import { useReactive, useWatch } from 'riot-composables';

export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, { count: 0 });

    useWatch(
      this,
      () => reactiveState.count,
      (newVal, oldVal) => {
        console.log(`Count changed from ${oldVal} to ${newVal}`);
      },
    );

    this.reactiveState = reactiveState;
    this.increment = () => reactiveState.count++;
  },
};
```

## Creating Custom Composables

You can create your own composables by combining the core APIs. Here's an example of a counter composable with min/max constraints:

```typescript
// composables/useCounter.ts
import { useReactive, useComputed } from 'riot-composables';

export interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

export function useCounter(
  component,
  initialValue = 0,
  options: UseCounterOptions = {},
) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const state = useReactive(component, {
    count: Math.max(min, Math.min(max, initialValue)),
  });

  const isAtMin = useComputed(component, () => state.count <= min);
  const isAtMax = useComputed(component, () => state.count >= max);

  const increment = () => {
    state.count = Math.min(max, state.count + step);
  };

  const decrement = () => {
    state.count = Math.max(min, state.count - step);
  };

  const reset = () => {
    state.count = initialValue;
  };

  const set = (value: number) => {
    state.count = Math.max(min, Math.min(max, value));
  };

  return {
    get count() {
      return state.count;
    },
    increment,
    decrement,
    reset,
    set,
    isAtMin,
    isAtMax,
  };
}
```

Then use it in your component:

```riot
<counter>
  <h1>Count: {counter.count}</h1>
  <button onclick={counter.increment}>+</button>
  <button onclick={counter.decrement}>-</button>
  <button onclick={counter.reset}>Reset</button>
  <p if={counter.isAtMax.value}>Maximum reached!</p>

  <script>
    import { useCounter } from './composables/useCounter'

    export default {
      onBeforeMount() {
        const counter = useCounter(this, 0, { min: 0, max: 10 })
        this.counter = counter
      }
    }
  </script>
</counter>
```

### Another Example: Form Handling

Here's a more complex example showing form state management with validation:

```typescript
// composables/useForm.ts
import { useReactive, useComputed } from 'riot-composables';

export function useForm(component, initialValues) {
  const state = useReactive(component, {
    values: initialValues,
    errors: {},
    touched: {},
  });

  const isValid = useComputed(component, () => {
    return (
      Object.keys(state.errors).length === 0 &&
      Object.keys(state.touched).length > 0
    );
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    const emailError = validateEmail(state.values.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(state.values.password);
    if (passwordError) newErrors.password = passwordError;

    state.errors = newErrors;
  };

  const handleChange = (field, value) => {
    state.values[field] = value;
    state.touched[field] = true;
    validate();
  };

  const handleSubmit = (callback) => {
    // Mark all fields as touched
    Object.keys(state.values).forEach((field) => {
      state.touched[field] = true;
    });

    validate();

    if (isValid.value) {
      callback(state.values);
    }
  };

  return {
    state,
    isValid,
    handleChange,
    handleSubmit,
  };
}
```

Use it in your component:

```html
<login-form>
  <form onsubmit="{onSubmit}">
    <div>
      <input
        type="email"
        value="{form.state.values.email}"
        oninput="{handleEmailChange}"
        placeholder="Email"
      />
      <p
        if="{form.state.touched.email"
        &&
        form.state.errors.email}
        style="color: red;"
      >
        {form.state.errors.email}
      </p>
    </div>

    <div>
      <input
        type="password"
        value="{form.state.values.password}"
        oninput="{handlePasswordChange}"
        placeholder="Password"
      />
      <p
        if="{form.state.touched.password"
        &&
        form.state.errors.password}
        style="color: red;"
      >
        {form.state.errors.password}
      </p>
    </div>

    <button type="submit" disabled="{!form.isValid.value}">Submit</button>
  </form>

  <script>
    import { useForm } from './composables/useForm';

    export default {
      onBeforeMount() {
        const form = useForm(this, {
          email: '',
          password: '',
        });

        this.form = form;

        this.handleEmailChange = (e) => {
          form.handleChange('email', e.target.value);
        };

        this.handlePasswordChange = (e) => {
          form.handleChange('password', e.target.value);
        };

        this.onSubmit = (e) => {
          e.preventDefault();
          form.handleSubmit((values) => {
            console.log('Form submitted:', values);
            // Handle successful submission
          });
        };
      },
    };
  </script>
</login-form>
```

For more custom composable examples, see the [examples](./examples) directory.

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
