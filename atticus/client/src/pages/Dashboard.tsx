import { useState, type MouseEventHandler, useEffect } from "react";
import './Dashboard.css';
import Modal from "react-modal"
import logo from '../assets/logo.svg'
import { Link } from "react-router-dom";

Modal.setAppElement('#root');


interface Appointment {
  appointment_id: string;
  summary: string;
  scheduled_for: string;
  status: string;
  created_by: string;
  created_at: string;
}

interface LegalResearchData {
  jurisdiction?: string | null;
  topic?: string;
  situation_summary?: string;
  legal_analysis?: string;
  draft_summary?: string;
}

interface ClientCommData {
  tone?: "professional" | "empathetic" | "assertive";
  subject?: string;
  draft_email?: string;
  follow_up_needed?: boolean;
}

interface Task {
  task_id: string;
  summary: string;
  task_type: string;
  specialist_assigned: string;
  created_by: string;
  created_at: string;
  status: string;
  confidence: number;
  raw_input: string;
  updated_at: string;
  stage2_id?: string;
  additional_data?: any | LegalResearchData | ClientCommData
}

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [legalResearchTasks, setLegalResearchTasks] = useState<Task[]>([]);
  const [openResearchModal, setOpenResearchModal] = useState(false);
  const [commTasks, setCommTasks] = useState<Task[]>([]);
