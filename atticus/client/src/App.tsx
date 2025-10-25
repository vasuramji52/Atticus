import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { PiSparkleFill } from "react-icons/pi";
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const updateCharCount = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
  }

  return (
    <>
      <div className='horizontal-bar'>
          <link href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&display=swap" rel="stylesheet"></link>
          <h1>Atticus</h1>
          <h2>Your personalized legal assistant</h2>
          <h3>Est. 2025</h3>
      </div>
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
