import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node test environment
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => {
    storage[key] = val;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const k in storage) delete storage[k];
  },
};

import { DatabaseService } from './databaseService.ts';

test('DatabaseService.getWorldMaps seeds initial map without recursion', () => {
  const db = DatabaseService.getInstance();
  const maps = db.getWorldMaps();
  assert.ok(Array.isArray(maps));
  assert.equal(maps.length, 1);
  assert.ok(maps[0].id);

  // Calling getActiveWorldMap returns the same map without recursion
  const active = db.getActiveWorldMap();
  assert.equal(active.id, maps[0].id);

  // Saving updated map works cleanly
  db.saveWorldMap({ ...active, name: 'خريطة محدثة' });
  const updatedMaps = db.getWorldMaps();
  assert.equal(updatedMaps[0].name, 'خريطة محدثة');
});
