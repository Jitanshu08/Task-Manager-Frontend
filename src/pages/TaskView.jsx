import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../css/TaskView.css";
import logo from "../assets/codesandbox.png";

const TaskView = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);

  // Calculate checklist progress
  const calculateChecklistProgress = (checklist) => {
    if (!checklist.length) return "0/0";
    const completedItems = checklist.filter((item) => item.completed).length;
    return `${completedItems}/${checklist.length}`;
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await API.get(`/api/tasks/${taskId}`);
        setTask(response.data);
        setChecklist(response.data.checklist);
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Handle checkbox interaction
  const handleCheckboxChange = (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setChecklist(updatedChecklist);
  };

  // Format the due date correctly
  const formatDueDate = (date) => {
    const formattedDate = new Date(date).toLocaleString("en-US", {
      month: "short",
    });
    const day = new Date(date).getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return `${formattedDate} ${day}${suffix}`;
  };

  if (loading) {
    return <div className="task-view-loading">Loading...</div>;
  }

  if (!task) {
    return <div className="task-view-error">Task not found.</div>;
  }

  // Render the task details
  return (
    <div className="task-view-container">
      <div className="task-view-header">
        <img src={logo} alt="Pro Manage Icon" className="task-view-icon" />
        <h1 className="task-view-title">Pro Manage</h1>
      </div>
      <div className="task-view-card">
        <div className="task-view-priority">
          <span className={`priority-bullet ${task.priority}`}></span>
          <span className="task-view-priority-text">
            {task.priority.toUpperCase()}
          </span>
        </div>
        <div className="task-view-header-content">
          <h2 className="task-view-task-title">{task.title}</h2>
        </div>
        <div className="task-view-content">
          {task.assignee && (
            <div className="task-view-assignee">
              Assigned to: {task.assignee.email}
            </div>
          )}
          <div className="task-view-checklist">
            <h4>Checklist ({calculateChecklistProgress(checklist)})</h4>
            <ul>
              {checklist.map((item, index) => (
                <li key={index} className="task-view-checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleCheckboxChange(index)}
                    className="task-view-checkbox"
                  />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
          {task.dueDate && (
            <div className="task-view-due-date-container">
              <span>Due Date: </span>
              <span className="task-view-due-date">
                {formatDueDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
