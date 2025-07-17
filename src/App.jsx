import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { AuthProvider, AuthContext } from "./context/AuthContext"
import Home from "./pages/Home"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import "./styles/App.css" 
import { useContext, useState } from "react" 
import { Menu, X } from "lucide-react" 

function Navbar() {
  const { user, logout, loading } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) 

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/signin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (loading) {
    return (
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Task Management Application</h1>
          <div className="nav-links">Loading...</div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={user ? "/dashboard" : "/"} className="logo">
          Task Management Application
        </Link>

        {}
        <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <span className="user-info">Welcome, {user.displayName || user.email}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/signup" className="btn signup-btn" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <footer className="app-footer">
          <p>© 2025 Task Management Application. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default App