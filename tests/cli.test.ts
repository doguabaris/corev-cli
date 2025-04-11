/**
 * @file smoke.test.ts
 * @description A basic smoke test for cono using Vitest.
 *
 * This test serves as a simple sanity check to ensure that the testing environment is
 * properly configured and that Vitest is functioning as expected. It verifies that basic
 * arithmetic works correctly (i.e., 1 + 1 equals 2).
 *
 * Usage:
 *   Run this test along with your other tests using:
 *     npm test
 *
 * @example
 *   // Example command to run tests:
 *   npm test
 *
 * @author		Doğu Abaris <abaris@null.net>
 * @license		MIT
 * @see			README.md for more details on using cono.
 */

import {describe, expect, it} from 'vitest';

describe('cono smoke test', () => {
	it('adds numbers correctly', () => {
		expect(1 + 1).toBe(2);
	});
});
