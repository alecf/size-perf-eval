#!/usr/bin/env node

import { program } from "commander";
import { glob } from "glob";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import chalk from "chalk";
import {
  ExperimentConfigSchema,
  DEFAULT_BUILD_CONFIGS,
  type ExperimentConfig,
  type ExperimentResult,
  type VariantResult,
  type ResultsSummary,
} from "../shared/types.js";
import { getAllBuilders, type BaseBuilder } from "../builders/index.js";
import { formatSizeMetrics, formatBytes } from "../measurement/index.js";

const PROJECT_ROOT = resolve(dirname(import.meta.url.replace("file://", "")), "..");
const EXPERIMENTS_DIR = join(PROJECT_ROOT, "experiments");
const RESULTS_DIR = join(PROJECT_ROOT, "results");

interface RunOptions {
  all?: boolean;
  single?: string;
  category?: string;
  builder?: string;
  config?: string;
  output?: string;
  verbose?: boolean;
}

/**
 * Discover all experiments in the experiments directory.
 */
async function discoverExperiments(): Promise<string[]> {
  const pattern = join(EXPERIMENTS_DIR, "**/experiment.json");
  const files = await glob(pattern, { ignore: ["**/node_modules/**", "**/_template/**"] });
  return files.map((f) => dirname(f));
}

/**
 * Load and validate an experiment configuration.
 */
function loadExperiment(experimentDir: string): ExperimentConfig {
  const configPath = join(experimentDir, "experiment.json");
  const raw = JSON.parse(readFileSync(configPath, "utf-8"));
  return ExperimentConfigSchema.parse(raw);
}

/**
 * Run a single experiment and return results.
 */
async function runExperiment(
  experimentDir: string,
  builders: BaseBuilder[],
  options: RunOptions
): Promise<ExperimentResult> {
  const config = loadExperiment(experimentDir);
  const experimentId = `${config.category}/${config.name}`;

  if (options.verbose) {
    console.log(chalk.blue(`\n📦 Running experiment: ${experimentId}`));
  }

  const variants: VariantResult[] = [];

  for (const variant of config.variants) {
    const variantPath = join(experimentDir, variant.file);

    if (!existsSync(variantPath)) {
      console.log(chalk.yellow(`  ⚠️  Variant file not found: ${variant.file}`));
      continue;
    }

    if (options.verbose) {
      console.log(chalk.gray(`  → Variant: ${variant.id}`));
    }

    const variantResult: VariantResult = {
      variantId: variant.id,
      ...(variant.description && { description: variant.description }),
      builds: {},
    };

    for (const builder of builders) {
      variantResult.builds[builder.name] = {};

      for (const buildConfig of DEFAULT_BUILD_CONFIGS) {
        if (options.config && buildConfig.name !== options.config) {
          continue;
        }

        const outputDir = join(
          RESULTS_DIR,
          "raw",
          experimentId,
          variant.id,
          builder.name,
          buildConfig.name
        );

        mkdirSync(outputDir, { recursive: true });

        const result = await builder.build(variantPath, outputDir, buildConfig);

        variantResult.builds[builder.name]![buildConfig.name] = {
          size: result.size,
          buildTimeMs: result.buildTimeMs,
          ...(result.errors && { errors: result.errors }),
        };

        if (options.verbose) {
          if (result.success) {
            console.log(
              chalk.green(`    ✓ ${builder.name}/${buildConfig.name}: ${formatBytes(result.size.gzipped)} gzipped`)
            );
          } else {
            console.log(chalk.red(`    ✗ ${builder.name}/${buildConfig.name}: ${result.errors?.join(", ")}`));
          }
        }
      }
    }

    variants.push(variantResult);
  }

  return {
    experimentId,
    category: config.category,
    timestamp: new Date().toISOString(),
    variants,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
    },
  };
}

/**
 * Run experiments based on options.
 */
async function run(options: RunOptions): Promise<void> {
  console.log(chalk.bold("\n🔬 Bundle Size Experiment Runner\n"));

  // Get builders
  let builders = getAllBuilders();
  if (options.builder) {
    builders = builders.filter((b) => b.name === options.builder);
    if (builders.length === 0) {
      console.log(chalk.red(`Unknown builder: ${options.builder}`));
      process.exit(1);
    }
  }

  console.log(chalk.gray(`Builders: ${builders.map((b) => b.name).join(", ")}`));

  // Discover experiments
  let experimentDirs = await discoverExperiments();

  if (experimentDirs.length === 0) {
    console.log(chalk.yellow("\nNo experiments found. Create experiments in experiments/ directory."));
    console.log(chalk.gray("See experiments/_template for the expected structure."));
    return;
  }

  // Filter by category or single
  if (options.single) {
    experimentDirs = experimentDirs.filter((d) => d.includes(options.single!));
  } else if (options.category) {
    experimentDirs = experimentDirs.filter((d) => d.includes(`/${options.category}/`));
  }

  console.log(chalk.gray(`Found ${experimentDirs.length} experiment(s)\n`));

  const startTime = performance.now();
  const results: ExperimentResult[] = [];

  for (const dir of experimentDirs) {
    try {
      const result = await runExperiment(dir, builders, options);
      results.push(result);
    } catch (error) {
      console.log(chalk.red(`Error running ${dir}: ${error}`));
    }
  }

  const totalTime = performance.now() - startTime;

  // Save results
  const summary: ResultsSummary = {
    timestamp: new Date().toISOString(),
    experiments: results,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      totalBuildTimeMs: totalTime,
    },
  };

  const outputDir = join(RESULTS_DIR, "reports");
  mkdirSync(outputDir, { recursive: true });

  const outputFile = options.output ?? join(outputDir, "summary.json");
  writeFileSync(outputFile, JSON.stringify(summary, null, 2));

  console.log(chalk.green(`\n✅ Results saved to: ${outputFile}`));
  console.log(chalk.gray(`Total time: ${(totalTime / 1000).toFixed(2)}s`));

  // Print summary table
  printSummary(results);
}

/**
 * Print a summary table of results.
 */
function printSummary(results: ExperimentResult[]): void {
  console.log(chalk.bold("\n📊 Summary\n"));

  for (const experiment of results) {
    console.log(chalk.blue(`${experiment.experimentId}`));

    for (const variant of experiment.variants) {
      console.log(chalk.gray(`  ${variant.variantId}:`));

      for (const [builderName, configs] of Object.entries(variant.builds)) {
        for (const [configName, result] of Object.entries(configs)) {
          const gzipped = result.size.gzipped;
          console.log(
            chalk.white(`    ${builderName}/${configName}: `) +
              chalk.cyan(`${formatBytes(gzipped)} gzipped`)
          );
        }
      }
    }
    console.log();
  }
}

// CLI setup
program
  .name("experiment-runner")
  .description("Run bundle size experiments")
  .option("--all", "Run all experiments")
  .option("--single <path>", "Run a single experiment by path")
  .option("--category <name>", "Run experiments in a category")
  .option("--builder <name>", "Use only specified builder (vite, swc)")
  .option("--config <name>", "Use only specified config (default, terser)")
  .option("--output <path>", "Output file path")
  .option("-v, --verbose", "Verbose output")
  .action(run);

program.parse();