const [openCommModal, setOpenCommModal] = useState(false);

  // 👇 Fetch from backend
 useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("❌ Failed to fetch appointments", err);
    }
  };

  fetchAppointments();

  // 🕒 Poll every 5 seconds
  const interval = setInterval(fetchAppointments, 30000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data: Task[] = await res.json();

      const legalResearchOnly = data.filter(
        (task) => task.task_type === "LEGAL_RESEARCH"
      );
      setLegalResearchTasks(legalResearchOnly);

      const commOnly = data.filter(
        (task) => task.task_type === "EMAIL_DRAFTER"
      );
      setCommTasks(commOnly);
    } catch (err) {
      console.error("❌ Failed to fetch tasks", err);
    }
  };

  fetchTasks();
  const interval = setInterval(fetchTasks, 30000);
  return () => clearInterval(interval);
}, []);


  // Format date and time for display
  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const filteredCommTasks = commTasks.filter(
  (task) =>
    task.additional_data &&
    (task.additional_data.draft_email?.trim() ||
     task.additional_data.subject?.trim())
);

  const previewAppointments = appointments.slice(0, 4);

    return(
        <>
        <div className='horizontal-bar'>
  <link
    href="https://fonts.googleapis.com/css2?family=Corinthia:wght@400;700&display=swap"
    rel="stylesheet"
  ></link>

  <div className="left-header">
    <h1 className='atticus-title'>
      Atticus <img src={logo} className='logo' alt="logo" />
    </h1>
    <h2>Your personalized legal assistant</h2>
    <h3>Est. 2025</h3>
  </div>

  <div className="right-header">
    <Link to="/prompt" className="nav-btn">Prompt</Link>
    <Link to="/dashboard" className="nav-btn">Dashboard</Link>
  </div>
</div>
        <div className='main-body'>
        <div className="grid-container">
          <button className="grid-item notepad-preview" onClick={() => setOpen(true)}>
            <h2>Appointments</h2>
            <div className="notepad-table preview-table">
              <div className="notepad-row header">
                <div>Date</div>
                <div>Time</div>
                <div>Appointment</div>
              </div>
              {previewAppointments.map((appt, i) => (
                <div key={appt.appointment_id || i} className="notepad-row">
                  <div>{formatDate(appt.scheduled_for)}</div>
                  <div>{formatTime(appt.scheduled_for)}</div>
                  <div>{appt.summary}</div>
                </div>
              ))}
              {appointments.length > 4 && (
                <div className="notepad-row more-row">
                  <div >+ {appointments.length - 4} more…</div>
                </div>
              )}
            </div>
          </button>
          <Modal
            isOpen={open}
            onRequestClose={() => setOpen(false)}
            overlayClassName={{
                base: "modal-overlay",
                afterOpen: "modal-overlay--after-open",
                beforeClose: "modal-overlay--before-close"
            }}
            className={{
                base: "modal-content",
                afterOpen: "modal-content--after-open",
                beforeClose: "modal-content--before-close"
            }}
            closeTimeoutMS={300}
          >
            <div className="modal-header">
              <h2>Scheduled Appointments</h2>
              <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="notepad-table">
              <div className="notepad-row header">
                <div>Date</div>
                <div>Time</div>
                <div>Appointment</div>
              </div>
              {appointments.map((appt, i) => (
                <div key={appt.appointment_id || i} className="notepad-row">
                  <div>{formatDate(appt.scheduled_for)}</div>
                  <div>{formatTime(appt.scheduled_for)}</div>
                  <div>{appt.summary}</div>
                </div>
              ))}

            </div>
          </Modal>
              <button className="grid-item notepad-preview" onClick={() => setOpenResearchModal(true)}>
                <h2>Legal Research</h2>
      <div className="notepad-table preview-table">
        <div className="notepad-row header">
          <div>Date</div>
          <div>Summary</div>
        </div>
        {legalResearchTasks.slice(0, 2).map((task, i) => (
          <div key={task.task_id || i} className="notepad-row">
            <div>{new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            <div>{task.summary}</div>
          </div>
        ))}
        {legalResearchTasks.length > 2 && (
          <div className="notepad-row more-row">
            <div>+ {legalResearchTasks.length - 2} more…</div>
          </div>
        )}
      </div>
    </button>
<Modal
  isOpen={openResearchModal}
  onRequestClose={() => setOpenResearchModal(false)}
  overlayClassName={{
    base: "modal-overlay",
    afterOpen: "modal-overlay--after-open",
    beforeClose: "modal-overlay--before-close",
  }}
  className={{
    base: "modal-content",
    afterOpen: "modal-content--after-open",
    beforeClose: "modal-content--before-close",
  }}
  closeTimeoutMS={300}
>
  <div className="modal-header">
    <h2>Legal Research</h2>
    <button className="close-btn" onClick={() => setOpenResearchModal(false)}>✕</button>
  </div>

  <div className="notepad-table">
    <div className="notepad-row header">
      <div>Topic</div>
      <div>Legal Analysis</div>
    </div>
    {legalResearchTasks
  .filter(
    (task) =>
      task.additional_data &&
      (task.additional_data.legal_analysis || task.additional_data.topic)
  )
  .map((task, i) => (
    <div key={task.task_id || i} className="notepad-row">
      <div className="topic-column">
        {task.additional_data?.topic}
      </div>
      <div className="analysis-column">
        {task.additional_data?.legal_analysis}
      </div>
    </div>
  ))}

  </div>
</Modal>


          <button className="grid-item notepad-preview" onClick={() => setOpenCommModal(true)}>
            <h2>Pending Emails</h2>
  <div className="notepad-table preview-table">
    <div className="notepad-row header">
      <div>Subject</div>
      <div>Urgency</div>
    </div>
    {commTasks.slice(0, 2).map((task, i) => {
      const data = task.additional_data as ClientCommData;
      const urgency = data?.follow_up_needed ? "Follow-up Required" : "Normal";

      return (
        <div key={task.task_id || i} className="notepad-row">
          <div className="wrap-text">{data?.subject || "—"}</div>
          <div className={`wrap-text ${data?.follow_up_needed ? "urgent" : ""}`}>
            {urgency}
          </div>
        </div>
      );
    })}
    {commTasks.length > 2 && (
      <div className="notepad-row more-row">
        <div>+ {commTasks.length - 2} more…</div>
      </div>
    )}
  </div>
</button>
<Modal
  isOpen={openCommModal}
  onRequestClose={() => setOpenCommModal(false)}
  overlayClassName={{
    base: "modal-overlay",
    afterOpen: "modal-overlay--after-open",
    beforeClose: "modal-overlay--before-close",
  }}
  className={{
    base: "modal-content",
    afterOpen: "modal-content--after-open",
    beforeClose: "modal-content--before-close",
  }}
  closeTimeoutMS={300}
>
  <div className="modal-header">
    <h2>Client Communication Drafts</h2>
    <button className="close-btn" onClick={() => setOpenCommModal(false)}>✕</button>
  </div>

  <div className="notepad-table email-table">
    <div className="notepad-row header">
      <div>Subject</div>
      <div>Email</div>
    </div>

    {filteredCommTasks.map((task, i) => (
      <div key={task.task_id || i} className="notepad-row email-row">
        {/* Left column — Subject */}
        <div className="subject-column">
          {task.additional_data?.subject || "—"}
          {task.additional_data?.follow_up_needed && (
            <div className="follow-up-tag">Follow-up Needed ⚠️</div>
          )}
        </div>

        {/* Right column — Email body + send button */}
        <div className="email-column">
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {task.additional_data?.draft_email || "No draft available."}
          </pre>
          <button
            className="send-button"
            onClick={() => alert(`📤 Fake sending: "${task.additional_data?.subject}"`)}
          >
            Send ✉️
          </button>
        </div>
      </div>
    ))}
  </div>
</Modal>
        </div>
        </div>
        </>
    )
}
export default Dashboard;