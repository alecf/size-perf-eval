import type { FC } from "react";

/**
 * Default exports where possible
 */

// Functions as object for default export
const mathUtils = {
  add(a: number, b: number): number {
    return a + b;
  },
  subtract(a: number, b: number): number {
    return a - b;
  },
  multiply(a: number, b: number): number {
    return a * b;
  },
  divide(a: number, b: number): number {
    return a / b;
  },
};

// Constants bundled
const constants = {
  PI: 3.14159,
  E: 2.71828,
};

interface MathResult {
  operation: string;
  result: number;
}

function calculate(op: string, a: number, b: number): MathResult {
  let result: number;
  switch (op) {
    case "add":
      result = mathUtils.add(a, b);
      break;
    case "subtract":
      result = mathUtils.subtract(a, b);
      break;
    case "multiply":
      result = mathUtils.multiply(a, b);
      break;
    case "divide":
      result = mathUtils.divide(a, b);
      break;
    default:
      result = 0;
  }
  return { operation: op, result };
}

interface Props {
  operations: Array<{ op: string; a: number; b: number }>;
}

const ExperimentComponent: FC<Props> = ({ operations }) => {
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
  return mathUtils.add(mathUtils.multiply(2, 3), mathUtils.divide(10, 2));
}

// Single default export
export default ExperimentComponent;
