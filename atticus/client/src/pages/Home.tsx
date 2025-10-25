import { useAuth } from "react-oidc-context";
import "./Home.css";
import logo from "../assets/logo.svg"; // logo image (same one used in Dashboard)

export default function Home() {
  const auth = useAuth();

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
      console.log("✅ already signed in (show dashboard later)");
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
          Atticus helps plaintiff teams turn chaos into clarity. We take raw inputs like texts, voicemails, scanned PDFs, and email threads and automatically indentify key legal elements such as incident dates, parties, insurance providers, and injuries. Instead of manually typing summaries or copying details into spreadsheets, your team can drag and drop or paste any content — and Atticus instantly structures it into a clean, searchable case record. It filters out filler language, detects duplicates, and links the message to the correct client or matter number.
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
            <h3 className="how-title">Intake without friction</h3>
            <p className="how-text">
              No portals. No forms. Instead of manually typing summaries or copying details into spreadsheets, your team can drag and drop or paste any content — and Atticus instantly structures it into a clean, searchable case record.
It filters out filler language, detects duplicates, and links the message to the correct client or matter number.
            </p>
          </div>

          <div className="how-card">
            <h3 className="how-title">Structured next steps</h3>
            <p className="how-text">
              Atticus doesn’t just summarize; it plans the follow-through.
Using legal language understanding, it detects deadlines, missing discovery items, offer adjustments, and follow-up tasks. It classifies each finding as time-sensitive, pending documentation, or awaiting client response, and assigns it to the right internal role.
            </p>
          </div>

          <div className="how-card">
            <h3 className="how-title">Team handoff ready</h3>
            <p className="how-text">
             Atticus translates messy updates into role-specific summaries so every team member receives only what they need.

Schedulers automatically see hearing dates, medical appointments, and deposition slots in calendar-ready format.

Demand writers get concise summaries of treatments, damages, and policy limits ready for demand package drafting.

Case managers view document requests, client messages, and outstanding follow-ups in checklist form.
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
