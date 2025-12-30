import { pathToFileURL } from "node:url";
import type { PerfMetrics } from "../shared/types.js";

/**
 * Benchmark the execution performance of a built bundle.
 *
 * Note: This measures the raw function execution time, not React rendering.
 * The bundle must export a function to benchmark.
 */
export async function benchmarkBundle(
  bundlePath: string,
  options: {
    iterations?: number;
    warmupIterations?: number;
    functionName?: string;
    args?: unknown[];
  } = {}
): Promise<PerfMetrics> {
  const {
    iterations = 10000,
    warmupIterations = 1000,
    functionName = "benchmark",
    args = [],
  } = options;

  try {
    // Dynamic import the bundle
    const moduleUrl = pathToFileURL(bundlePath).href;
    const module = await import(moduleUrl);

    const fn = module[functionName] ?? module.default?.benchmark ?? module.default;

    if (typeof fn !== "function") {
      return {
        execTimeMs: -1,
        iterations: 0,
      };
    }

    // Warmup
    for (let i = 0; i < warmupIterations; i++) {
      fn(...args);
    }

    // Force GC if available
    if (global.gc) {
      global.gc();
    }

    // Benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn(...args);
    }
    const end = performance.now();

    const totalTimeMs = end - start;
    const avgTimeMs = totalTimeMs / iterations;

    return {
      execTimeMs: avgTimeMs,
      iterations,
    };
  } catch (error) {
    // If we can't benchmark (e.g., React not available), return -1
    return {
      execTimeMs: -1,
      iterations: 0,
    };
  }
}

/**
 * Format performance metrics for display.
 */
export function formatPerfMetrics(metrics: PerfMetrics): string {
  if (metrics.execTimeMs < 0) {
    return "N/A (could not benchmark)";
  }

  if (metrics.execTimeMs < 0.001) {
    return `${(metrics.execTimeMs * 1_000_000).toFixed(2)} ns/op (${metrics.iterations} iterations)`;
  }
  if (metrics.execTimeMs < 1) {
    return `${(metrics.execTimeMs * 1000).toFixed(2)} µs/op (${metrics.iterations} iterations)`;
  }
  return `${metrics.execTimeMs.toFixed(2)} ms/op (${metrics.iterations} iterations)`;
}

/**
 * Compare two performance metrics.
 */
export function comparePerf(
  baseline: PerfMetrics,
  current: PerfMetrics
): {
  deltaMs: number;
  percentChange: number;
  faster: boolean;
} {
  if (baseline.execTimeMs < 0 || current.execTimeMs < 0) {
    return { deltaMs: 0, percentChange: 0, faster: false };
  }

  const deltaMs = current.execTimeMs - baseline.execTimeMs;
  const percentChange = (deltaMs / baseline.execTimeMs) * 100;

  return {
    deltaMs,
    percentChange,
    faster: deltaMs < 0,
  };
}
