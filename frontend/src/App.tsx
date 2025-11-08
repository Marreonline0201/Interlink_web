import { Link, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulePage from "./pages/SchedulePage";
import SurveyPage from "./pages/SurveyPage";
import { useAuth } from "./context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-sky-950 sm:text-5xl">
        Interlink
      </h1>
      <p className="max-w-xl text-balance text-lg text-sky-800">
        Welcome! Choose an option below to explore the notebook-inspired auth
        flows while the real backend is on deck.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {isAuthenticated ? (
          <Link
            to="/profile"
            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            View Profile
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center rounded-full border border-sky-400/60 bg-white/80 px-6 py-3 text-base font-semibold text-sky-600 shadow-lg shadow-white/60 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-100 via-white to-sky-200 text-slate-900">
      <header className="border-b border-sky-100 bg-white/80 shadow-sm shadow-sky-200/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold text-sky-800">
            Interlink
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-sky-700">
            <Link
              to="/"
              className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
                >
                  Profile
                </Link>
                <Link
                  to="/schedule"
                  className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
                >
                  Schedule
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full px-3 py-1 transition hover:bg-sky-100 hover:text-sky-900"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
