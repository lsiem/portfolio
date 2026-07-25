import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The WebGL stage render layer is deliberately imperative (D-08 single-
    // engine discipline): the single `useFrame` mutates three.js objects
    // (InstancedMesh.instanceMatrix.needsUpdate, mesh.geometry/visibility) and
    // reused scratch buffers every frame, allocation-free — that is the whole
    // point of React Three Fiber and is enforced by the at-rest eval suite.
    // React Compiler's `react-hooks/immutability` and `react-hooks/refs` rules
    // model React state, not the imperative WebGL scene graph, so they fire
    // false positives across the entire render loop. Scope the exemption to
    // this directory only; the rest of the app keeps both rules.
    files: ["src/components/scene/stage/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-source trees: flat config does not read .gitignore, so nested git
    // worktrees (.claude/worktrees/*, each with its own node_modules), GSD
    // planning extracts, and the vendored Google Cloud SDK must be excluded
    // explicitly — otherwise `eslint` descends into them and lints files it
    // must not.
    ".claude/**",
    ".planning/**",
    "google-cloud-sdk/**",
    // content-collections build output — generated, regenerated each build.
    ".content-collections/**",
  ]),
]);

export default eslintConfig;
