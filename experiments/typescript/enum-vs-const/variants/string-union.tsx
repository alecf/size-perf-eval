import type { FC } from "react";

/**
 * String union type.
 * Type-only - completely erased at runtime.
 * Uses literal strings directly in code.
 */
type Status = "pending" | "active" | "completed" | "cancelled" | "archived";
type Priority = 1 | 2 | 3 | 4;

interface Task {
  id: number;
  status: Status;
  priority: Priority;
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case "pending":
      return "Waiting";
    case "active":
      return "In Progress";
    case "completed":
      return "Done";
    case "cancelled":
      return "Cancelled";
    case "archived":
      return "Archived";
  }
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 1:
      return "gray";
    case 2:
      return "blue";
    case 3:
      return "orange";
    case 4:
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
    { id: 1, status: "pending", priority: 3 },
    { id: 2, status: "active", priority: 2 },
    { id: 3, status: "completed", priority: 1 },
  ];
  return tasks.map((t) => processTask(t)).join(", ");
}

export default ExperimentComponent;
