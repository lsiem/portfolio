import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
