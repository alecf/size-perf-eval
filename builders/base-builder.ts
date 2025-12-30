import type { BuildConfig, BuildResult } from "../shared/types.js";

/**
 * Abstract base class for build system adapters.
 * Each builder (Vite, Next.js) implements this interface.
 */
export abstract class BaseBuilder {
  abstract name: string;

  /**
   * Build a single experiment variant file.
   * @param entryPath - Absolute path to the variant .tsx file
   * @param outputDir - Directory to write build output
   * @param config - Build configuration options
   */
  abstract build(
    entryPath: string,
    outputDir: string,
    config: BuildConfig
  ): Promise<BuildResult>;

  /**
   * Clean up any temporary files or caches.
   */
  abstract cleanup(): Promise<void>;

  /**
   * Get the default output filename for this builder.
   */
  abstract getOutputFilename(): string;
}
