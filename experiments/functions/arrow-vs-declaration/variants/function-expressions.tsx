import type { FC } from "react";

/**
 * Named function expressions (const x = function name() {})
 */

const add = function add(a: number, b: number): number {
  return a + b;
};

const multiply = function multiply(a: number, b: number): number {
  return a * b;
};

const formatNumber = function formatNumber(n: number): string {
  return n.toFixed(2);
};

const processArray = function processArray(items: number[]): number[] {
  return items
    .map(function double(x) {
      return x * 2;
    })
    .filter(function greaterThan10(x) {
      return x > 10;
    });
};

const createPair = function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
};

const compose = function compose<T, U, V>(
  f: (x: U) => V,
  g: (x: T) => U
): (x: T) => V {
  return function composed(x: T): V {
    return f(g(x));
  };
};

interface Props {
  numbers: number[];
}

export const ExperimentComponent: FC<Props> = function ExperimentComponent({
  numbers,
}) {
  const sum = numbers.reduce(function sumReducer(a, b) {
    return add(a, b);
  }, 0);
  const product = numbers.reduce(function productReducer(a, b) {
    return multiply(a, b);
  }, 1);
  const processed = processArray(numbers);
  const pair = createPair(sum, product);
  const doubleAndFormat = compose(formatNumber, function doubler(x: number) {
    return x * 2;
  });

  return (
    <div>
      <p>Sum: {formatNumber(sum)}</p>
      <p>Product: {formatNumber(product)}</p>
      <p>Processed: {processed.join(", ")}</p>
      <p>Pair: {pair.join(", ")}</p>
      <p>Double first: {doubleAndFormat(numbers[0] ?? 0)}</p>
    </div>
  );
};

export function benchmark(): number {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return nums.reduce(function sumReducer(a, b) {
    return add(a, b);
  }, 0);
}

export default ExperimentComponent;
