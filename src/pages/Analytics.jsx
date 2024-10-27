import React, { useState, useEffect } from 'react';
import API from '../services/api';  
import '../css/Analytics.css';  

const Analytics = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get('/api/tasks');  
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Calculate task statistics
  const backlogCount = tasks.filter(task => task.status === 'backlog').length;
  const todoCount = tasks.filter(task => task.status === 'to-do').length;
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedCount = tasks.filter(task => task.status === 'done').length;

  const lowPriorityCount = tasks.filter(task => task.priority === 'low').length;
  const moderatePriorityCount = tasks.filter(task => task.priority === 'medium').length;
  const highPriorityCount = tasks.filter(task => task.priority === 'high').length;

  const today = new Date().setHours(0, 0, 0, 0);  // Start of today
  const dueTodayCount = tasks.filter(task => new Date(task.dueDate).setHours(0, 0, 0, 0) === today).length;

  return (
    <div className="analytics-container">
      <h1>Analytics</h1> {/* Updated Title */}
      <div className="analytics-columns">

        <div className="analytics-box">
          <ul>
            <li>Backlog Tasks <span>{backlogCount}</span></li>
            <li>To-Do Tasks <span>{todoCount}</span></li>
            <li>In-Progress Tasks <span>{inProgressCount}</span></li>
            <li>Completed Tasks <span>{completedCount}</span></li>
          </ul>
        </div>

        <div className="analytics-box">
          <ul>
            <li>Low Priority <span>{lowPriorityCount}</span></li>
            <li>Moderate Priority <span>{moderatePriorityCount}</span></li>
            <li>High Priority <span>{highPriorityCount}</span></li>
            <li>Due Today <span>{dueTodayCount}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
