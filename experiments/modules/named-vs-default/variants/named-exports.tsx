import type { FC } from "react";

/**
 * Named exports throughout - better for tree-shaking
 */

// Named function exports
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

// Named constant exports
export const PI = 3.14159;
export const E = 2.71828;

// Named type exports (erased at runtime)
export interface MathResult {
  operation: string;
  result: number;
}

// Named utility exports
export function calculate(
  op: string,
  a: number,
  b: number
): MathResult {
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
