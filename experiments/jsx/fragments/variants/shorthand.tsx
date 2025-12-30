import type { FC } from "react";

interface Props {
  items: string[];
  title: string;
}

/**
 * Short fragment syntax: <></>
 */
export const ExperimentComponent: FC<Props> = ({ items, title }) => {
  return (
    <>
      <h1>{title}</h1>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <>
        <p>Total items: {items.length}</p>
        <p>First item: {items[0]}</p>
      </>
    </>
  );
};

export function benchmark(): string {
  return "fragment-shorthand";
}

export default ExperimentComponent;
