import type { FC } from "react";

/**
 * Mix of named and default exports
 */

// Named exports for utilities
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  return a / b;
}

// Named exports for constants
export const PI = 3.14159;
export const E = 2.71828;

// Named type export
export interface MathResult {
  operation: string;
  result: number;
}

// Named utility
export function calculate(op: string, a: number, b: number): MathResult {
  let result: number;
  switch (op) {
    case "add":
      result = add(a, b);
      break;
    case "subtract":
      result = subtract(a, b);
      break;
    case "multiply":
      result = multiply(a, b);
      break;
    case "divide":
      result = divide(a, b);
      break;
    default:
      result = 0;
  }
  return { operation: op, result };
}

interface Props {
  operations: Array<{ op: string; a: number; b: number }>;
}

// Named export for the component
export const ExperimentComponent: FC<Props> = ({ operations }) => {
  const results = operations.map((o) => calculate(o.op, o.a, o.b));
  return (
    <ul>
      {results.map((r, i) => (
        <li key={i}>
          {r.operation}: {r.result}
        </li>
      ))}
    </ul>
  );
};

export function benchmark(): number {
  return add(multiply(2, 3), divide(10, 2));
}

// Default export same as named
export default ExperimentComponent;
