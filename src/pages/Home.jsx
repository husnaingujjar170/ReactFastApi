import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="hero-section">
      <h2>Organize Your Life, One Task at a Time.</h2>
      <p>
        Our intuitive task management application helps you stay on top of your goals, boost productivity, and achieve
        peace of mind.
      </p>
      <div className="cta-buttons">
        <Link to="/signup" className="btn primary-btn">
          Get Started
        </Link>
        <Link to="/signin" className="btn secondary-btn">
          Sign In
        </Link>
      </div>
    </div>
  )
}
