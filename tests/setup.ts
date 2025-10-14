/**
 * Test setup file
 * Runs before all tests
 */

import { beforeEach, afterEach } from 'vitest';
import { uninstallComposables } from '../src/core/plugin';

// Clean up after each test
afterEach(() => {
  // Uninstall composables plugin to ensure clean state
  try {
    uninstallComposables();
  } catch (e) {
    // Plugin might not be installed, ignore
  }
});
