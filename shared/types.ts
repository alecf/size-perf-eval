import { z } from "zod";

// Build configuration options
export const BuildConfigSchema = z.object({
  name: z.string(),
  target: z.enum(["es2020", "es2022", "es2023", "esnext"]),
  minify: z.boolean(),
  minifier: z.enum(["esbuild", "terser"]).optional(),
  sourcemap: z.boolean().default(false),
  treeshake: z.boolean().default(true),
});
export type BuildConfig = z.infer<typeof BuildConfigSchema>;

// Size metrics
export interface SizeMetrics {
  raw: number;
  minified: number;
  gzipped: number;
  brotli: number;
}

// Performance metrics
export interface PerfMetrics {
  execTimeMs: number;
  iterations: number;
}

// Build result from a single builder run
export interface BuildResult {
  success: boolean;
  outputPath: string;
  size: SizeMetrics;
  buildTimeMs: number;
  errors?: string[];
}

// Experiment variant definition
export const VariantDefSchema = z.object({
  id: z.string(),
  file: z.string(),
  description: z.string().optional(),
});
export type VariantDef = z.infer<typeof VariantDefSchema>;

// Experiment configuration from experiment.json
export const ExperimentConfigSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  variants: z.array(VariantDefSchema),
  config: z
    .object({
      iterations: z.number().default(3),
      performanceBenchmark: z.boolean().default(true),
      buildConfigs: z.array(z.string()).optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});
export type ExperimentConfig = z.infer<typeof ExperimentConfigSchema>;

// Result for a single variant across all builders/configs
export interface VariantResult {
  variantId: string;
  description?: string;
  builds: {
    [builderName: string]: {
      [configName: string]: {
        size: SizeMetrics;
        perf?: PerfMetrics;
        buildTimeMs: number;
        errors?: string[];
      };
    };
  };
}

// Full experiment result
export interface ExperimentResult {
  experimentId: string;
  category: string;
  timestamp: string;
  variants: VariantResult[];
  metadata: {
    nodeVersion: string;
    platform: string;
  };
}

// Aggregated results across all experiments
export interface ResultsSummary {
  timestamp: string;
  experiments: ExperimentResult[];
  metadata: {
    nodeVersion: string;
    platform: string;
    totalBuildTimeMs: number;
  };
}

// Default build configurations
export const DEFAULT_BUILD_CONFIGS: BuildConfig[] = [
  {
    name: "default",
    target: "es2023",
    minify: true,
    minifier: "esbuild",
    sourcemap: false,
    treeshake: true,
  },
  {
    name: "terser",
    target: "es2023",
    minify: true,
    minifier: "terser",
    sourcemap: false,
    treeshake: true,
  },
];
