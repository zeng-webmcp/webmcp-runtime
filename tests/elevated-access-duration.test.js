import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createElevatedLease,
  DEFAULT_ELEVATED_LEASE_MS,
  MAX_ELEVATED_LEASE_MS,
  parseElevatedDuration,
} from '../native/deploy/elevated-access.js';

const NORMAL = Object.freeze({
  version: 1,
  hostRoot: '/Users/alice/Projects',
  mode: 'workspace',
  readOnly: false,
  networkEnabled: false,
  gitPublicationEnabled: false,
});

const ID = 'a'.repeat(64);

function lease(overrides = {}) {
  return createElevatedLease({
    normalConfig: NORMAL,
    elevatedRoot: '/Users/alice',
    bootSessionId: 'b'.repeat(64),
    loginSessionId: 'c'.repeat(64),
    leaseId: ID,
    now: 1_000_000,
    platform: 'darwin',
    ...overrides,
  });
}

test('Host Access defaults to one hour but owner-selected duration may extend to eight hours', () => {
  assert.equal(DEFAULT_ELEVATED_LEASE_MS, 60 * 60 * 1000);
  assert.equal(MAX_ELEVATED_LEASE_MS, 8 * 60 * 60 * 1000);
  assert.equal(parseElevatedDuration('1h'), DEFAULT_ELEVATED_LEASE_MS);
  assert.equal(parseElevatedDuration('8h'), MAX_ELEVATED_LEASE_MS);
  assert.equal(parseElevatedDuration('480m'), MAX_ELEVATED_LEASE_MS);
  assert.throws(() => parseElevatedDuration('481m'), /no longer than 8 hours/);
  assert.throws(() => parseElevatedDuration('9h'), /no longer than 8 hours/);

  const defaultLease = lease();
  assert.equal(defaultLease.expiresAt - defaultLease.issuedAt, DEFAULT_ELEVATED_LEASE_MS);

  const eightHours = lease({ durationMs: MAX_ELEVATED_LEASE_MS });
  assert.equal(eightHours.expiresAt - eightHours.issuedAt, MAX_ELEVATED_LEASE_MS);
  assert.throws(
    () => lease({ durationMs: MAX_ELEVATED_LEASE_MS + 1 }),
    /no longer than 8 hours/,
  );
});
