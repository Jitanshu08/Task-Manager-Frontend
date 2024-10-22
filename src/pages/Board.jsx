import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../css/Board.css";

const Board = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get("/api/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const tasksByStatus = {
    backlog: tasks.filter((task) => task.status === "backlog"),
    todo: tasks.filter((task) => task.status === "to-do"),
    inProgress: tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  // Function to update task status
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
          setTasks={setTasks}
        />
        <Column
          title="To-Do"
          tasks={tasksByStatus.todo}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
          showCreateTaskButton
        />
        <Column
          title="In-Progress"
          tasks={tasksByStatus.inProgress}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
        />
        <Column
          title="Done"
          tasks={tasksByStatus.done}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
        />
      </div>
    </div>
  );
};

const Column = ({ title, tasks, updateTaskStatus, setTasks, showCreateTaskButton }) => {
  return (
    <div className="board-column">
      <div className="column-header">
        <h2>{title}</h2>
        {showCreateTaskButton && <button className="create-task-btn">+</button>}
      </div>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
        />
      ))}
    </div>
  );
};

const TaskCard = ({ task, updateTaskStatus, setTasks }) => {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Calculate the checklist progress
  const checklistProgress = `${
    task.checklist.filter((item) => item.completed).length
  }/${task.checklist.length}`;

  // Function to handle checklist item toggle
  const toggleChecklistItem = async (taskId, index) => {
    try {
      const updatedChecklist = task.checklist.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      );
      await API.put(`/api/tasks/${taskId}`, { checklist: updatedChecklist });
      setTasks((tasks) =>
        tasks.map((t) => (t._id === taskId ? { ...t, checklist: updatedChecklist } : t))
      );
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/api/tasks/${task._id}`);
      setTasks((tasks) => tasks.filter((t) => t._id !== task._id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/task/${task._id}`);
    alert("Task link copied to clipboard!");
  };

  // Get status change buttons based on current status
  const getStatusButtons = () => {
    switch (task.status) {
      case "backlog":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>To-Do</button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>In-Progress</button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>Done</button>
          </>
        );
      case "in-progress":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>Backlog</button>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>To-Do</button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>Done</button>
          </>
        );
      case "to-do":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>Backlog</button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>In-Progress</button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>Done</button>
          </>
        );
      case "done":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>Backlog</button>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>To-Do</button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>In-Progress</button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <span className={`priority ${task.priority}`}>{task.priority}</span>
        <div className="task-options">
          <button onClick={() => setShowOptions(!showOptions)}>...</button>
          {showOptions && (
            <div className="dropdown-menu">
              <button>Edit</button>
              <button onClick={handleShare}>Share</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <h3>{task.title}</h3>

      <div className="checklist-container">
        <div className="checklist-header">
          <span>Checklist ({checklistProgress})</span>
          <button onClick={() => setIsChecklistOpen(!isChecklistOpen)}>
            {isChecklistOpen ? "▲" : "▼"}
          </button>
        </div>

        {isChecklistOpen && (
          <ul className="checklist">
            {task.checklist.map((item, index) => (
              <li key={index}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(task._id, index)}
                />
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p>{new Date(task.dueDate).toLocaleString("en-US", { month: "short", day: "numeric" })}</p>

      <div className="task-actions">
        {getStatusButtons()} {/* Dynamic status change buttons */}
      </div>
    </div>
  );
};

export default Board;
