import * as THREE from "three";
import type { SceneColors } from "@/lib/theme-color-resolver";
import type { FormationId, StageBridge } from "../scene-bridge";
import type { MeasuredLayout } from "./stage-types";
import { seededRandom } from "./seeded";
import iconData from "./icon-geometries.json";

type IconRecord = {
  id: string;
  position: number[];
  normal: number[];
  index: number[];
};

const ICON_SETTLE_EPS = 0.004;
const ICON_RATE = 7;
const HERO_VISIBLE = 6;

export class IconCast {
  readonly group = new THREE.Group();
  private readonly meshes: THREE.Mesh[] = [];
  private readonly material: THREE.MeshLambertMaterial;
  private readonly targets: THREE.Vector3[] = [];
  private readonly targetScale = new Float32Array(iconData.icons.length);
  private readonly targetRotation = new Float32Array(iconData.icons.length * 3);

  constructor(colors: SceneColors) {
    this.material = new THREE.MeshLambertMaterial({
      color: colors.muted.clone(),
      emissive: colors.accent.clone(),
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.58,
    });

    for (const [index, raw] of (iconData.icons as IconRecord[]).entries()) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(raw.position, 3),
      );
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(raw.normal, 3),
      );
      geometry.setIndex(raw.index);
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.frustumCulled = false;
      mesh.scale.setScalar(0.001);
      mesh.userData.iconId = raw.id;
      this.meshes.push(mesh);
      this.targets.push(new THREE.Vector3());
      this.group.add(mesh);
      this.targetRotation[index * 3 + 2] = seededRandom(index + 2) * 0.3 - 0.15;
    }
  }

  setColors(colors: SceneColors): void {
    this.material.color.copy(colors.muted);
    this.material.emissive.copy(colors.accent);
  }

  update(
    layout: MeasuredLayout,
    bridge: StageBridge,
    elapsed: number,
    dt: number,
  ): boolean {
    const active = resolveFormation(bridge);
    this.computeTargets(layout, active, bridge, elapsed);
    const transition = bridge.transition.t;
    const ease = 1 - Math.exp(-ICON_RATE * dt);
    let unsettled = false;

    for (let i = 0; i < this.meshes.length; i += 1) {
      const mesh = this.meshes[i];
      const target = this.targets[i];
      if (transition > 0) {
        const angle = seededRandom(i * 5.7) * Math.PI * 2;
        target.x += Math.cos(angle) * transition * 4.5;
        target.y += Math.sin(angle) * transition * 4.5;
        target.z += transition * (seededRandom(i + 4) - 0.5) * 5;
      }

      const distance = mesh.position.distanceTo(target);
      const targetScale = this.targetScale[i] * (1 - transition * 0.45);
      const scaleError = Math.abs(mesh.scale.x - targetScale);
      if (distance > ICON_SETTLE_EPS || scaleError > ICON_SETTLE_EPS) {
        unsettled = true;
        mesh.position.lerp(target, ease);
        const scale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, ease);
        mesh.scale.setScalar(scale);
      } else {
        mesh.position.copy(target);
        mesh.scale.setScalar(targetScale);
      }

      const o = i * 3;
      const tumble = transition * Math.PI * (1.5 + seededRandom(i + 8));
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        this.targetRotation[o] + tumble,
        ease,
      );
      mesh.rotation.y = THREE.MathUtils.lerp(
        mesh.rotation.y,
        this.targetRotation[o + 1] + tumble * 0.75,
        ease,
      );
      mesh.rotation.z = THREE.MathUtils.lerp(
        mesh.rotation.z,
        this.targetRotation[o + 2],
        ease,
      );
    }
    return unsettled || transition > 0.0001;
  }

  dispose(): void {
    for (const mesh of this.meshes) mesh.geometry.dispose();
    this.material.dispose();
  }

  private computeTargets(
    layout: MeasuredLayout,
    active: FormationId,
    bridge: StageBridge,
    elapsed: number,
  ): void {
    for (let i = 0; i < this.meshes.length; i += 1) {
      this.targetScale[i] = 0.001;
      this.targets[i].set(0, 0, -8);
    }

    if (active === "constellation") {
      const hero = layout.sections.hero;
      if (!hero) return;
      for (let i = 0; i < HERO_VISIBLE; i += 1) {
        const side = i % 2 === 0 ? 1 : -1;
        const x = hero.left + hero.width * (i % 2 === 0 ? 0.88 : 0.72);
        const y = hero.top + hero.height * (0.22 + (i % 3) * 0.25);
        const ambient = bridge.ambientVisible ? Math.sin(elapsed * 0.8 + i) * 0.08 : 0;
        this.targets[i].set(
          worldX(layout, x) + bridge.pointer.x * side * 0.14,
          worldY(layout, y) + bridge.pointer.y * 0.1 + ambient,
          0.35 + (i % 3) * 0.28,
        );
        this.targetScale[i] = 0.4 + (i % 3) * 0.08;
        this.targetRotation[i * 3 + 1] = bridge.pointer.x * 0.3 + i * 0.18;
        this.targetRotation[i * 3] = bridge.pointer.y * 0.2 - 0.18;
      }
      return;
    }

    if (active === "orbits") {
      const rects = layout.skillClusterRects;
      if (!rects.length) return;
      for (let i = 0; i < this.meshes.length; i += 1) {
        const rect = rects[i % rects.length];
        const side = Math.floor(i / rects.length) % 2 === 0 ? 0.94 : 0.82;
        this.targets[i].set(
          worldX(layout, rect.left + rect.width * side),
          worldY(layout, rect.top + rect.height / 2),
          0.2 + (i % 3) * 0.18,
        );
        this.targetScale[i] = 0.36;
        this.targetRotation[i * 3 + 1] = bridge.pageProgress * Math.PI * (i % 2 ? -2 : 2);
        this.targetRotation[i * 3] = (i % 3 - 1) * 0.2;
      }
      return;
    }

    if (active === "glyph") {
      const contact = layout.sections.contact;
      if (!contact) return;
      for (let i = 0; i < 4; i += 1) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        this.targets[i].set(
          worldX(layout, contact.left + contact.width / 2) + Math.cos(angle) * 2,
          worldY(layout, contact.top + contact.height / 2) + Math.sin(angle) * 1.2,
          0.1,
        );
        this.targetScale[i] = 0.42;
      }
    }
  }
}

function resolveFormation(bridge: StageBridge): FormationId {
  if (bridge.transition.phase !== "idle") return bridge.routeFormation;
  if (!bridge.formation) return bridge.routeFormation;
  return bridge.formation.t > 0.5
    ? bridge.formation.to
    : bridge.formation.from;
}

function worldX(layout: MeasuredLayout, docX: number): number {
  return (docX - layout.viewport.w / 2) * layout.worldPerPixel;
}

function worldY(layout: MeasuredLayout, docY: number): number {
  return (layout.viewport.h / 2 - docY) * layout.worldPerPixel;
}
