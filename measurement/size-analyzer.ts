import { readFileSync, statSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import type { SizeMetrics } from "../shared/types.js";

/**
 * Analyze the size of a file, including compressed sizes.
 */
export function analyzeFile(filePath: string): SizeMetrics {
  const content = readFileSync(filePath);
  return analyzeBuffer(content);
}

/**
 * Analyze the size of a string/buffer.
 */
export function analyzeBuffer(content: Buffer | string): SizeMetrics {
  const buffer = typeof content === "string" ? Buffer.from(content) : content;
  const gzipped = gzipSync(buffer, { level: 9 });
  const brotli = brotliCompressSync(buffer);

  return {
    raw: buffer.length,
    minified: buffer.length,
    gzipped: gzipped.length,
    brotli: brotli.length,
  };
}

/**
 * Format size metrics for display.
 */
export function formatSizeMetrics(metrics: SizeMetrics): string {
  return [
    `Raw: ${formatBytes(metrics.raw)}`,
    `Gzipped: ${formatBytes(metrics.gzipped)}`,
    `Brotli: ${formatBytes(metrics.brotli)}`,
  ].join(" | ");
}

/**
 * Format bytes as human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compare two size metrics and return the difference.
 */
export function compareSizes(
  baseline: SizeMetrics,
  current: SizeMetrics
): {
  rawDelta: number;
  gzippedDelta: number;
  brotliDelta: number;
  rawPercent: number;
  gzippedPercent: number;
} {
  return {
    rawDelta: current.raw - baseline.raw,
    gzippedDelta: current.gzipped - baseline.gzipped,
    brotliDelta: current.brotli - baseline.brotli,
    rawPercent: ((current.raw - baseline.raw) / baseline.raw) * 100,
    gzippedPercent:
      ((current.gzipped - baseline.gzipped) / baseline.gzipped) * 100,
  };
}
