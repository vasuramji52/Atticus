import { useState, type MouseEventHandler } from "react";
import './Dashboard.css';
import Modal from "react-modal"
import logo from '../assets/logo.svg'

Modal.setAppElement('#root');

function Dashboard() {
    const[open, setOpen] = useState(false);
    const handleOpen = () => {setOpen(true)}
    const handleClose = () => {setOpen(false)}

    const appointments = [
    { date: "2025-10-26", time: "09:00 AM", name: "Deposition Meeting" },
    { date: "2025-10-26", time: "01:30 PM", name: "Client Call" },
    { date: "2025-10-27", time: "10:00 AM", name: "Court Hearing" },
    { date: "2025-10-28", time: "03:00 PM", name: "Contract Review" },
    { date: "2025-10-29", time: "08:30 AM", name: "Arbitration" },
    { date: "2025-10-30", time: "11:15 AM", name: "Settlement Conference" },
  ];

  const previewAppointments = appointments.slice(0,4);

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
                <div key={i} className="notepad-row">
                  <div>{appt.date}</div>
                  <div>{appt.time}</div>
                  <div>{appt.name}</div>
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
                <div key={i} className="notepad-row">
                  <div>{appt.date}</div>
                  <div>{appt.time}</div>
                  <div>{appt.name}</div>
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