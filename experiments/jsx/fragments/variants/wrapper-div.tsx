import type { FC } from "react";

interface Props {
  items: string[];
  title: string;
}

/**
 * Wrapper div elements instead of fragments
 */
export const ExperimentComponent: FC<Props> = ({ items, title }) => {
  return (
    <div>
      <h1>{title}</h1>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div>
        <p>Total items: {items.length}</p>
        <p>First item: {items[0]}</p>
      </div>
    </div>
  );
};

export function benchmark(): string {
  return "wrapper-div";
}

export default ExperimentComponent;
