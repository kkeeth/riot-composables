import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReactive } from '../../src/composables/useReactive';
import { installComposables } from '../../src/core/plugin';
import type { EnhancedComponent } from '../../src/types';

// Helper to create a mock component with plugin installed
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

  // Add $reactive method (normally added by plugin)
  component.$reactive = function <T extends object>(initialState: T): T {
    const proxy = new Proxy(initialState, {
      set: (obj, prop, value) => {
        obj[prop as keyof T] = value;
        this.update();
        return true;
      },
    });
    return proxy;
  };

  return component;
}

describe('composables/useReactive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create reactive state', () => {
    const component = createMockComponent();
    const state = useReactive(component, { count: 0 });

    expect(state.count).toBe(0);
  });

  it('should call component.$reactive', () => {
    const component = createMockComponent();
    const spy = vi.spyOn(component, '$reactive');

    const initialState = { count: 0 };
    useReactive(component, initialState);

    expect(spy).toHaveBeenCalledWith(initialState);
  });

  it('should trigger updates on state changes', () => {
    const component = createMockComponent();
    const state = useReactive(component, { count: 0 });

    state.count = 1;

    expect(component.update).toHaveBeenCalled();
  });

  it('should handle complex state objects', () => {
    const component = createMockComponent();
    const state = useReactive(component, {
      user: { name: 'John', age: 30 },
      items: [1, 2, 3],
      active: true,
    });

    expect(state.user.name).toBe('John');
    expect(state.items).toEqual([1, 2, 3]);
    expect(state.active).toBe(true);
  });

  it('should work with different types', () => {
    const component = createMockComponent();

    const numberState = useReactive(component, { value: 42 });
    expect(numberState.value).toBe(42);

    const stringState = useReactive(component, { text: 'hello' });
    expect(stringState.text).toBe('hello');

    const booleanState = useReactive(component, { flag: true });
    expect(booleanState.flag).toBe(true);

    const arrayState = useReactive(component, { items: [1, 2, 3] });
    expect(arrayState.items).toEqual([1, 2, 3]);
  });

  it('should return the same type as input', () => {
    const component = createMockComponent();
    const initialState = { count: 0, name: 'test' };

    const state = useReactive(component, initialState);

    // TypeScript will enforce this at compile time
    expect(typeof state.count).toBe('number');
    expect(typeof state.name).toBe('string');
  });

  it('should allow multiple reactive states on same component', () => {
    const component = createMockComponent();

    const state1 = useReactive(component, { count: 0 });
    const state2 = useReactive(component, { name: 'John' });

    expect(state1.count).toBe(0);
    expect(state2.name).toBe('John');

    state1.count = 5;
    state2.name = 'Jane';

    expect(state1.count).toBe(5);
    expect(state2.name).toBe('Jane');
  });
});
