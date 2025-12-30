import { transformSync, minifySync } from "@swc/core";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { gzipSync, brotliCompressSync } from "node:zlib";
import type { BuildConfig, BuildResult, SizeMetrics } from "../shared/types.js";
import { BaseBuilder } from "./base-builder.js";

/**
 * SWC builder - uses SWC for transformation and minification.
 * This is the same toolchain Next.js uses under the hood.
 * Externalizes React to measure only the experiment code.
 */
export class SwcBuilder extends BaseBuilder {
  name = "swc";

  async build(
    entryPath: string,
    outputDir: string,
    config: BuildConfig
  ): Promise<BuildResult> {
    const startTime = performance.now();

    try {
      const source = readFileSync(entryPath, "utf-8");

      // Transform TSX to JS
      const transformed = transformSync(source, {
        filename: entryPath,
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: this.mapTarget(config.target),
          transform: {
            react: {
              runtime: "automatic",
              importSource: "react",
            },
          },
        },
        module: {
          type: "es6",
        },
      });

      let output = transformed.code;

      // Minify if requested
      if (config.minify) {
        const minified = minifySync(output, {
          compress: {
            passes: 2,
            pure_funcs: ["console.log", "console.debug"],
          },
          mangle: true,
          format: {
            comments: false,
          },
        });
        output = minified.code;
      }

      // Write output
      mkdirSync(outputDir, { recursive: true });
      const outputFile = join(outputDir, "bundle.js");
      writeFileSync(outputFile, output);

      const size = this.measureContent(output);

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

  private mapTarget(
    target: BuildConfig["target"]
  ): "es2020" | "es2022" | "es2024" {
    // SWC uses slightly different target names
    switch (target) {
      case "es2020":
        return "es2020";
      case "es2022":
        return "es2022";
      case "es2023":
      case "esnext":
        return "es2024"; // SWC's latest
      default:
        return "es2022";
    }
  }

  private measureContent(content: string): SizeMetrics {
    const buffer = Buffer.from(content, "utf-8");
    const gzipped = gzipSync(buffer, { level: 9 });
    const brotli = brotliCompressSync(buffer);

    return {
      raw: buffer.length,
      minified: buffer.length,
      gzipped: gzipped.length,
      brotli: brotli.length,
    };
  }

  async cleanup(): Promise<void> {
    // No cleanup needed
  }

  getOutputFilename(): string {
    return "bundle.js";
  }
}
