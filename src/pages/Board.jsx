import React, { useState, useEffect } from "react";
import API from "../services/api"; // Axios instance to fetch tasks
import "../css/Board.css";

const Board = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get("/api/tasks"); // Fetch tasks from backend
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Separate tasks by their status
  const tasksByStatus = {
    backlog: tasks.filter((task) => task.status === "backlog"),
    todo: tasks.filter((task) => task.status === "to-do"),
    inProgress: tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <div className="board-container">
      <h1>Task Board</h1>
      <div className="kanban-board">
        <Column
          title="Backlog"
          tasks={tasksByStatus.backlog}
          updateTaskStatus={updateTaskStatus}
        />
        <Column
          title="To-Do"
          tasks={tasksByStatus.todo}
          updateTaskStatus={updateTaskStatus}
        />
        <Column
          title="In-Progress"
          tasks={tasksByStatus.inProgress}
          updateTaskStatus={updateTaskStatus}
        />
        <Column
          title="Done"
          tasks={tasksByStatus.done}
          updateTaskStatus={updateTaskStatus}
        />
      </div>
    </div>
  );
};

const Column = ({ title, tasks, updateTaskStatus }) => {
  return (
    <div className="column">
      <h2>{title}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          updateTaskStatus={updateTaskStatus}
        />
      ))}
    </div>
  );
};

const TaskCard = ({ task, updateTaskStatus }) => {
  // Function to determine which buttons to show based on task status
  const getStatusButtons = (status) => {
    switch (status) {
      case "backlog":
        return ["To-Do", "In-Progress", "Done"];
      case "to-do":
        return ["Backlog", "In-Progress", "Done"];
      case "in-progress":
        return ["Backlog", "To-Do", "Done"];
      case "done":
        return ["Backlog", "To-Do", "In-Progress"];
      default:
        return [];
    }
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>Priority: {task.priority}</p>
      <p>Status: {task.status}</p>
      <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>{" "}
      {/* Display due date */}
      {/* Render status change buttons */}
      {getStatusButtons(task.status).map((status) => (
        <button
          key={status}
          onClick={() => updateTaskStatus(task._id, status.toLowerCase())}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default Board;
