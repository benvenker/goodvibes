/**
 * Central configuration constants for the GoodVibes game
 * All magic numbers should be defined here for easy tuning and maintenance
 */

// ============= PHYSICS & MOVEMENT =============
export const PHYSICS = {
  CAR: {
    WIDTH: 2,
    LENGTH: 4,
    COLLISION_POINT_HEIGHT: 1,
  },
  MOVEMENT: {
    INPUT_DEADZONE: 0.1,
    IMPACT_VELOCITY_THRESHOLD: 5,
  },
  WORLD: {
    GROUND_LEVEL: 0,
    GRAVITY: -30, // from existing carPhysics.ts
  },
} as const;

// ============= CAMERA =============
export const CAMERA = {
  OFFSET: { x: 0, y: 5, z: -8 },
  INITIAL_POSITION: { x: 0, y: 10, z: -10 },
  LERP_FACTOR: 0.05,
  FOV: 75,
  NEAR_PLANE: 0.1,
  FAR_PLANE: 1000,
  LOOK_AHEAD_DISTANCE: 1,
} as const;

// ============= NETWORKING =============
export const NETWORK = {
  UPDATE_INTERVAL_MS: 50,
  DEFAULT_USERNAME: 'enpeasea',
  ROTATION_PRECISION_MULTIPLIER: 1000,
  INTERPOLATION_DURATION_SECONDS: 0.1,
} as const;

// ============= AUDIO =============
export const AUDIO = {
  DEFAULT_VOLUME: 0.05,
  SPATIAL: {
    REFERENCE_DISTANCE: 5,
    ROLLOFF_FACTOR: 2,
  },
  CLEANUP_BUFFER_MS: 100,
} as const;

// ============= UI & CONTROLS =============
export const UI = {
  JOYSTICK: {
    MAX_DISTANCE: 35,
    DEAD_ZONE: 0.1,
  },
  ANIMATIONS: {
    FADE_DURATION_MS: 1000,
    OPACITY_TRANSITION: 'opacity 1s ease',
  },
  CANVAS: {
    TEXT_TEXTURE_WIDTH: 2048,
    TEXT_SPRITE: {
      WIDTH: 256,
      HEIGHT: 64,
      FONT_SIZE: 32,
      OUTLINE_WIDTH: 4,
    },
  },
  TEXT: {
    TEST_FONT_SIZE: 100,
    ASPECT_RATIO: 2.2 / 0.5,
    OUTLINE_SCALE: 1.25 * 0.9,
    OUTLINE_WIDTH_DIVISOR: 8,
  },
} as const;

// ============= ARENA & WORLD =============
export const ARENA = {
  HALF_SIZE: 50, // Note: Actual arena is 100x100
  FULL_SIZE: 100,
  WALL_HEIGHT: 5,
  GROUND: {
    SIZE: 100,
    COLOR: 0x3e8948,
    ROTATION: Math.PI / 2,
    Y_POSITION: 0,
  },
  GRID: {
    SIZE: 100,
    DIVISIONS: 50,
    COLOR_CENTER: 0x000000,
    COLOR_GRID: 0x000000,
    Y_POSITION: 0.01,
  },
} as const;

// ============= OBSTACLES =============
export const OBSTACLES = {
  BOX: {
    SIZE: 3,
    Y_POSITION: 1.5, // Half of size for ground placement
  },
  POLL: {
    RADIUS: 1,
    HEIGHT: 4,
    SEGMENTS: 32,
    Y_POSITION: 2, // Half of height for ground placement
  },
} as const;

// ============= CAR MESH DIMENSIONS =============
export const CAR_MESH = {
  BODY: {
    WIDTH: 2,
    HEIGHT: 0.5,
    LENGTH: 4,
    Y_POSITION: 0.5,
  },
  ROOF: {
    WIDTH: 1.5,
    HEIGHT: 0.4,
    LENGTH: 2,
    Y_POSITION: 1.2,
  },
  WHEELS: {
    RADIUS: 0.4,
    HEIGHT: 0.4,
    SEGMENTS: 32,
    Y_POSITION: 0.4,
    POSITIONS: [
      { x: -1.1, z: 1.5 },  // Front left
      { x: 1.1, z: 1.5 },   // Front right
      { x: -1.1, z: -1.5 }, // Back left
      { x: 1.1, z: -1.5 },  // Back right
    ],
  },
  BUMPERS: {
    WIDTH: 2.2,
    HEIGHT: 0.4,
    DEPTH: 0.3,
    Y_POSITION: 0.4,
    FRONT_Z: 2,
    BACK_Z: -2,
  },
  LIGHTS: {
    RADIUS: 0.15,
    SEGMENTS: 32,
    Y_POSITION: 0.6,
    HEADLIGHT_Z: 2.01,
    TAILLIGHT_Z: -2.01,
    X_OFFSET: 0.7,
  },
  NAME_PLATES: {
    SIDE: {
      WIDTH: 2.2,
      HEIGHT: 0.5,
      LEFT_X: -1.01,
      RIGHT_X: 1.01,
      Y_POSITION: 0.5,
    },
    HOOD: {
      WIDTH: 1.5,
      HEIGHT: 1.5,
      Y_POSITION: 0.51,
      Z_POSITION: 1,
    },
  },
  TEXT_SPRITE: {
    SCALE: { x: 2, y: 0.5, z: 1 },
    Y_OFFSET: 2.5,
  },
} as const;

// ============= LIGHTING =============
export const LIGHTING = {
  AMBIENT_INTENSITY: 0.6,
  DIRECTIONAL_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: { x: 10, y: 20, z: 10 },
  SHADOW_MAP_SIZE: 2048,
} as const;

// ============= RENDERING =============
export const RENDERING = {
  BACKGROUND_COLOR: 0x87ceeb, // Sky blue
  ANTIALIAS: true,
  PIXEL_RATIO: window.devicePixelRatio,
} as const;

// ============= TIMING =============
export const TIMING = {
  MS_TO_SECONDS: 1000,
  INTERPOLATION_ALPHA_MAX: 1,
} as const;

// Type exports for better TypeScript integration
export type PhysicsConfig = typeof PHYSICS;
export type CameraConfig = typeof CAMERA;
export type NetworkConfig = typeof NETWORK;
export type AudioConfig = typeof AUDIO;
export type UIConfig = typeof UI;
export type ArenaConfig = typeof ARENA;
export type ObstaclesConfig = typeof OBSTACLES;
export type CarMeshConfig = typeof CAR_MESH;
export type LightingConfig = typeof LIGHTING;
export type RenderingConfig = typeof RENDERING;
export type TimingConfig = typeof TIMING;