import { useState, type MouseEventHandler, useEffect } from "react";
import './Dashboard.css';
import Modal from "react-modal"
import logo from '../assets/logo.svg'

Modal.setAppElement('#root');


interface Appointment {
  appointment_id: string;
  summary: string;
  scheduled_for: string;
  status: string;
  created_by: string;
  created_at: string;
}

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // 👇 Fetch from backend
 useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("❌ Failed to fetch appointments", err);
    }
  };

  fetchAppointments();

  // 🕒 Poll every 5 seconds
  const interval = setInterval(fetchAppointments, 2000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);

  // Format date and time for display
  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const previewAppointments = appointments.slice(0, 4);

    return(
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
          <button className="grid-item notepad-preview" onClick={() => setOpen(true)}>
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
          <div className="grid-item">BOX 2</div>
          <div className="grid-item">BOX 3</div>
          <div className="grid-item">BOX 4</div>
          <div className="grid-item">BOX 5</div>
          <div className="grid-item">BOX 6</div>
        </div>
        </div>
        </>
    )
}
export default Dashboard;