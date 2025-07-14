import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.username) {
      const storedTasks = JSON.parse(localStorage.getItem(`tasks_${user.username}`) || '[]');
      setTasks(storedTasks);
    }
  }, [user]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (task.trim()) {
      const newTask = { id: Date.now(), text: task, completed: false, dueDate };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem(`tasks_${user.username}`, JSON.stringify(updatedTasks));
      setTask('');
      setDueDate('');
    }
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${user.username}`, JSON.stringify(updatedTasks));
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditDueDate(task.dueDate || '');
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, text: editText, dueDate: editDueDate } : task
      );
      setTasks(updatedTasks);
      localStorage.setItem(`tasks_${user.username}`, JSON.stringify(updatedTasks));
    }
    setEditingTaskId(null);
    setEditText('');
    setEditDueDate('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
    setEditDueDate('');
  };

  const handleToggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${user.username}`, JSON.stringify(updatedTasks));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const taskDate = new Date(dueDate);
    return taskDate < today && !task.completed;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header">
        <h2>Welcome, {user.username}!</h2>
        <button onClick={logout} className="btn secondary-btn">Logout</button>
      </div>
      <form onSubmit={handleAddTask} className="task-form">
        <div className="form-group">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a new task"
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due date"
          />
          <button type="submit" className="btn primary-btn">Add Task</button>
        </div>
      </form>
      <div className="filter-buttons">
        <button
          className={['btn', 'filter-btn', filter === 'all' ? 'active' : ''].join(' ')}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={['btn', 'filter-btn', filter === 'active' ? 'active' : ''].join(' ')}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={['btn', 'filter-btn', filter === 'completed' ? 'active' : ''].join(' ')}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p>No tasks {filter === 'all' ? 'yet' : `in ${filter} category`}. Add one above!</p>
        ) : (
          <ul>
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={['task-item', task.completed ? 'completed' : '', isOverdue(task.dueDate) ? 'overdue' : ''].join(' ')}
              >
                {editingTaskId === task.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                    />
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="btn primary-btn small-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn secondary-btn small-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task.id)}
                      />
                      <span>{task.text}</span>
                      {task.dueDate && (
                        <span className="due-date">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="btn edit-btn small-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn delete-btn small-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="dashboard-footer">
        <p>© 2025 Task Management Application. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;