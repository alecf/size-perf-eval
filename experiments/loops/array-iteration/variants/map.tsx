import type { FC } from "react";

interface Item {
  id: number;
  value: number;
  label: string;
}

/**
 * Array.prototype.map (and filter for filtering)
 */
function processItems(items: Item[]): string[] {
  return items.map((item) => `${item.label}: ${item.value * 2}`);
}

function sumValues(items: Item[]): number {
  return items.map((item) => item.value).reduce((a, b) => a + b, 0);
}

function filterItems(items: Item[], threshold: number): Item[] {
  return items.filter((item) => item.value > threshold);
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
