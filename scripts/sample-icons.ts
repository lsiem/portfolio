import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { DOMParser } from "linkedom";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import {
  mergeGeometries,
  mergeVertices,
} from "three/addons/utils/BufferGeometryUtils.js";
import {
  siDocker,
  siGitlab,
  siGrafana,
  siKubernetes,
  siLinux,
  siPostgresql,
  siPython,
  siRedis,
  siSpringboot,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

type SerializedGeometry = {
  id: string;
  position: number[];
  normal: number[];
  index: number[];
};

const icons: Array<[string, SimpleIcon]> = [
  ["typescript", siTypescript],
  ["python", siPython],
  ["spring", siSpringboot],
  ["docker", siDocker],
  ["kubernetes", siKubernetes],
  ["postgresql", siPostgresql],
  ["redis", siRedis],
  ["linux", siLinux],
  ["gitlab", siGitlab],
  ["grafana", siGrafana],
];

// SVGLoader is browser-oriented; xmldom gives its parse-only path the one DOM
// primitive it needs. No URL loader is used, so generation is offline.
Object.assign(globalThis, { DOMParser });

function round(values: ArrayLike<number>): number[] {
  return Array.from(values, (value) => Math.round(value * 10_000) / 10_000);
}

function serializeIcon(id: string, icon: SimpleIcon): SerializedGeometry {
  const parsed = new SVGLoader().parse(icon.svg);
  const geometries: THREE.BufferGeometry[] = [];
  for (const path of parsed.paths) {
    for (const shape of path.toShapes()) {
      geometries.push(
        new THREE.ExtrudeGeometry(shape, {
          depth: 1.2,
          bevelEnabled: false,
          curveSegments: 2,
        }),
      );
    }
  }
  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  if (!merged) throw new Error(`Unable to merge ${id}`);

  merged.center();
  const box = new THREE.Box3().setFromBufferAttribute(
    merged.getAttribute("position") as THREE.BufferAttribute,
  );
  const size = box.getSize(new THREE.Vector3());
  const scale = 1 / Math.max(size.x, size.y, size.z);
  merged.scale(scale, -scale, scale);
  const indexed = mergeVertices(merged, 0.0001);
  merged.dispose();
  indexed.computeVertexNormals();
  const position = indexed.getAttribute("position");
  const normal = indexed.getAttribute("normal");
  const index = indexed.getIndex();
  if (!index) throw new Error(`Generated ${id} geometry is not indexed`);
  const result = {
    id,
    position: round(position.array),
    normal: round(normal.array),
    index: Array.from(index.array),
  };
  indexed.dispose();
  return result;
}

const output = { icons: icons.map(([id, icon]) => serializeIcon(id, icon)) };
const destination = join(
  process.cwd(),
  "src/components/scene/stage/icon-geometries.json",
);
writeFileSync(destination, `${JSON.stringify(output)}\n`);
console.log(`Generated ${output.icons.length} extruded icons → ${destination}`);
