import { build, type InlineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, join, resolve } from "node:path";
import { readFileSync, statSync, rmSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import type { BuildConfig, BuildResult, SizeMetrics } from "../shared/types.js";
import { BaseBuilder } from "./base-builder.js";

/**
 * Vite builder using Rollup for bundling.
 * Externalizes React to measure only the experiment code.
 */
export class ViteBuilder extends BaseBuilder {
  name = "vite";

  async build(
    entryPath: string,
    outputDir: string,
    config: BuildConfig
  ): Promise<BuildResult> {
    const startTime = performance.now();

    try {
      const viteConfig: InlineConfig = {
        root: dirname(entryPath),
        logLevel: "silent",
        plugins: [react()],
        build: {
          outDir: outputDir,
          emptyOutDir: true,
          lib: {
            entry: entryPath,
            formats: ["es"],
            fileName: "bundle",
          },
          target: config.target,
          minify: config.minify ? (config.minifier ?? "esbuild") : false,
          sourcemap: config.sourcemap,
          rollupOptions: {
            // Externalize React - we only want to measure our code
            external: ["react", "react-dom", "react/jsx-runtime"],
            output: {
              // Ensure consistent output
              entryFileNames: "bundle.js",
              chunkFileNames: "[name].js",
            },
            treeshake: config.treeshake,
          },
        },
      };

      // Add terser-specific options if using terser
      if (config.minify && config.minifier === "terser") {
        viteConfig.build!.terserOptions = {
          compress: {
            passes: 2,
            pure_funcs: ["console.log", "console.debug"],
          },
          mangle: {
            properties: false, // Keep property names readable for experiments
          },
          format: {
            comments: false,
          },
        };
      }

      await build(viteConfig);

      const outputFile = join(outputDir, "bundle.js");
      const size = this.measureFile(outputFile);

      return {
        success: true,
        outputPath: outputFile,
        size,
        buildTimeMs: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        outputPath: "",
        size: { raw: 0, minified: 0, gzipped: 0, brotli: 0 },
        buildTimeMs: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private measureFile(filePath: string): SizeMetrics {
    const content = readFileSync(filePath);
    const raw = statSync(filePath).size;
    const gzipped = gzipSync(content, { level: 9 });
    const brotli = brotliCompressSync(content);

    return {
      raw,
      minified: content.length,
      gzipped: gzipped.length,
      brotli: brotli.length,
    };
  }

  async cleanup(): Promise<void> {
    // Vite caches are typically in node_modules/.vite
    // We don't need to clean this for experiments
  }

  getOutputFilename(): string {
    return "bundle.js";
  }
}
