import type { FC } from "react";

interface Item {
  id: number;
  value: number;
  label: string;
}

/**
 * Traditional for loop with index access.
 */
function processItems(items: Item[]): string[] {
  const results: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    results.push(`${item.label}: ${item.value * 2}`);
  }
  return results;
}

function sumValues(items: Item[]): number {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i]!.value;
  }
  return sum;
}

function filterItems(items: Item[], threshold: number): Item[] {
  const filtered: Item[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i]!.value > threshold) {
      filtered.push(items[i]!);
    }
  }
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
