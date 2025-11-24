import * as migration_20251128_114625 from './20251128_114625';
import * as migration_20251128_120919 from './20251128_120919';
import * as migration_20251128_142515 from './20251128_142515';

export const migrations = [
  {
    up: migration_20251128_114625.up,
    down: migration_20251128_114625.down,
    name: '20251128_114625',
  },
  {
    up: migration_20251128_120919.up,
    down: migration_20251128_120919.down,
    name: '20251128_120919'
  },
  {
    up: migration_20251128_142515.up,
    down: migration_20251128_142515.down,
    name: '20251128_142515'
  },
];
