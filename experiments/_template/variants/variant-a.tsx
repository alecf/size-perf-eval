import type { FC } from "react";

/**
 * Template variant A - replace with your implementation.
 *
 * Each variant should:
 * 1. Export a React component named ExperimentComponent
 * 2. Optionally export a 'benchmark' function for perf testing
 */

interface Props {
  data: number[];
}

// The pattern being tested
function processData(items: number[]): number {
  // Variant A implementation
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i]!;
  }
  return sum;
}

// React component that uses the pattern
export const ExperimentComponent: FC<Props> = ({ data }) => {
  const result = processData(data);
  return <div>Result: {result}</div>;
};

// Optional: Export for performance benchmarking
export function benchmark(): number {
  const testData = Array.from({ length: 1000 }, (_, i) => i);
  return processData(testData);
}

export default ExperimentComponent;
