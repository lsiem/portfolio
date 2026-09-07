import type { FormationId } from "../scene-bridge";
import { seededRandom } from "./seeded";
import {
  COLOR_MIX,
  FLOATS_PER_PARTICLE,
  LAYER,
  POSITION_EPSILON,
  POSITION_LERP_RATE,
  PX,
  PY,
  PZ,
  SCATTER_DISTANCE,
  SIZE,
  VELOCITY_CAP,
  VELOCITY_DECAY_RATE,
  VELOCITY_EPSILON,
  type ParticleEngineInputs,
  type ParticleTargetResolver,
} from "./particle-types";

const TRANSITION_EPSILON = 0.0001;
const STAGGER_SPAN = 0.3;
const EPSILON_SQ = POSITION_EPSILON * POSITION_EPSILON;

export class ParticleEngine {
  private readonly count: number;
  private readonly resolve: ParticleTargetResolver;
  private readonly state: Float32Array;
  private readonly stagger: Float32Array;
  private readonly curl: Float32Array;
  private readonly turbulencePhase: Float32Array;
  private inputs: ParticleEngineInputs | null = null;
  private lastFormationRef: ParticleEngineInputs["formation"] = null;
  private lastRouteFormation: FormationId = "constellation";
  private mode: "scroll" | "route" = "route";
  private initialized = false;
  private needsFrameFlag = false;

  constructor(count: number, resolve: ParticleTargetResolver) {
    this.count = count;
    this.resolve = resolve;
    this.state = new Float32Array(count * FLOATS_PER_PARTICLE);
    this.stagger = new Float32Array(count);
    this.curl = new Float32Array(count * 3);
    this.turbulencePhase = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      this.stagger[i] = seededRandom(i * 11.7 + 0.2);
      const angle = seededRandom(i * 3.7 + 1) * Math.PI * 2;
      const radius = 0.65 + seededRandom(i * 3.7 + 2) * 0.75;
      const z = seededRandom(i * 3.7 + 3) - 0.5;
      const o = i * 3;
      this.curl[o] = (Math.cos(angle) - Math.sin(angle) * 0.8) * radius;
      this.curl[o + 1] = (Math.sin(angle) + Math.cos(angle) * 0.8) * radius;
      this.curl[o + 2] = z * radius;
      this.turbulencePhase[i] = seededRandom(i * 5.1 + 9) * Math.PI * 2;
    }
  }

  setInputs(inputs: ParticleEngineInputs): void {
    this.inputs = inputs;
  }

  get needsFrame(): boolean {
    return this.needsFrameFlag;
  }

  step(dt: number, elapsed: number, out: Float32Array): void {
    const inputs = this.inputs;
    if (!inputs) {
      this.needsFrameFlag = false;
      return;
    }
    this.ensureInitialized(inputs);

    if (inputs.formation && inputs.formation !== this.lastFormationRef) {
      this.lastFormationRef = inputs.formation;
      this.mode = "scroll";
    }
    if (inputs.routeFormation !== this.lastRouteFormation) {
      this.lastRouteFormation = inputs.routeFormation;
      this.mode = "route";
    }

    const scroll = this.mode === "scroll" && inputs.formation !== null;
    const from = this.resolve(scroll ? inputs.formation!.from : this.lastRouteFormation);
    const to = this.resolve(scroll ? inputs.formation!.to : this.lastRouteFormation);
    const morph = scroll ? clamp01(inputs.formation!.t) : 0;
    const same = from === to;
    const transition = clamp01(inputs.transitionT);
    const transitionActive = transition > TRANSITION_EPSILON;

    let velocity = Math.min(Math.max(inputs.scrollVelocity, 0), VELOCITY_CAP);
    if (velocity > VELOCITY_EPSILON) {
      velocity *= Math.exp(-VELOCITY_DECAY_RATE * dt);
      if (velocity <= VELOCITY_EPSILON) velocity = 0;
    } else {
      velocity = 0;
    }
    inputs.scrollVelocity = velocity;

    const settle = 1 - Math.exp(-POSITION_LERP_RATE * dt);
    const turbulence = Math.min(velocity / 40, 1) * 0.18;
    let maxErrorSq = 0;
    let maxScalarError = 0;

    for (let i = 0; i < this.count; i += 1) {
      const o = i * FLOATS_PER_PARTICLE;
      const c = i * 3;
      const staggerT = same
        ? 0
        : clamp01((morph - this.stagger[i] * STAGGER_SPAN) / (1 - STAGGER_SPAN));

      let tx = mix(from.data[o + PX], to.data[o + PX], staggerT);
      let ty = mix(from.data[o + PY], to.data[o + PY], staggerT);
      let tz = mix(from.data[o + PZ], to.data[o + PZ], staggerT);
      const curlEase = transition * transition * (3 - 2 * transition);
      tx += this.curl[c] * SCATTER_DISTANCE * curlEase;
      ty += this.curl[c + 1] * SCATTER_DISTANCE * curlEase;
      tz += this.curl[c + 2] * SCATTER_DISTANCE * curlEase;

      const dx = tx - this.state[o + PX];
      const dy = ty - this.state[o + PY];
      const dz = tz - this.state[o + PZ];
      const err = dx * dx + dy * dy + dz * dz;
      maxErrorSq = Math.max(maxErrorSq, err);
      if (err <= EPSILON_SQ && !transitionActive) {
        this.state[o + PX] = tx;
        this.state[o + PY] = ty;
        this.state[o + PZ] = tz;
      } else {
        this.state[o + PX] += dx * settle;
        this.state[o + PY] += dy * settle;
        this.state[o + PZ] += dz * settle;
      }

      const targetSize = mix(from.data[o + SIZE], to.data[o + SIZE], staggerT);
      const targetColor = mix(
        from.data[o + COLOR_MIX],
        to.data[o + COLOR_MIX],
        staggerT,
      );
      const sizeDiff = targetSize - this.state[o + SIZE];
      const colorDiff = targetColor - this.state[o + COLOR_MIX];
      maxScalarError = Math.max(
        maxScalarError,
        Math.abs(sizeDiff),
        Math.abs(colorDiff),
      );
      this.state[o + SIZE] += sizeDiff * settle;
      this.state[o + COLOR_MIX] += colorDiff * settle;
      this.state[o + LAYER] = to.data[o + LAYER];

      const phase = elapsed * 6 + this.turbulencePhase[i];
      out[o + PX] = this.state[o + PX] + Math.cos(phase) * turbulence;
      out[o + PY] = this.state[o + PY] + Math.sin(phase * 0.83) * turbulence;
      out[o + PZ] = this.state[o + PZ] + Math.sin(phase) * turbulence * 0.65;
      out[o + SIZE] = this.state[o + SIZE];
      out[o + COLOR_MIX] = this.state[o + COLOR_MIX];
      out[o + LAYER] = this.state[o + LAYER];
    }

    this.needsFrameFlag =
      maxErrorSq > EPSILON_SQ ||
      maxScalarError > POSITION_EPSILON ||
      velocity > 0 ||
      transitionActive;
  }

  private ensureInitialized(inputs: ParticleEngineInputs): void {
    if (this.initialized) return;
    this.lastFormationRef = inputs.formation;
    this.lastRouteFormation = inputs.routeFormation;
    this.mode = "route";
    this.state.set(this.resolve(inputs.routeFormation).data);
    this.initialized = true;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
