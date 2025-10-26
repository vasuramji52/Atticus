import { useState } from "react";
import { PiSparkleFill } from "react-icons/pi";
import './Prompt.css'
import logo from '../assets/logo.svg'

function Prompt() {
  const [count, setCount] = useState(0)
  const[activeTab, SetActiveTab] = useState('EMAIL');
  const [inputValue, setInputValue] = useState("");
  
  
  const updateCharCount = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setCount(e.target.value.length);
  };

  const handleTabClick = (tab: string) => {
    SetActiveTab(tab);
  }

  const handleLoadExample = () => {
    const exampleText = EXAMPLES[activeTab] ?? "";
    setInputValue(exampleText);
    setCount(exampleText.length);
  };

  const EXAMPLES: Record<string, string> = {
    EMAIL: `From: client@example.com
    Subject: Contract Review Needed - URGENT

    Hi Team,

    We just received the draft services agreement from Acme Corp for the $250,000 consulting project. The client wants to sign by Friday (10/27/2025).

    Can someone review the liability clauses and payment terms? I'm particularly concerned about the 90-day payment window and the unlimited liability provision in section 7.

    Thanks,
    Sarah`,
    "TEXT MESSAGE": `Quick update - opposing counsel just filed their motion to dismiss in the Henderson case. Deadline to respond is 11/15/2025. We need to pull all relevant case law on jurisdictional challenges in patent cases. Also, the client wants a cost estimate for taking this through discovery.`,
    "CALL NOTES": `Client called to follow up on the status of their personal injury case. Wants to confirm if the medical records have been received. They’re also asking about next steps and whether the settlement discussion timeline is still accurate.`
  };


  return (
    <>
      <div className='horizontal-bar'>
          <link href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&display=swap" rel="stylesheet"></link>
          <h1 className='atticus-title'>Atticus
              <img src={logo} className='logo'></img>
          </h1>
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
          <textarea
            className='input-text-box'
            id='promptInput'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setCount(e.target.value.length);
            }}
          />
          <div className='input-footer'>
            <p><span>{count}</span> CHARACTERS</p>
            <button className='processAI'><PiSparkleFill size={20}></PiSparkleFill>  PROCESS WITH AI</button>
          </div>
        </div>
        <div className='example-box'>
  <h2>EXAMPLE TEMPLATES</h2>
  <div className="button-group">
    <button 
      className={`tab ${activeTab === "EMAIL" ? "active" : ""}`}
      onClick={() => SetActiveTab("EMAIL")}
    >EMAIL</button>
    <button 
      className={`tab ${activeTab === "TEXT MESSAGE" ? "active" : ""}`}
      onClick={() => SetActiveTab("TEXT MESSAGE")}
    >TEXT</button>
    <button 
      className={`tab ${activeTab === "CALL NOTES" ? "active" : ""}`}
      onClick={() => SetActiveTab("CALL NOTES")}
    >CALL NOTES</button>
  </div>

  <div className='example-text'>
    <pre>{(EXAMPLES[activeTab] ?? "").trim().replace(/^\s+/gm, '')}</pre>
  </div>

  <button className='load-example' onClick={handleLoadExample}>
    LOAD THIS EXAMPLE
  </button>
</div>

      </div>
    </>
  )
}

export default Prompt