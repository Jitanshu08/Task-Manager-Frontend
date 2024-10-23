import React, { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import collapseIcon from "../assets/collapse1.png";
import peopleIcon from "../assets/people.png";
import "../css/Board.css";

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [isAddPeoplePopupOpen, setAddPeoplePopupOpen] = useState(false);
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [emailAdded, setEmailAdded] = useState(false);
  const [filter, setFilter] = useState("Today");
  const [userName, setUserName] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get("/api/tasks");
        setTasks(
          response.data.map((task) => ({
            ...task,
            isChecklistOpen: false,
          }))
        );
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Function to filter tasks based on due dates and show tasks without due dates
  const filterTasksByDate = (tasks, filter) => {
    const today = new Date();
    let filteredTasks = [];

    switch (filter) {
      case "Today":
        filteredTasks = tasks.filter((task) => {
          if (!task.dueDate) return true;
          const taskDate = new Date(task.dueDate);
          return (
            taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate()
          );
        });
        break;

      case "This Week":
        const startOfWeek = today.getDate() - today.getDay() + 1;
        const endOfWeek = startOfWeek + 6;
        filteredTasks = tasks.filter((task) => {
          if (!task.dueDate) return true;
          const taskDate = new Date(task.dueDate);
          return (
            taskDate >= new Date(today.setDate(startOfWeek)) &&
            taskDate <= new Date(today.setDate(endOfWeek))
          );
        });
        break;

      case "This Month":
        filteredTasks = tasks.filter((task) => {
          if (!task.dueDate) return true;
          const taskDate = new Date(task.dueDate);
          return (
            taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth()
          );
        });
        break;

      default:
        filteredTasks = tasks;
    }

    return filteredTasks;
  };

  const tasksByStatus = {
    backlog: filterTasksByDate(
      tasks.filter((task) => task.status === "backlog"),
      filter
    ),
    todo: filterTasksByDate(
      tasks.filter((task) => task.status === "to-do"),
      filter
    ),
    inProgress: filterTasksByDate(
      tasks.filter((task) => task.status === "in-progress"),
      filter
    ),
    done: filterTasksByDate(
      tasks.filter((task) => task.status === "done"),
      filter
    ),
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

  // Function to collapse all expanded tasks in a column
  const collapseAllTasks = (columnTasks) => {
    setTasks(
      tasks.map((task) =>
        columnTasks.includes(task) ? { ...task, isChecklistOpen: false } : task
      )
    );
  };

  // Handle task assignment to an email
  const handleAddEmail = async () => {
    try {
      await API.post(
        "/api/tasks/assignTasks",
        { email: assigneeEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(`${assigneeEmail} added to board!`);
      setEmailAdded(true);
      setAssigneeEmail("");
    } catch (error) {
      toast.error("Error adding email");
      console.error(error);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setFilterDropdownOpen(false);
  };

  return (
    <div className="board-container">
      {/* Greeting and Date */}
      <div className="board-header">
        <h1>Welcome! {userName}</h1>
        <span>{todayDate}</span>
      </div>

      {/* Board Heading, Add People, and Filter Dropdown */}
      <div className="board-title-row">
        <div className="title-and-actions">
          <h2>Board</h2>
          <div className="board-actions">
            <img
              src={peopleIcon}
              alt="Add People"
              className="add-people-icon"
              onClick={() => {
                setAddPeoplePopupOpen(true);
                setEmailAdded(false);
              }}
            />
            <span>Add People</span>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="filter-dropdown">
          <button
            className="filter-toggle-btn"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
          >
            {filter} ▼
          </button>
          {filterDropdownOpen && (
            <div className="filter-options">
              <button onClick={() => handleFilterChange("Today")}>Today</button>
              <button onClick={() => handleFilterChange("This Week")}>
                This Week
              </button>
              <button onClick={() => handleFilterChange("This Month")}>
                This Month
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        <Column
          title="Backlog"
          tasks={tasksByStatus.backlog}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
          collapseAll={() => collapseAllTasks(tasksByStatus.backlog)}
        />
        <Column
          title="To-Do"
          tasks={tasksByStatus.todo}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
          showCreateTaskButton
          collapseAll={() => collapseAllTasks(tasksByStatus.todo)}
        />
        <Column
          title="In-Progress"
          tasks={tasksByStatus.inProgress}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
          collapseAll={() => collapseAllTasks(tasksByStatus.inProgress)}
        />
        <Column
          title="Done"
          tasks={tasksByStatus.done}
          updateTaskStatus={updateTaskStatus}
          setTasks={setTasks}
          collapseAll={() => collapseAllTasks(tasksByStatus.done)}
        />
      </div>

      {/* Add People Popup */}
      {isAddPeoplePopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Add Assignee</h3>
            {!emailAdded ? (
              <>
                <input
                  type="email"
                  placeholder="Enter assignee email"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                />
                <div className="popup-actions">
                  <button onClick={handleAddEmail}>Add Email</button>
                  <button onClick={() => setAddPeoplePopupOpen(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setAddPeoplePopupOpen(false)}>
                Okay, got it
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Column Component
const Column = ({
  title,
  tasks,
  updateTaskStatus,
  setTasks,
  showCreateTaskButton,
  collapseAll,
}) => {
  return (
    <div className="board-column">
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <div className="column-actions">
          {showCreateTaskButton && (
            <button className="create-task-btn">+</button>
          )}
          <img
            src={collapseIcon}
            alt="Collapse"
            className="collapse-icon"
            onClick={collapseAll}
          />
        </div>
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

// TaskCard Component
const TaskCard = ({ task, updateTaskStatus, setTasks }) => {
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
        tasks.map((t) =>
          t._id === taskId ? { ...t, checklist: updatedChecklist } : t
        )
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
    toast.success("Link Copied", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Get status change buttons based on current status
  const getStatusButtons = () => {
    switch (task.status) {
      case "backlog":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>
              To-Do
            </button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>
              In-Progress
            </button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>
              Done
            </button>
          </>
        );
      case "in-progress":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>
              Backlog
            </button>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>
              To-Do
            </button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>
              Done
            </button>
          </>
        );
      case "to-do":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>
              Backlog
            </button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>
              In-Progress
            </button>
            <button onClick={() => updateTaskStatus(task._id, "done")}>
              Done
            </button>
          </>
        );
      case "done":
        return (
          <>
            <button onClick={() => updateTaskStatus(task._id, "backlog")}>
              Backlog
            </button>
            <button onClick={() => updateTaskStatus(task._id, "to-do")}>
              To-Do
            </button>
            <button onClick={() => updateTaskStatus(task._id, "in-progress")}>
              In-Progress
            </button>
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
          <button
            onClick={() =>
              setTasks((tasks) =>
                tasks.map((t) =>
                  t._id === task._id
                    ? { ...t, isChecklistOpen: !task.isChecklistOpen }
                    : t
                )
              )
            }
          >
            {task.isChecklistOpen ? "▲" : "▼"}
          </button>
        </div>

        {task.isChecklistOpen && (
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

      {/* Display the due date if exists */}
      <p>
        {task.dueDate
          ? new Date(task.dueDate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
            })
          : ""}
      </p>

      <div className="task-actions">
        {getStatusButtons(task, updateTaskStatus)}{" "}
      </div>
    </div>
  );
};

export default Board;
