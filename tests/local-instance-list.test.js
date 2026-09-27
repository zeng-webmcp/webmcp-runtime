import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  listWebMcpInstances,
  parseLocalInstanceControlArgs,
} from '../native/deploy/local-instance-controller.js';
import { createInstanceContext } from '../native/deploy/instance-context.js';

test('instance-list needs no instance id while instance commands still require one', () => {
  assert.deepEqual(parseLocalInstanceControlArgs(['instance-list']), {
    command: 'instance-list',
    options: {},
  });
  assert.throws(
    () => parseLocalInstanceControlArgs(['mount-list']),
    { code: 'INVALID_LOCAL_INSTANCE_ARGUMENTS' },
  );
});

test('instance-list reports only installed config files and sorts non-default instances', async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'webmcp-instance-list-'));
  try {
    const defaultContext = createInstanceContext({ home, instanceId: 'default' });
    const webmcp = createInstanceContext({ home, instanceId: 'webmcp' });
    const prism = createInstanceContext({ home, instanceId: 'prism' });
    const ignored = createInstanceContext({ home, instanceId: 'unused' });

    for (const context of [defaultContext, webmcp, prism]) {
      await mkdir(path.dirname(context.workspaceConfig), { recursive: true });
      await writeFile(context.workspaceConfig, '{}\n');
    }
    await mkdir(path.dirname(ignored.workspaceConfig), { recursive: true });

    assert.deepEqual(await listWebMcpInstances({ home }), {
      instances: [
        { id: 'default', isDefault: true },
        { id: 'prism', isDefault: false },
        { id: 'webmcp', isDefault: false },
      ],
    });
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
