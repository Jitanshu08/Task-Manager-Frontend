import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import API from "../services/api"; // Import API service
import "../css/CreateTaskPopup.css";

const CreateTaskPopup = ({ isOpen, onClose, onSave, loggedInUserEmail }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState(""); // Store assignee ID instead of email
  const [checklist, setChecklist] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [availableAssignees, setAvailableAssignees] = useState([]); // State for fetched assignees

  // Calculate the number of completed checklist items
  const completedCount = checklist.filter((item) => item.completed).length;

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
    fetchAssignees();
  }, [loggedInUserEmail]);

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
  const handleSave = async () => {
    if (!title || !priority || checklist.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const taskData = {
      title,
      priority,
      assignee: assigneeId || null, // Use assigneeId instead of email
      checklist,
      dueDate,
    };

    try {
      // Use API service to send the task data to backend
      const response = await API.post("/api/tasks", taskData);

      if (response.status === 201) {
        toast.success("Task created successfully!");
        onSave(taskData); // Call the parent onSave function if needed
        onClose(); // Close the popup after saving
      } else {
        toast.error("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An error occurred while creating the task.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-task-popup-overlay">
      <div className="create-task-popup-content">
        <form className="create-task-popup-form">
          {/* Task Title */}
          <div className="create-task-form-group">
            <label>
              Title <span className="create-task-required">*</span>
            </label>
            <input
              type="text"
              className="create-task-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Task Title"
              required
            />
          </div>

          {/* Task Priority */}
          <div className="create-task-form-group create-task-priority-group">
            <label>
              Priority <span className="create-task-required">*</span>
            </label>
            <div className="create-task-priority-options">
              <button
                type="button"
                className={`create-task-priority-option ${
                  priority === "high" ? "active" : ""
                }`}
                onClick={() => setPriority("high")}
              >
                <span className="priority-bullet high"></span> HIGH PRIORITY
              </button>
              <button
                type="button"
                className={`create-task-priority-option ${
                  priority === "medium" ? "active" : ""
                }`}
                onClick={() => setPriority("medium")}
              >
                <span className="priority-bullet medium"></span> MODERATE
                PRIORITY
              </button>
              <button
                type="button"
                className={`create-task-priority-option ${
                  priority === "low" ? "active" : ""
                }`}
                onClick={() => setPriority("low")}
              >
                <span className="priority-bullet low"></span> LOW PRIORITY
              </button>
            </div>
          </div>

          {/* Assignee */}
          <div className="create-task-form-group">
            <label>Assign To</label>
            <select
              className="create-task-dropdown"
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
          <div className="create-task-form-group">
            <label>
              Checklist ({completedCount}/{checklist.length}){" "}
              <span className="create-task-required">*</span>
            </label>
            <ul className="create-task-checklist">
              {checklist.map((item, index) => (
                <li key={index} className="create-task-checklist-item">
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
                    className="create-task-delete-item-btn"
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
              className="create-task-add-item-btn"
              onClick={addChecklistItem}
            >
              + Add a New
            </button>
          </div>

          {/* Save, Cancel, and Due Date Buttons */}
          <div className="create-task-form-actions">
            <div className="create-task-date-picker">
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select Due Date"
              />
            </div>
            <div className="create-task-action-buttons">
              <button
                type="button"
                className="create-task-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="create-task-save-btn"
                onClick={handleSave}
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

export default CreateTaskPopup;
