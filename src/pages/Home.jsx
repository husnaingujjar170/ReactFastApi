import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero-section">
      <h2>Welcome to Task Management Application</h2>
      <p>Organize your tasks efficiently and stay productive!</p>
      <div className="cta-buttons">
        <Link to="/signup" className="btn primary-btn">Get Started</Link>
        <Link to="/signin" className="btn secondary-btn">Sign In</Link>
      </div>
    </div>
  );
};

export default Home;