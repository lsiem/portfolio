import type { FormationId } from "../scene-bridge";

export const DESKTOP_PARTICLES = 2400;
export const MOBILE_PARTICLES = 900;
export const FLOATS_PER_PARTICLE = 6;

export const PX = 0;
export const PY = 1;
export const PZ = 2;
export const SIZE = 3;
export const COLOR_MIX = 4;
export const LAYER = 5;

export const POSITION_LERP_RATE = 8;
export const POSITION_EPSILON = 0.003;
export const VELOCITY_DECAY_RATE = 10;
export const VELOCITY_EPSILON = 0.5;
export const VELOCITY_CAP = 60;
export const SCATTER_DISTANCE = 6;

export interface ParticleTargets {
  version: number;
  data: Float32Array;
}

export interface ParticleEngineInputs {
  formation: { from: FormationId; to: FormationId; t: number } | null;
  routeFormation: FormationId;
  transitionT: number;
  scrollVelocity: number;
}

export type ParticleTargetResolver = (
  id: FormationId,
) => ParticleTargets;
