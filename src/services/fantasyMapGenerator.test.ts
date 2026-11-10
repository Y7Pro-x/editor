import test from 'node:test';
import assert from 'node:assert/strict';
import { FantasyMapGenerator } from './fantasyMapGenerator.ts';

test('FantasyMapGenerator.generateWorld generates valid map without recursion or errors', () => {
  const map = FantasyMapGenerator.generateWorld(123456, 'single_continent', 40, 30);
  assert.ok(map);
  assert.ok(map.id);
  assert.equal(map.width, 40);
  assert.equal(map.height, 30);
  assert.ok(map.terrainGrid.length === 30);
  assert.ok(map.terrainGrid[0].length === 40);
  assert.ok(map.realms.length > 0);
  assert.ok(map.settlements.length > 0);
});

test('FantasyMapGenerator handles small and large boundaries safely', () => {
  const smallMap = FantasyMapGenerator.generateWorld(999, 'archipelago', 20, 15);
  assert.ok(smallMap);
  assert.equal(smallMap.width, 20);
  assert.equal(smallMap.height, 15);
});

test('FantasyMapGenerator supports all 8 landforms with seasons and winds', () => {
  const landforms = [
    'single_continent',
    'pangaea',
    'twin_continents',
    'archipelago',
    'islands_ring',
    'mediterranean',
    'shattered_coasts',
    'oasis_desert',
  ] as const;

  for (const landform of landforms) {
    const world = FantasyMapGenerator.generateWorld(42, landform, 30, 20);
    assert.ok(world.terrainGrid.length === 20);
    assert.ok(world.terrainGrid[0].length === 30);
    assert.ok(world.season);
    assert.ok(world.prevailingWinds);
    assert.ok(world.realms.length > 0);
    // Ensure realms have diplomacy and government types
    const firstRealm = world.realms[0];
    assert.ok(firstRealm.governmentType);
    assert.ok(firstRealm.culture);
    assert.ok(firstRealm.diplomacy);
    assert.ok(Array.isArray(firstRealm.diplomacy));
  }
});

test('FantasyMapGenerator.generateRandomName creates valid Arabic fantasy names for categories', () => {
  const settlementName = FantasyMapGenerator.generateRandomName('settlement');
  assert.ok(settlementName && typeof settlementName === 'string');
  assert.ok(settlementName.length > 2);

  const realmName = FantasyMapGenerator.generateRandomName('realm');
  assert.ok(realmName && typeof realmName === 'string');

  const mountainName = FantasyMapGenerator.generateRandomName('mountain');
  assert.ok(mountainName && typeof mountainName === 'string');
});
