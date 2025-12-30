import type { FC } from "react";

/**
 * const object with 'as const' assertion.
 * Creates a plain JavaScript object - no reverse mappings.
 * Values are inferred as literal types.
 */
const Status = {
  Pending: "pending",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;
type Status = (typeof Status)[keyof typeof Status];

const Priority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
} as const;
type Priority = (typeof Priority)[keyof typeof Priority];

interface Task {
  id: number;
  status: Status;
  priority: Priority;
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.Pending:
      return "Waiting";
    case Status.Active:
      return "In Progress";
    case Status.Completed:
      return "Done";
    case Status.Cancelled:
      return "Cancelled";
    case Status.Archived:
      return "Archived";
  }
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.Low:
      return "gray";
    case Priority.Medium:
      return "blue";
    case Priority.High:
      return "orange";
    case Priority.Critical:
      return "red";
  }
}

function processTask(task: Task): string {
  return `${getStatusLabel(task.status)} (${getPriorityColor(task.priority)})`;
}

interface Props {
  tasks: Task[];
}

export const ExperimentComponent: FC<Props> = ({ tasks }) => {
  const results = tasks.map((t) => processTask(t));
  return <div>{results.join(", ")}</div>;
};

export function benchmark(): string {
  const tasks: Task[] = [
    { id: 1, status: Status.Pending, priority: Priority.High },
    { id: 2, status: Status.Active, priority: Priority.Medium },
    { id: 3, status: Status.Completed, priority: Priority.Low },
  ];
  return tasks.map((t) => processTask(t)).join(", ");
}

export default ExperimentComponent;
