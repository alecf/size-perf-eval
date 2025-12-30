import type { FC } from "react";

interface Item {
  id: number;
  value: number;
  label: string;
}

/**
 * Array.prototype.forEach
 */
function processItems(items: Item[]): string[] {
  const results: string[] = [];
  items.forEach((item) => {
    results.push(`${item.label}: ${item.value * 2}`);
  });
  return results;
}

function sumValues(items: Item[]): number {
  let sum = 0;
  items.forEach((item) => {
    sum += item.value;
  });
  return sum;
}

function filterItems(items: Item[], threshold: number): Item[] {
  const filtered: Item[] = [];
  items.forEach((item) => {
    if (item.value > threshold) {
      filtered.push(item);
    }
  });
  return filtered;
}

interface Props {
  items: Item[];
}

export const ExperimentComponent: FC<Props> = ({ items }) => {
  const processed = processItems(items);
  const sum = sumValues(items);
  const filtered = filterItems(items, 5);
  return (
    <div>
      <div>{processed.join(", ")}</div>
      <div>Sum: {sum}</div>
      <div>Filtered: {filtered.length}</div>
    </div>
  );
};

export function benchmark(): number {
  const items: Item[] = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    value: i * 2,
    label: `Item ${i}`,
  }));
  return sumValues(items);
}

export default ExperimentComponent;
