import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { PiSparkleFill } from "react-icons/pi";
import { useAuth } from "react-oidc-context"; 
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const auth = useAuth();
  const updateCharCount = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
  }

  const handleAuthClick = () => {
  if (auth.isAuthenticated) {
    // clear the in-memory user first so UI flips immediately
    auth.removeUser().then(() => {
      window.location.href =
        "https://us-east-296wclzcby.auth.us-east-2.amazoncognito.com/logout" +
        "?client_id=7ikmvo0k2glff8dkqn8chgg3mg" +
        "&logout_uri=http://localhost:5174";
    });
  } else {
    auth.signinRedirect();
  }
};

  return (
    <>
      <div className='horizontal-bar'>
          <link href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&display=swap" rel="stylesheet"></link>
          <h1>Atticus</h1>
          <h2>Your personalized legal assistant</h2>
          <h3>Est. 2025</h3>
      </div>
       <button
        onClick={handleAuthClick}
        style={{
          marginTop: "0.5rem",
          fontSize: "0.8rem",
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        {auth.isAuthenticated ? "Sign Out" : "Sign In"}
      </button>
      <div className='main-body'>
        <div className="grid-container">
          <div className="grid-item">BOX 1
          </div>
          <div className="grid-item">BOX 2</div>
          <div className="grid-item">BOX 3</div>
        </div>
        <div className='input-box'>
          <h2>
            UNSTRUCTURED DATA INPUT
          </h2>
          <p>
            Paste emails, call notes, texts, or any unstructured legal communication. Our AI will extract actionable tasks and route them to specialized assistants.
          </p>
          <textarea className='input-text-box' id='promptInput' onChange={updateCharCount}></textarea>
          <div className='input-footer'>
            <p><span>{count}</span> CHARACTERS</p>
            <button className='processAI'><PiSparkleFill size={20}></PiSparkleFill>  PROCESS WITH AI</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
