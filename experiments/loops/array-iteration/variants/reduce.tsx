import type { FC } from "react";

interface Item {
  id: number;
  value: number;
  label: string;
}

/**
 * Array.prototype.reduce for all operations
 */
function processItems(items: Item[]): string[] {
  return items.reduce<string[]>((acc, item) => {
    acc.push(`${item.label}: ${item.value * 2}`);
    return acc;
  }, []);
}

function sumValues(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function filterItems(items: Item[], threshold: number): Item[] {
  return items.reduce<Item[]>((acc, item) => {
    if (item.value > threshold) {
      acc.push(item);
    }
    return acc;
  }, []);
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
