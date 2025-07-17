"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"

const Dashboard = () => {
  const [task, setTask] = useState("")
  const [description, setDescription] = useState("")
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editText, setEditText] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [filter, setFilter] = useState("all")
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)

  const { user, logout, apiCall, loading: authLoading } = useContext(AuthContext)

  useEffect(() => {
    console.log("Dashboard: useEffect triggered. User:", user ? user.uid : "null", "AuthLoading:", authLoading)
    if (user && !authLoading) {
      fetchTasks()
    }
  }, [user, authLoading])

  const fetchTasks = async () => {
    console.log("Dashboard: fetchTasks initiated.")
    setDashboardLoading(true)
    setDashboardError(null)
    try {
      const response = await apiCall("/tasks/")
      console.log("Dashboard: Tasks fetched successfully:", response.tasks)
      setTasks(response.tasks || [])
    } catch (error) {
      setDashboardError("Failed to fetch tasks. Please try again.")
      console.error("Dashboard: Failed to fetch tasks:", error)
    } finally {
      setDashboardLoading(false)
      console.log("Dashboard: fetchTasks finished.")
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!task.trim()) {
      setDashboardError("Task title cannot be empty.")
      return
    }

    setDashboardLoading(true)
    setDashboardError(null)
    console.log("Dashboard: handleAddTask initiated.")
    try {
      await apiCall("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: task,
          description: description,
          completed: false,
        }),
      })
      console.log("Dashboard: Task added successfully.")

      await fetchTasks()
      setTask("")
      setDescription("")
    } catch (error) {
      setDashboardError("Failed to add task. Please try again.")
      console.error("Dashboard: Failed to add task:", error)
    } finally {
      setDashboardLoading(false)
      console.log("Dashboard: handleAddTask finished.")
    }
  }

  const handleDeleteTask = async (taskId) => {
    setDashboardLoading(true)
    setDashboardError(null)
    console.log("Dashboard: handleDeleteTask initiated for ID:", taskId)
    try {
      await apiCall(`/tasks/${taskId}`, {
        method: "DELETE",
      })
      console.log("Dashboard: Task deleted successfully.")

      await fetchTasks()
    } catch (error) {
      setDashboardError("Failed to delete task. Please try again.")
      console.error("Dashboard: Failed to delete task:", error)
    } finally {
      setDashboardLoading(false)
      console.log("Dashboard: handleDeleteTask finished.")
    }
  }

  const handleToggleComplete = async (taskId) => {
    setDashboardLoading(true)
    setDashboardError(null)
    console.log("Dashboard: handleToggleComplete initiated for ID:", taskId)
    try {
      await apiCall(`/tasks/${taskId}`, {
        method: "PATCH",
      })
      console.log("Dashboard: Task completion toggled successfully.")

      await fetchTasks()
    } catch (error) {
      console.error("Dashboard: Failed to toggle task, error details:", error)
      setDashboardError(`Failed to update task status: ${error.message || "Unknown error"}. Please try again.`)
    } finally {
      setDashboardLoading(false)
      console.log("Dashboard: handleToggleComplete finished.")
    }
  }

  const handleEditTask = (task) => {
    setEditingTaskId(task.id)
    setEditText(task.title || task.text)
    setEditDescription(task.description || "")
    console.log("Dashboard: Editing task ID:", task.id)
  }

  const handleSaveEdit = async (taskId) => {
    if (!editText.trim()) {
      setDashboardError("Task title cannot be empty.")
      return
    }

    setDashboardLoading(true)
    setDashboardError(null)
    console.log("Dashboard: handleSaveEdit initiated for ID:", taskId)
    try {
      await apiCall(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editText,
          description: editDescription,
        }),
      })
      console.log("Dashboard: Task updated successfully.")

      await fetchTasks()
      setEditingTaskId(null)
      setEditText("")
      setEditDescription("")
    } catch (error) {
      setDashboardError("Failed to update task. Please try again.")
      console.error("Dashboard: Failed to update task:", error)
    } finally {
      setDashboardLoading(false)
      console.log("Dashboard: handleSaveEdit finished.")
    }
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditText("")
    setEditDescription("")
    console.log("Dashboard: Edit cancelled.")
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  if (!user || authLoading || dashboardLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header">
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <button onClick={logout} className="btn secondary-btn">
          Logout
        </button>
      </div>

      {dashboardError && <div className="error-message">{dashboardError}</div>}

      <div className="task-card">
        <h3>Add New Task</h3>
        <p className="description">Create a new task to add to your list</p>
        <form onSubmit={handleAddTask}>
          <div className="form-group">
            <label htmlFor="title" className="sr-only">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter task title"
              required
              disabled={dashboardLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="sr-only">
              Task Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              disabled={dashboardLoading}
            />
          </div>

          <button type="submit" className="btn primary-btn" disabled={dashboardLoading}>
            {dashboardLoading ? "Adding Task..." : "Add Task"}
          </button>
        </form>
      </div>

      <div className="filter-buttons">
        <button className={`btn filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({tasks.length})
        </button>
        <button className={`btn filter-btn ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
          Active ({tasks.filter((t) => !t.completed).length})
        </button>
        <button
          className={`btn filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({tasks.filter((t) => t.completed).length})
        </button>
      </div>

      <div className="task-card">
        <h3>Your Tasks</h3>
        <p className="description">Manage your tasks</p>
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <p className="task-list-empty">
              No tasks {filter === "all" ? "yet" : `in ${filter} category`}. Add one above!
            </p>
          ) : (
            <ul>
              {filteredTasks.map((task) => (
                <li key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  {editingTaskId === task.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        disabled={dashboardLoading}
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        disabled={dashboardLoading}
                      />
                      <div className="task-actions">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="btn primary-btn small-btn"
                          disabled={dashboardLoading}
                        >
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="btn secondary-btn small-btn">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="task-content">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task.id)}
                          disabled={dashboardLoading}
                        />
                        <div className="task-text">
                          <span className="task-title">{task.title || task.text}</span>
                          {task.description && <span className="task-description">{task.description}</span>}
                        </div>
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="btn edit-btn small-btn"
                          disabled={dashboardLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn delete-btn small-btn"
                          disabled={dashboardLoading}
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
      </div>
    </div>
  )
}

export default Dashboard