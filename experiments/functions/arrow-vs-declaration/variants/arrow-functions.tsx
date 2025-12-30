import type { FC } from "react";

/**
 * Arrow function expressions
 */

const add = (a: number, b: number): number => a + b;

const multiply = (a: number, b: number): number => a * b;

const formatNumber = (n: number): string => n.toFixed(2);

const processArray = (items: number[]): number[] =>
  items.map((x) => x * 2).filter((x) => x > 10);

const createPair = <T, U>(first: T, second: U): [T, U] => [first, second];

const compose =
  <T, U, V>(f: (x: U) => V, g: (x: T) => U) =>
  (x: T): V =>
    f(g(x));

interface Props {
  numbers: number[];
}

export const ExperimentComponent: FC<Props> = ({ numbers }) => {
  const sum = numbers.reduce((a, b) => add(a, b), 0);
  const product = numbers.reduce((a, b) => multiply(a, b), 1);
  const processed = processArray(numbers);
  const pair = createPair(sum, product);
  const doubleAndFormat = compose(formatNumber, (x: number) => x * 2);

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
  return nums.reduce((a, b) => add(a, b), 0);
}

export default ExperimentComponent;
