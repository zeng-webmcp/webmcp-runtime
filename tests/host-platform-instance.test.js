import test from 'node:test';
import assert from 'node:assert/strict';
import { hostPathEnvironment } from '../native/deploy/host-platform.js';

test('host environment carries a non-default instance id when a service attaches to that instance', () => {
  const env = hostPathEnvironment({
    workspaceConfig: '/tmp/workspace.json',
    workspaceMountConfig: '/tmp/mounts.json',
    imagePin: '/tmp/image.json',
    elevatedLease: '/tmp/lease.json',
    home: '/Users/tester',
    instanceId: 'webmcp',
    containerName: 'webmcp-native-webmcp',
    lifecycleLock: '/tmp/lifecycle.lock',
    attachmentGeneration: '/tmp/attachment.json',
  });
  assert.equal(env.WEBMCP_INSTANCE_ID, 'webmcp');
  assert.equal(env.WEBMCP_NATIVE_CONTAINER, 'webmcp-native-webmcp');
});

test('default legacy service environment remains unchanged when no instance id is supplied', () => {
  const env = hostPathEnvironment({
    workspaceConfig: '/tmp/workspace.json',
    imagePin: '/tmp/image.json',
    elevatedLease: '/tmp/lease.json',
    home: '/Users/tester',
  });
  assert.equal('WEBMCP_INSTANCE_ID' in env, false);
});
