# User Guide

Complete guide for using riot-composables with practical examples and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Core Composables](#core-composables)
  - [useReactive](#usereactive)
  - [useEffect](#useeffect)
  - [useComputed](#usecomputed)
  - [useWatch](#usewatch)
  - [useMount & useUnmount](#usemount--useunmount)
- [Creating Custom Composables](#creating-custom-composables)
  - [Counter with Constraints](#counter-with-constraints)
  - [Form Handling](#form-handling)
  - [Fetch Data](#fetch-data)
- [Best Practices](#best-practices)
- [TypeScript Usage](#typescript-usage)

---

## Getting Started

### Installation

```bash
npm install riot-composables
```

### Setup

Install the plugin globally at application startup:

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

### Your First Component

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

---

## Core Composables

### useReactive

Create reactive state that automatically triggers component updates when modified.

#### Basic Usage

```typescript
import { useReactive } from 'riot-composables';

export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, {
      count: 0,
      name: 'John',
    });

    // IMPORTANT: Don't use 'this.state' as it's a special Riot.js property
    this.reactiveState = reactiveState;
    this.increment = () => reactiveState.count++; // Auto-updates component
  },
};
```

#### Nested Objects

```typescript
const reactiveState = useReactive(this, {
  user: {
    name: 'John',
    address: {
      city: 'Tokyo',
      country: 'Japan',
    },
  },
  settings: {
    theme: 'dark',
    notifications: true,
  },
});

// Deep reactivity works automatically
reactiveState.user.address.city = 'Osaka'; // Triggers update
reactiveState.settings.theme = 'light'; // Triggers update
```

#### Arrays

```typescript
const reactiveState = useReactive(this, {
  items: ['apple', 'banana', 'orange'],
});

// All array methods work reactively
reactiveState.items.push('grape'); // Triggers update
reactiveState.items.pop(); // Triggers update
reactiveState.items[0] = 'strawberry'; // Triggers update
```

---

### useEffect

Handle side effects with dependency tracking, similar to React's useEffect.

#### Run Once on Mount

```typescript
import { useReactive, useEffect } from 'riot-composables';

export default {
  onBeforeMount() {
    useEffect(this, () => {
      console.log('Component mounted');

      // Fetch initial data
      fetchData();

      // Optional cleanup
      return () => {
        console.log('Component unmounting');
      };
    });
  },
};
```

#### Run When Dependencies Change

```typescript
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
          document.title = 'Default Title';
        };
      },
      () => [reactiveState.count], // Dependency array
    );

    this.reactiveState = reactiveState;
    this.increment = () => reactiveState.count++;
  },
};
```

#### Multiple Dependencies

```typescript
const reactiveState = useReactive(this, {
  firstName: 'John',
  lastName: 'Doe',
});

useEffect(
  this,
  () => {
    console.log(`Full name: ${reactiveState.firstName} ${reactiveState.lastName}`);
  },
  () => [reactiveState.firstName, reactiveState.lastName],
);
```

#### Timer Example

```typescript
export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, { seconds: 0 });

    useEffect(this, () => {
      const interval = setInterval(() => {
        reactiveState.seconds++;
      }, 1000);

      // Cleanup: clear interval on unmount
      return () => clearInterval(interval);
    });

    this.reactiveState = reactiveState;
  },
};
```

---

### useComputed

Create cached computed values that automatically recalculate when dependencies change.

#### Basic Usage

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
    this.total = total; // Access via total.value in template
  },
};
```

#### Multiple Computed Values

```typescript
const reactiveState = useReactive(this, {
  width: 10,
  height: 20,
});

const area = useComputed(this, () => {
  return reactiveState.width * reactiveState.height;
});

const perimeter = useComputed(this, () => {
  return 2 * (reactiveState.width + reactiveState.height);
});

this.area = area;
this.perimeter = perimeter;
```

#### In Template

```riot
<shopping-cart>
  <p>Price: ${reactiveState.price}</p>
  <p>Quantity: {reactiveState.quantity}</p>
  <p>Tax Rate: {reactiveState.taxRate * 100}%</p>
  <h2>Total: ${total.value}</h2>
  <button onclick={increaseQuantity}>+</button>

  <script>
    import { useReactive, useComputed } from 'riot-composables'

    export default {
      onBeforeMount() {
        const reactiveState = useReactive(this, {
          price: 10,
          quantity: 1,
          taxRate: 0.1
        })

        const total = useComputed(this, () => {
          const subtotal = reactiveState.price * reactiveState.quantity
          return (subtotal * (1 + reactiveState.taxRate)).toFixed(2)
        })

        this.reactiveState = reactiveState
        this.total = total
        this.increaseQuantity = () => reactiveState.quantity++
      }
    }
  </script>
</shopping-cart>
```

---

### useWatch

Watch values and react to changes, similar to Vue's watch.

#### Basic Usage

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

#### Conditional Logic in Watcher

```typescript
const reactiveState = useReactive(this, {
  count: 0,
  message: ''
});

useWatch(
  this,
  () => reactiveState.count,
  (newVal, oldVal) => {
    if (newVal > 10) {
      reactiveState.message = 'Count is getting high!';
    } else if (newVal < 0) {
      reactiveState.message = 'Count is negative!';
    } else {
      reactiveState.message = '';
    }
  },
);
```

#### Watch Multiple Values

```typescript
const reactiveState = useReactive(this, {
  firstName: 'John',
  lastName: 'Doe',
});

// Watch firstName
useWatch(
  this,
  () => reactiveState.firstName,
  (newVal) => console.log('First name changed to:', newVal),
);

// Watch lastName
useWatch(
  this,
  () => reactiveState.lastName,
  (newVal) => console.log('Last name changed to:', newVal),
);
```

---

### useMount & useUnmount

Convenience wrappers for lifecycle events.

#### useMount

Run code only on component mount:

```typescript
import { useMount } from 'riot-composables';

export default {
  onBeforeMount() {
    useMount(this, () => {
      console.log('Component mounted!');
      fetchInitialData();

      // Optional cleanup on unmount
      return () => {
        console.log('Cleanup on unmount');
      };
    });
  },
};
```

#### useUnmount

Run code only on component unmount:

```typescript
import { useUnmount } from 'riot-composables';

export default {
  onBeforeMount() {
    const intervalId = setInterval(() => {
      console.log('Tick');
    }, 1000);

    useUnmount(this, () => {
      console.log('Cleaning up interval...');
      clearInterval(intervalId);
    });
  },
};
```

---

## Creating Custom Composables

### Counter with Constraints

Create a reusable counter composable with min/max constraints:

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

#### Using the Counter Composable

```riot
<counter>
  <h1>Count: {counter.count}</h1>
  <button onclick={counter.decrement} disabled={counter.isAtMin.value}>-</button>
  <button onclick={counter.increment} disabled={counter.isAtMax.value}>+</button>
  <button onclick={counter.reset}>Reset</button>
  <p if={counter.isAtMax.value}>Maximum reached!</p>
  <p if={counter.isAtMin.value}>Minimum reached!</p>

  <script>
    import { useCounter } from './composables/useCounter'

    export default {
      onBeforeMount() {
        const counter = useCounter(this, 0, { min: 0, max: 10, step: 1 })
        this.counter = counter
      }
    }
  </script>
</counter>
```

---

### Form Handling

Create a form management composable with validation:

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

#### Using the Form Composable

```riot
<login-form>
  <form onsubmit={onSubmit}>
    <div>
      <input
        type="email"
        value={form.state.values.email}
        oninput={handleEmailChange}
        placeholder="Email"
      />
      <p if={form.state.touched.email && form.state.errors.email} style="color: red;">
        {form.state.errors.email}
      </p>
    </div>

    <div>
      <input
        type="password"
        value={form.state.values.password}
        oninput={handlePasswordChange}
        placeholder="Password"
      />
      <p if={form.state.touched.password && form.state.errors.password} style="color: red;">
        {form.state.errors.password}
      </p>
    </div>

    <button type="submit" disabled={!form.isValid.value}>Submit</button>
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

---

### Fetch Data

Create a data fetching composable:

```typescript
// composables/useFetch.ts
import { useReactive, useEffect } from 'riot-composables';

export function useFetch(component, url) {
  const state = useReactive(component, {
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    state.loading = true;
    state.error = null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      state.data = data;
    } catch (error) {
      state.error = error.message;
    } finally {
      state.loading = false;
    }
  };

  useEffect(component, () => {
    fetchData();
  });

  const refetch = () => {
    fetchData();
  };

  return {
    state,
    refetch,
  };
}
```

#### Using the Fetch Composable

```riot
<user-list>
  <div if={api.state.loading}>Loading...</div>
  <div if={api.state.error}>Error: {api.state.error}</div>
  <ul if={api.state.data}>
    <li each={user in api.state.data}>
      {user.name} - {user.email}
    </li>
  </ul>
  <button onclick={api.refetch}>Refresh</button>

  <script>
    import { useFetch } from './composables/useFetch'

    export default {
      onBeforeMount() {
        const api = useFetch(this, 'https://jsonplaceholder.typicode.com/users')
        this.api = api
      }
    }
  </script>
</user-list>
```

---

## Best Practices

### 1. Always Use Composables in `onBeforeMount`

```typescript
// ✅ Good
export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 0 });
    this.state = state;
  },
};

// ❌ Bad - Don't use in onMounted
export default {
  onMounted() {
    const state = useReactive(this, { count: 0 }); // Too late!
    this.state = state;
  },
};
```

### 2. Avoid Using `this.state`

```typescript
// ✅ Good - Use a different property name
export default {
  onBeforeMount() {
    const reactiveState = useReactive(this, { count: 0 });
    this.reactiveState = reactiveState;
  },
};

// ❌ Bad - 'state' is a special Riot.js property
export default {
  onBeforeMount() {
    const state = useReactive(this, { count: 0 });
    this.state = state; // May cause issues
  },
};
```

### 3. Clean Up Side Effects

```typescript
// ✅ Good - Always clean up
useEffect(this, () => {
  const interval = setInterval(() => console.log('tick'), 1000);

  return () => clearInterval(interval); // Cleanup
});

// ❌ Bad - No cleanup (memory leak)
useEffect(this, () => {
  setInterval(() => console.log('tick'), 1000);
  // No cleanup!
});
```

### 4. Use Computed for Expensive Calculations

```typescript
// ✅ Good - Computed values are cached
const total = useComputed(this, () => {
  return expensiveCalculation(state.items);
});

// ❌ Bad - Recalculates on every render
this.getTotal = () => expensiveCalculation(this.items);
```

### 5. Extract Reusable Logic into Composables

```typescript
// ✅ Good - Reusable composable
function useCounter(component, initial = 0) {
  const state = useReactive(component, { count: initial });
  return {
    get count() { return state.count; },
    increment: () => state.count++,
    decrement: () => state.count--,
  };
}

// Use it anywhere
const counter = useCounter(this, 10);
```

### 6. Keep Composables Pure

```typescript
// ✅ Good - Composable is pure and reusable
function useToggle(component, initialValue = false) {
  const state = useReactive(component, { value: initialValue });

  return {
    get value() { return state.value; },
    toggle: () => state.value = !state.value,
    setTrue: () => state.value = true,
    setFalse: () => state.value = false,
  };
}

// ❌ Bad - Side effects inside composable
function useToggle(component, initialValue = false) {
  const state = useReactive(component, { value: initialValue });
  console.log('Toggle created'); // Side effect!

  return { /* ... */ };
}
```

---

## TypeScript Usage

### Basic TypeScript Component

```riot
<my-component>
  <p>Count: {state.count}</p>
  <p>Name: {state.name}</p>
  <button onclick={increment}>Increment</button>

  <script lang="ts">
    import { RiotComponent, withTypes } from 'riot';
    import { useReactive } from 'riot-composables'

    interface MyComponentProps {}
    interface MyComponentState {
      count: number
      name: string
    }

    export interface MyComponent extends RiotComponent<MyComponentProps, MyComponentState> {
      state: MyComponentState
      increment: () => void
    }

    export default withTypes<MyComponent>({
      onBeforeMount() {
        const state = useReactive<MyComponentState>(this, {
          count: 0,
          name: 'John',
        })

        this.state = state
        this.increment = () => state.count++

        // TypeScript will catch type errors at compile time
        state.count = 10 // ✅ OK
        // state.invalid = 'error' // ❌ TypeScript error
      }
    })
  </script>
</my-component>
```

### Typed Custom Composable

```typescript
import type { EnhancedComponent } from 'riot-composables';
import { useReactive, useComputed } from 'riot-composables';

export interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  isAtMin: { readonly value: boolean };
  isAtMax: { readonly value: boolean };
}

export function useCounter(
  component: EnhancedComponent,
  initialValue = 0,
  options: UseCounterOptions = {},
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const state = useReactive(component, {
    count: Math.max(min, Math.min(max, initialValue)),
  });

  const isAtMin = useComputed(component, () => state.count <= min);
  const isAtMax = useComputed(component, () => state.count >= max);

  return {
    get count() {
      return state.count;
    },
    increment: () => {
      state.count = Math.min(max, state.count + step);
    },
    decrement: () => {
      state.count = Math.max(min, state.count - step);
    },
    isAtMin,
    isAtMax,
  };
}
```

---

## Next Steps

- See [API Reference](./api.md) for complete API documentation
- Check out the [examples](../examples) directory for more use cases
- Read the [README](../README.md) for project overview

---

## Need Help?

If you encounter any issues or have questions:

1. Check the [API Reference](./api.md)
2. Look at [examples](../examples) for common patterns
3. Open an issue on [GitHub](https://github.com/kkeeth/riot-composables/issues)
