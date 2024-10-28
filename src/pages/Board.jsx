import React, { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import CreateTaskPopup from "../components/CreateTaskPopup";
import EditTaskPopup from "../components/EditTaskPopup";
import collapseIcon from "../assets/collapse1.png";
import peopleIcon from "../assets/people.png";
import "../css/Board.css";

const DeleteConfirmationPopup = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-content">
        <h3 className="delete-confirmation-message">
          Are you sure you want to Delete?
        </h3>
        <div className="delete-confirmation-actions">
          <button className="confirm-delete-btn" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="cancel-delete-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [isAddPeoplePopupOpen, setAddPeoplePopupOpen] = useState(false);
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [emailAdded, setEmailAdded] = useState(false);
  const [addedEmail, setAddedEmail] = useState("");
  const [filter, setFilter] = useState("Today");
  const [userName, setUserName] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setEditTaskOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Save Task Function
  const saveTask = (newTaskData) => {
    const newTask = {
      ...newTaskData,
      status: "to-do",
      isChecklistOpen: false,
    };
    setTasks([...tasks, newTask]);
  };

  // Edit Task Function
  const editTask = async (editedTaskData) => {
    if (!editedTaskData._id) {
      console.error("Task ID is missing in edited data:", editedTaskData);
      toast.error("Unable to update the task. Missing ID.");
      return;
    }

    try {
      await API.put(`/api/tasks/${editedTaskData._id}`, editedTaskData);
      setTasks(
        tasks.map((task) =>
          task._id === editedTaskData._id ? { ...editedTaskData } : task
        )
      );
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Failed to update the task.");
    }
    setEditTaskOpen(false);
    setTaskToEdit(null);
  };

  // Function to open Edit Task Popup
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setEditTaskOpen(true);
  };

  // Function to open the Delete Confirmation Popup
  const openDeletePopup = (task) => {
    setTaskToDelete(task);
    setDeletePopupOpen(true);
  };

  // Unified function to handle task deletion with confirmation
  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await API.delete(`/api/tasks/${taskToDelete._id}`);
      setTasks((tasks) => tasks.filter((t) => t._id !== taskToDelete._id));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete the task.");
    } finally {
      setDeletePopupOpen(false);
      setTaskToDelete(null);
    }
  };

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

      setEmailAdded(true);
      setAddedEmail(assigneeEmail); // Track the added email
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
          <div
            className="board-actions"
            onClick={() => {
              setAddPeoplePopupOpen(true);
              setEmailAdded(false);
            }}
          >
            <img
              src={peopleIcon}
              alt="Add People"
              className="add-people-icon"
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
            {filter}{" "}
            {filterDropdownOpen ? (
              <FontAwesomeIcon
                icon={faChevronUp}
                style={{ color: "#878787" }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faChevronUp}
                rotation={180}
                style={{ color: "#878787" }}
              />
            )}
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
      <div className="kanban-window">
        <div className="kanban-board">
          <Column
            title="Backlog"
            tasks={tasksByStatus.backlog}
            updateTaskStatus={updateTaskStatus}
            setTasks={setTasks}
            collapseAll={() => collapseAllTasks(tasksByStatus.backlog)}
            handleEditTask={handleEditTask}
            openDeletePopup={openDeletePopup}
          />
          <Column
            title="To-Do"
            tasks={tasksByStatus.todo}
            updateTaskStatus={updateTaskStatus}
            setTasks={setTasks}
            showCreateTaskButton
            setCreateTaskOpen={setCreateTaskOpen}
            collapseAll={() => collapseAllTasks(tasksByStatus.todo)}
            handleEditTask={handleEditTask}
            openDeletePopup={openDeletePopup}
          />
          <Column
            title="In-Progress"
            tasks={tasksByStatus.inProgress}
            updateTaskStatus={updateTaskStatus}
            setTasks={setTasks}
            collapseAll={() => collapseAllTasks(tasksByStatus.inProgress)}
            handleEditTask={handleEditTask}
            openDeletePopup={openDeletePopup}
          />
          <Column
            title="Done"
            tasks={tasksByStatus.done}
            updateTaskStatus={updateTaskStatus}
            setTasks={setTasks}
            collapseAll={() => collapseAllTasks(tasksByStatus.done)}
            handleEditTask={handleEditTask}
            openDeletePopup={openDeletePopup}
          />
        </div>
      </div>

      {/* Edit Task Popup */}
      {isEditTaskOpen && (
        <div>
          <EditTaskPopup
            isOpen={isEditTaskOpen}
            task={taskToEdit}
            onClose={() => setEditTaskOpen(false)}
            saveEdit={editTask}
          />
        </div>
      )}

      {isAddPeoplePopupOpen && (
        <div className="popup-overlay">
          <div
            className={`popup-content ${
              emailAdded ? "center-mode" : "add-email-mode"
            }`}
          >
            {!emailAdded ? (
              <>
                <h3 style={{ paddingBottom: "20px" }}>
                  Add people to the board
                </h3>
                <input
                  type="email"
                  placeholder="Enter the email"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                />
                <div className="popup-actions add-email-mode">
                  <button
                    className="cancel-btn"
                    onClick={() => setAddPeoplePopupOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="add-email-btn" onClick={handleAddEmail}>
                    Add Email
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p
                  style={{
                    marginBottom: "20px",
                    fontFamily: '"Noto Sans", sans-serif',
                    fontWeight: "600",
                  }}
                >
                  {addedEmail} added to board!
                </p>
                <button
                  className="okay-got-it-btn"
                  onClick={() => setAddPeoplePopupOpen(false)}
                >
                  Okay, got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Task Popup */}
      <CreateTaskPopup
        isOpen={isCreateTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onSave={saveTask}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        isOpen={isDeletePopupOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeletePopupOpen(false)}
      />
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
  setCreateTaskOpen,
  handleEditTask,
  collapseAll,
  openDeletePopup,
}) => {
  return (
    <div className="board-column">
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <div className="column-actions">
          {showCreateTaskButton && (
            <button
              className="create-task-btn"
              onClick={() => setCreateTaskOpen(true)}
            >
              +
            </button>
          )}
          <button className="collapse-icon" onClick={collapseAll}>
            <img
              src={collapseIcon}
              alt="Collapse"
              className="collapse-icon"
              onClick={collapseAll}
            />
          </button>
        </div>
      </div>
      <div className="task-list-wrapper">
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              updateTaskStatus={updateTaskStatus}
              setTasks={setTasks}
              handleEditTask={handleEditTask}
              openDeletePopup={openDeletePopup}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// TaskCard Component
const TaskCard = ({
  task,
  updateTaskStatus,
  setTasks,
  handleEditTask,
  openDeletePopup,
}) => {
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

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/task/${task._id}`);
    toast.success("Link Copied", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Determine the assignee initials using the email
  const getAssigneeInitials = (assignee) => {
    if (!assignee || !assignee.email) return ""; // Return an empty string if the email is missing
    const email = assignee.email.split("@")[0]; // Extract part before '@'
    return email.slice(0, 2).toUpperCase(); // Get first two characters
  };

  // Format the priority text
  const formatPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "HIGH PRIORITY";
      case "medium":
        return "MODERATE PRIORITY";
      case "low":
        return "LOW PRIORITY";
      default:
        return priority;
    }
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
        <div className="priority-wrapper">
          {/* Display a colored bullet based on priority */}
          <span className={`priority-bullet ${task.priority}`}></span>
          <span className="priority-text">
            {formatPriorityText(task.priority)}
          </span>
          {/* Render the assignee's initials if there's an assignee */}
          {task.assignee && (
            <span className="assignee-circle">
              {getAssigneeInitials(task.assignee)}
            </span>
          )}
        </div>
        <div className="task-options">
          <button onClick={() => setShowOptions(!showOptions)}>...</button>
          {showOptions && (
            <div className="dropdown-menu">
              <button onClick={() => handleEditTask(task)}>Edit</button>
              <button onClick={handleShare}>Share</button>
              <button
                onClick={() => openDeletePopup(task)}
                style={{ color: "red" }}
              >
                Delete
              </button>
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
            {task.isChecklistOpen ? (
              <FontAwesomeIcon
                icon={faChevronUp}
                style={{ color: "#878787", padding: "2px" }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faChevronUp}
                rotation={180}
                style={{ color: "#878787", padding: "2px" }}
              />
            )}
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

      {/* Conditionally render the due date only if it exists */}
      {task.dueDate && (
        <p className="task-due-date">
          {new Date(task.dueDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

      <div className="task-actions">
        {getStatusButtons(task, updateTaskStatus)}{" "}
      </div>
    </div>
  );
};

export default Board;
