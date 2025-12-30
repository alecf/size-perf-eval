import { Fragment, type FC } from "react";

interface Props {
  items: string[];
  title: string;
}

/**
 * Explicit Fragment import and usage
 */
export const ExperimentComponent: FC<Props> = ({ items, title }) => {
  return (
    <Fragment>
      <h1>{title}</h1>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <Fragment>
        <p>Total items: {items.length}</p>
        <p>First item: {items[0]}</p>
      </Fragment>
    </Fragment>
  );
};

export function benchmark(): string {
  return "fragment-explicit";
}

export default ExperimentComponent;
