import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import "./Home.css";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom"; // logo image (same one used in Dashboard)

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      const token = auth.user.access_token;
      localStorage.setItem("accessToken", token);
      console.log("auth.user.access_token:", token);

      // ✅ auto fetch from backend here
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleAuthClick = async () => {
    if (auth.isAuthenticated) {
      // 1. Clear local session so the UI immediately reflects "logged out"
      await auth.removeUser();

      // 2. Tell Cognito to clear its Hosted UI session cookie
      window.location.href =
        "https://us-east-296wclzcby.auth.us-east-2.amazoncognito.com/logout" +
        "?client_id=7ikmvo0k2glff8dkqn8chgg3mg" +
        "&logout_uri=http://localhost:5174/";
    } else {
      // Not logged in? Send them to sign in / sign up
      auth.signinRedirect();
    }
  };

  // Main "Get Started" button logic
  const handleGetStarted = () => {
    if (auth.isAuthenticated) {
      navigate("/prompt");  // 👈 redirect to prompt
    } else {
      auth.signinRedirect();
    }
  };

  return (
    <main className="home-wrapper">
      {/* HEADER (Dashboard-style) */}
      <div className="horizontal-bar">
        <link
          href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <h1 className="atticus-title">
          Atticus
          <img src={logo} className="logo" alt="Atticus logo" />
        </h1>
        <h2>Your personalized legal assistant</h2>
        <h3>Est. 2025</h3>
        {auth.isAuthenticated && (
          <button className="auth-button" onClick={handleAuthClick}>
            Log Out
          </button>
        )}
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <h1 className="hero-title">For The People, but organized.</h1>

        <p className="hero-sub">
          Atticus helps you transform chaos into clarity. All it takes is a click of a button to harness the processing power of a legally-informed, dynamic AI model at your fingertips.
        </p>

        <button className="cta-button" onClick={handleGetStarted}>
          {auth.isAuthenticated ? "Continue" : "Get started"}
        </button>

        {auth.isAuthenticated && (
          <p className="hero-note">You’re already signed in.</p>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works">
        <h2 className="section-heading">What Atticus does for you</h2>

        <div className="how-grid">
          <div className="how-card">
            <h3 className="how-title">Structured next steps</h3>
            <p className="how-text">
               Atticus doesn’t just organize your information; it understands it, so you can move from reaction to resolution faster than ever.
            </p>
          </div>

          <div className="how-card">
            <h3 className="how-title">Intake without friction</h3>
            <p className="how-text">
              We take raw inputs — messy emails, call notes, texts, or scattered client updates — and turn them into structured case intelligence. Atticus identifies deadlines, missing records, and next steps, linking every detail to the right matter or specialist automatically.
            </p>
          </div>

          <div className="how-card">
            <h3 className="how-title">Team handoff ready</h3>
            <p className="how-text">
               Instead of digging through threads or spreadsheets, your team gets instant, actionable summaries — ready for scheduling, drafting, or follow-up. 
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER DISCLAIMER */}
      <footer className="footer">
        <p>Internal prototype. Not legal advice.</p>
      </footer>
    </main>
  );
}
