import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

export default function Cycle() {
  const { toastProps, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState([]);
  
  // State for today's log
  const [flowIntensity, setFlowIntensity] = useState('None');
  const [cramps, setCramps] = useState('None');
  const [mood, setMood] = useState('None');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCycleData();
  }, []);

  const fetchCycleData = async () => {
    try {
      const response = await api.get('/cycle');
      setCycleData(response.data);
      
      // If they already logged today, pre-fill the buttons
      const today = new Date();
      const todaysLog = response.data.find(log => {
        const logDate = new Date(log.date);
        return logDate.getDate() === today.getDate() && 
               logDate.getMonth() === today.getMonth() && 
               logDate.getFullYear() === today.getFullYear();
      });
      if (todaysLog) {
        setFlowIntensity(todaysLog.flowIntensity || 'None');
        setCramps(todaysLog.cramps || 'None');
        setMood(todaysLog.mood || 'None');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        showToast("Access Denied: Cycle tracking is for female profiles only.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogSymptom = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/cycle', {
        flowIntensity,
        cramps,
        mood
      });
      showToast('Symptoms logged successfully!', 'success');
      fetchCycleData(); // Refresh
    } catch (err) {
      showToast('Failed to log symptoms', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Cycle Calculation Logic (Simple MVP) ---
  // A typical cycle is 28 days.
  // Menstrual: Days 1-5
  // Follicular: Days 6-13
  // Ovulation: Day 14
  // Luteal: Days 15-28
  
  // Find the most recent 'Menstrual' start date (where flow is not None)
  let dayOfCycle = 1;
  let phaseName = "Menstrual";
  
  if (cycleData.length > 0) {
    const sortedLogs = [...cycleData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastPeriodStart = sortedLogs.find(log => log.flowIntensity !== 'None');
    
    if (lastPeriodStart) {
      const diffTime = Math.abs(new Date() - new Date(lastPeriodStart.date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Modulo 28 so it loops around
      dayOfCycle = (diffDays % 28) || 1; 
    }
  }

  // --- CALENDAR GRID LOGIC ---
  const sortedLogs = cycleData.length > 0 ? [...cycleData].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const lastPeriodStart = sortedLogs.find(log => log.flowIntensity !== 'None');

  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  let pStart = null;
  let nextPeriodStartStr = "Unknown";
  
  if (lastPeriodStart) {
    pStart = new Date(lastPeriodStart.date);
    pStart.setHours(0,0,0,0);
    
    const nextStart = new Date(pStart);
    nextStart.setDate(nextStart.getDate() + 28);
    nextPeriodStartStr = nextStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  const getDayStatus = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0,0,0,0);
    const time = d.getTime();
    
    const log = cycleData.find(l => {
      const logDate = new Date(l.date);
      return logDate.getDate() === day && 
             logDate.getMonth() === currentMonth && 
             logDate.getFullYear() === currentYear;
    });
    
    if (log && log.flowIntensity && log.flowIntensity !== 'None') {
      return 'logged-flow';
    }
    
    if (pStart) {
      const pTime = pStart.getTime();
      const currentEnd = new Date(pStart);
      currentEnd.setDate(currentEnd.getDate() + 4); // 5 days total
      
      if (time >= pTime && time <= currentEnd.getTime()) return 'predicted-flow';
      
      const nextStart = new Date(pStart);
      nextStart.setDate(nextStart.getDate() + 28);
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextEnd.getDate() + 4);
      
      if (time >= nextStart.getTime() && time <= nextEnd.getTime()) return 'next-predicted-flow';
    }
    return '';
  };

  if (dayOfCycle >= 1 && dayOfCycle <= 5) phaseName = "Menstrual";
  else if (dayOfCycle >= 6 && dayOfCycle <= 13) phaseName = "Follicular";
  else if (dayOfCycle === 14) phaseName = "Ovulation";
  else phaseName = "Luteal";

  // Calculate SVG Circle Dasharray
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Fill the circle based on dayOfCycle (1-28)
  const strokeDashoffset = circumference - (dayOfCycle / 28) * circumference;

  if (loading) return <div className="page-container" style={{textAlign: 'center', padding: '4rem'}}>Loading Cycle Insights...</div>;

  return (
    <div className="cycle-page-container">
      <div className="cycle-header">
        <h1 className="cycle-heading">Cycle Insights</h1>
        <span className="cycle-date">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</span>
      </div>

      <div className="cycle-card">
        {/* --- CIRCULAR DIAL UI --- */}
        <div className="dial-container">
          <svg className="cycle-dial" viewBox="0 0 300 300">
            <defs>
              <linearGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="100%" stopColor="#cc0000" />
              </linearGradient>
              <linearGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb3ba" />
                <stop offset="100%" stopColor="#ff7b89" />
              </linearGradient>
              <linearGradient id="ovulationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffdfba" />
                <stop offset="100%" stopColor="#ffb347" />
              </linearGradient>
              <linearGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#baffc9" />
                <stop offset="100%" stopColor="#47cc70" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle 
              cx="150" cy="150" r={radius} 
              fill="transparent" 
              stroke="#f0f0f0" 
              strokeWidth="16" 
            />
            {/* Progress Bar */}
            <circle 
              cx="150" cy="150" r={radius} 
              fill="transparent" 
              stroke={
                phaseName === 'Menstrual' ? 'url(#menstrualGrad)' :
                phaseName === 'Follicular' ? 'url(#follicularGrad)' :
                phaseName === 'Ovulation' ? 'url(#ovulationGrad)' :
                'url(#lutealGrad)'
              } 
              strokeWidth="16" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
            />
          </svg>
          <div className="dial-content">
            <span className="dial-subtitle">DAY</span>
            <span className="dial-day">{dayOfCycle}</span>
            <span className="dial-phase" style={{
              color: phaseName === 'Menstrual' ? '#cc0000' :
                     phaseName === 'Follicular' ? '#ff7b89' :
                     phaseName === 'Ovulation' ? '#ffb347' :
                     '#47cc70'
            }}>{phaseName}</span>
          </div>
        </div>

        {/* --- PREDICTIVE CALENDAR --- */}
        <div className="calendar-section" style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#222' }}>Predictive Calendar</h2>
          <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 500 }}>
             {lastPeriodStart 
                ? `Based on your logs, your next cycle is expected around ${nextPeriodStartStr}.`
                : 'Log your flow to activate predictive tracking.'}
          </p>
          
          <div className="calendar-wrapper">
            <h3 className="calendar-month-title">{todayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-cell empty"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday = day === todayDate.getDate();
                return (
                  <div key={day} className={`calendar-cell ${status} ${isToday ? 'is-today' : ''}`}>
                    <span className="day-number">{day}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="calendar-legend">
              <div className="legend-item"><div className="legend-box logged-flow"></div> Logged Flow</div>
              <div className="legend-item"><div className="legend-box predicted-flow"></div> Current Cycle</div>
              <div className="legend-item"><div className="legend-box next-predicted-flow"></div> Predicted Next</div>
            </div>
          </div>
        </div>

        {/* --- QUICK LOGGING BUTTONS --- */}
        <div className="logging-header">
          <h2>Daily Log</h2>
          <span>• {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span>
        </div>
        
        <div className="symptoms-grid">
          <div className="symptom-card">
            <div className="symptom-card-header" style={{background: '#ffe6e6', color: '#cc0000'}}>
              <h3>Cramps</h3>
            </div>
            <div className="symptom-card-body">
              {['None', 'Mild', 'Severe'].map(opt => (
                <button 
                  key={opt}
                  className={`premium-btn ${cramps === opt ? 'active-cramps' : ''}`}
                  onClick={() => setCramps(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="symptom-card">
            <div className="symptom-card-header" style={{background: '#ffe8d6', color: '#d97706'}}>
              <h3>Mood</h3>
            </div>
            <div className="symptom-card-body">
              {['None', 'Happy', 'Calm', 'Anxious', 'Tired'].map(opt => (
                <button 
                  key={opt}
                  className={`premium-btn ${mood === opt ? 'active-mood' : ''}`}
                  onClick={() => setMood(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="symptom-card" style={{gridColumn: '1 / -1'}}>
            <div className="symptom-card-header" style={{background: '#ffe4e1', color: '#c71585'}}>
              <h3>Flow</h3>
            </div>
            <div className="symptom-card-body">
              {['None', 'Spotting', 'Light', 'Medium', 'Heavy'].map(opt => (
                <button 
                  key={opt}
                  className={`premium-btn ${flowIntensity === opt ? 'active-flow' : ''}`}
                  onClick={() => setFlowIntensity(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          className="save-symptoms-btn" 
          onClick={handleLogSymptom}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Symptoms'}
        </button>
      </div>

      <Toast {...toastProps} />

      <style>{`
        .cycle-page-container {
          min-height: calc(100vh - 70px);
          background: #fffcfcfc; /* Extremely soft blush white */
          padding: 2rem 1rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .cycle-header {
          max-width: 800px;
          margin: 0 auto 1.5rem auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cycle-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .cycle-date {
          color: #666;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .cycle-card {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.03);
        }

        /* --- DIAL CSS --- */
        .dial-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1rem 0 3.5rem 0;
        }

        .cycle-dial {
          width: 100%;
          max-width: 320px;
          height: auto;
          filter: drop-shadow(0 8px 12px rgba(0,0,0,0.05));
        }

        .dial-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dial-subtitle {
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
          letter-spacing: 2px;
          margin-bottom: -0.25rem;
        }

        .dial-day {
          font-size: 4.5rem;
          font-weight: 800;
          color: #111;
          line-height: 1.1;
          letter-spacing: -2px;
        }

        .dial-phase {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 0.25rem;
        }

        /* --- LOGGING UI CSS --- */
        .logging-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .logging-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #222;
          margin: 0;
        }

        .logging-header span {
          color: #888;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .symptoms-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 600px) {
          .symptoms-grid {
            grid-template-columns: 1fr;
          }
        }

        .symptom-card {
          background: #fafafa;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .symptom-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .symptom-card-header {
          padding: 0.75rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .symptom-card-header h3 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .symptom-card-header span {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.7;
        }

        .symptom-card-body {
          padding: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .premium-btn {
          flex: 1;
          min-width: 60px;
          padding: 0.6rem 0.5rem;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .premium-btn:hover {
          background: #f8f8f8;
          border-color: #d0d0d0;
          color: #222;
        }

        /* Themed Active States */
        .active-cramps { background: #cc0000; color: white; border-color: #cc0000; box-shadow: 0 4px 10px rgba(204,0,0,0.2); }
        .active-cramps:hover { background: #b30000; color: white; border-color: #b30000; }

        .active-mood { background: #d97706; color: white; border-color: #d97706; box-shadow: 0 4px 10px rgba(217,119,6,0.2); }
        .active-mood:hover { background: #b45309; color: white; border-color: #b45309; }

        .active-flow { background: #c71585; color: white; border-color: #c71585; box-shadow: 0 4px 10px rgba(199,21,133,0.2); }
        .active-flow:hover { background: #a0106a; color: white; border-color: #a0106a; }

        .save-symptoms-btn {
          width: 100%;
          padding: 1.15rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          background: #111;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .save-symptoms-btn:hover {
          background: #333;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        
        .save-symptoms-btn:disabled {
          background: #888;
          cursor: not-allowed;
          transform: none;
        }

        /* --- CALENDAR CSS --- */
        .calendar-wrapper {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .calendar-month-title {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #333;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .calendar-day-header {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .calendar-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: 500;
          color: #444;
          background: #fcfcfc;
          border: 1px solid #f5f5f5;
        }

        .calendar-cell.empty {
          background: transparent;
          border: none;
        }

        .calendar-cell.is-today {
          border: 2px solid #111;
          font-weight: 800;
        }

        /* Logic Styles */
        .calendar-cell.logged-flow {
          background: #cc0000;
          color: white;
          border-color: #cc0000;
          box-shadow: 0 2px 6px rgba(204,0,0,0.2);
        }

        .calendar-cell.predicted-flow {
          background: #fff0f0;
          color: #cc0000;
          border: 1px dashed #ffa6a6;
        }

        .calendar-cell.next-predicted-flow {
          background: #fff7eb;
          color: #d97706;
          border: 1px dashed #fcd34d;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .legend-box {
          width: 12px;
          height: 12px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
