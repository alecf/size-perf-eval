import type { FC } from "react";

/**
 * Template variant B - alternative implementation.
 */

interface Props {
  data: number[];
}

// The pattern being tested (alternative approach)
function processData(items: number[]): number {
  // Variant B implementation - using reduce
  return items.reduce((sum, n) => sum + n, 0);
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
