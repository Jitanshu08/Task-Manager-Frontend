import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import API from "../services/api";
import "../css/EditTaskPopup.css"; 

const EditTaskPopup = ({
  isOpen,
  task,
  onClose,
  saveEdit,
  loggedInUserEmail,
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState(""); // Store assignee ID
  const [checklist, setChecklist] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [availableAssignees, setAvailableAssignees] = useState([]); // State for fetched assignees

  // Initialize state when a task is set
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setPriority(task.priority || "");
      setAssigneeId(task.assignee ? task.assignee._id : "");
      setChecklist(task.checklist || []);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]); // Update when the task changes

  // Fetch available assignees (excluding logged-in user)
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const response = await API.get("/api/users/all");
        const filteredAssignees = response.data.filter(
          (user) => user.email !== loggedInUserEmail
        );
        setAvailableAssignees(filteredAssignees);
      } catch (error) {
        console.error("Error fetching assignees:", error);
      }
    };

    if (task) {
      fetchAssignees();
    }
  }, [task, loggedInUserEmail]);

  // Add a new checklist item
  const addChecklistItem = () => {
    setChecklist([...checklist, { name: "", completed: false }]);
  };

  // Remove a checklist item
  const removeChecklistItem = (index) => {
    const updatedChecklist = checklist.filter((_, i) => i !== index);
    setChecklist(updatedChecklist);
  };

  // Handle checklist item name change
  const handleChecklistNameChange = (index, value) => {
    const updatedChecklist = checklist.map((item, i) =>
      i === index ? { ...item, name: value } : item
    );
    setChecklist(updatedChecklist);
  };

  // Toggle checklist item completion
  const toggleChecklistCompletion = (index) => {
    const updatedChecklist = checklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!title || !priority || checklist.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const taskData = {
      ...task, 
      title,
      priority,
      assignee: assigneeId || null, // Use assigneeId instead of email
      checklist,
      dueDate,
    };

    try {
      
      saveEdit(taskData);
      onClose(); // Close the popup after updating
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-task-popup-overlay">
      <div className="edit-task-popup-content">
        <form className="edit-task-popup-form">
          {/* Task Title */}
          <div className="edit-task-form-group">
            <label>
              Title <span className="edit-task-required">*</span>
            </label>
            <input
              type="text"
              className="edit-task-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Task Title"
              required
            />
          </div>

          {/* Task Priority */}
          <div className="edit-task-form-group edit-task-priority-group">
            <label>
              Priority <span className="edit-task-required">*</span>
            </label>
            <div className="edit-task-priority-options">
              <button
                type="button"
                className={`edit-task-priority-option ${
                  priority === "high" ? "active" : ""
                }`}
                onClick={() => setPriority("high")}
              >
                <span className="priority-bullet high"></span> HIGH PRIORITY
              </button>
              <button
                type="button"
                className={`edit-task-priority-option ${
                  priority === "medium" ? "active" : ""
                }`}
                onClick={() => setPriority("medium")}
              >
                <span className="priority-bullet medium"></span> MODERATE
                PRIORITY
              </button>
              <button
                type="button"
                className={`edit-task-priority-option ${
                  priority === "low" ? "active" : ""
                }`}
                onClick={() => setPriority("low")}
              >
                <span className="priority-bullet low"></span> LOW PRIORITY
              </button>
            </div>
          </div>

          {/* Assignee */}
          <div className="edit-task-form-group">
            <label>Assign To</label>
            <select
              className="edit-task-dropdown"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="" disabled>
                Add an assignee
              </option>
              {availableAssignees.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Checklist */}
          <div className="edit-task-form-group">
            <label>
              Checklist ({checklist.filter((item) => item.completed).length}/
              {checklist.length}) <span className="edit-task-required">*</span>
            </label>
            <ul className="edit-task-checklist">
              {checklist.map((item, index) => (
                <li key={index} className="edit-task-checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistCompletion(index)}
                  />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleChecklistNameChange(index, e.target.value)
                    }
                    placeholder="Checklist item"
                    required
                  />
                  <button
                    type="button"
                    className="edit-task-delete-item-btn"
                    onClick={() => removeChecklistItem(index)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ color: "#cf3636" }}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="edit-task-add-item-btn"
              onClick={addChecklistItem}
            >
              + Add a New
            </button>
          </div>

          {/* Save, Cancel, and Due Date Buttons */}
          <div className="edit-task-form-actions">
            <div className="edit-task-date-picker">
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select Due Date"
              />
            </div>
            <div className="edit-task-action-buttons">
              <button
                type="button"
                className="edit-task-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="edit-task-save-btn"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskPopup;
