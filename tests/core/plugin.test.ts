import { describe, it, expect, beforeEach } from 'vitest';
import {
  installComposables,
  uninstallComposables,
  isComposablesInstalled,
} from '../../src/core/plugin';

describe('Plugin', () => {
  beforeEach(() => {
    // Ensure clean state
    if (isComposablesInstalled()) {
      uninstallComposables();
    }
  });

  it('should install composables plugin', () => {
    expect(isComposablesInstalled()).toBe(false);

    installComposables();

    expect(isComposablesInstalled()).toBe(true);
  });

  it('should not install twice', () => {
    installComposables();

    // Try to install again (should warn but not error)
    expect(() => installComposables()).not.toThrow();
    expect(isComposablesInstalled()).toBe(true);
  });

  it('should uninstall composables plugin', () => {
    installComposables();
    expect(isComposablesInstalled()).toBe(true);

    uninstallComposables();

    expect(isComposablesInstalled()).toBe(false);
  });

  it('should handle uninstall when not installed', () => {
    expect(isComposablesInstalled()).toBe(false);

    // Should not throw
    expect(() => uninstallComposables()).not.toThrow();
  });
});
