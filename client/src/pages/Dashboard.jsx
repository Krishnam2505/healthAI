import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CalorieRing from '../components/CalorieRing';
import WeeklyChart from '../components/WeeklyChart';
import MacroBreakdown from '../components/MacroBreakdown';
import StreakBadge from '../components/StreakBadge';

export default function Dashboard() {
  const { user } = useAuth();
  
  // 1. Dashboard State
  // dashboardData starts as 'null' until the backend sends us the giant JSON object
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch the Data!
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the user's local date string (e.g. '2026-06-30')
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const localDateStr = d.toISOString().split('T')[0];
      
      // Hits the aggregation route and passes the user's explicit local date
      const response = await api.get(`/dashboard?date=${localDateStr}`);
      setDashboardData(response.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError('Failed to load your health data. Please try again later.');
    } finally {
      // Whether it succeeds or fails, stop the loading animation
      setLoading(false);
    }
  };

  // 3. Trigger the fetch instantly when this page loads (Component Mount)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ------------------------------------------------------------------
  // LOADING STATE (Skeleton UI)
  // Instead of a boring spinning wheel, we show gray pulsing boxes
  // where the data WILL be, giving a much smoother experience.
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton-greeting"></div>
        <div className="dashboard-grid">
          {/* Row 1: Four stat blocks */}
          <div className="skeleton-card stat-skeleton"></div>
          <div className="skeleton-card stat-skeleton"></div>
          <div className="skeleton-card stat-skeleton"></div>
          <div className="skeleton-card stat-skeleton"></div>
          
          {/* Row 2: Ring (span 5) and Chart (span 7) */}
          <div className="skeleton-card main-skeleton span-5"></div>
          <div className="skeleton-card main-skeleton span-7"></div>
          
          {/* Row 3: Macros (span 6) and Streak (span 6) */}
          <div className="skeleton-card main-skeleton span-6"></div>
          <div className="skeleton-card main-skeleton span-6"></div>
        </div>
        <style>{skeletonStyles}</style>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------------------
  if (error) {
    return (
      <div className="dashboard-container error-container">
        <div className="card error-card">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // SUCCESS STATE (Wiring Real Data)
  // ------------------------------------------------------------------
  
  // 1. Destructure the massive JSON object we got from the backend
  const { today, weekly, streak, user: profile } = dashboardData;

  // 2. Personalize the greeting based on the user's actual local time
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  // 3. Format today's date nicely (e.g. "Monday, October 24")
  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="dashboard-container">
        
        {/* ROW 1: Greeting */}
        <header className="dashboard-header fade-in">
          <h1>{greeting}, {profile?.name?.split(' ')[0]} 👋</h1>
          <p>{dateString}</p>
        </header>

        {/* CSS GRID LAYOUT */}
        <div className="dashboard-grid">
          
          {/* ROW 2: Four quick stat cards */}
          <div className="card stat-card fade-in-up delay-100">
            <h3>🍽️ Calories</h3>
            <div className="stat-value">{today.totalCalories} <span className="stat-unit">kcal</span></div>
          </div>
          <div className="card stat-card fade-in-up delay-200">
            <h3>🔥 Burned</h3>
            <div className="stat-value">{today.caloriesBurned} <span className="stat-unit">kcal</span></div>
          </div>
          <div className="card stat-card fade-in-up delay-300">
            <h3>💧 Water</h3>
            <div className="stat-value">{today.waterLiters} <span className="stat-unit">L</span></div>
          </div>
          <div className="card stat-card fade-in-up delay-400">
            <h3>😴 Sleep</h3>
            {/* If they haven't logged sleep yet, show a dash instead of 0 */}
            <div className="stat-value">{today.sleepHours || '—'} <span className="stat-unit">hrs</span></div>
          </div>

          {/* ROW 3: Ring (40%) and Weekly Chart (60%) */}
          <div className="card span-5 flex-col fade-in-up delay-200">
            <h2 className="card-title">Daily Goal</h2>
            <CalorieRing consumed={today.totalCalories} target={profile.dailyCalorieTarget} />
          </div>
          
          <div className="card span-7 flex-col fade-in-up delay-300">
            <h2 className="card-title">This Week</h2>
            <WeeklyChart 
              labels={weekly.labels} 
              caloriesData={weekly.calories}
              workoutMinutesData={weekly.workoutMinutes}
            />
          </div>

          {/* ROW 4: Macros (50%) and Streak (50%) */}
          <div className="card span-6 flex-col fade-in-up delay-400">
            <h2 className="card-title">Macros</h2>
            <MacroBreakdown protein={today.totalProtein} carbs={today.totalCarbs} fat={today.totalFat} />
          </div>

          {/* We don't wrap the streak in a .card because StreakBadge already acts as its own card! */}
          <div className="span-6 flex-col stretch-child fade-in-up delay-500">
            <StreakBadge current={streak.current} longest={streak.longest} />
          </div>

        </div>
      </div>

      <style>{dashboardStyles}</style>
    </>
  );
}

// ------------------------------------------------------------------
// COMPONENT STYLES
// We extract these down here so the React logic stays clean and readable!
// ------------------------------------------------------------------
const dashboardStyles = `
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .dashboard-header {
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
  }

  .dashboard-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  /* The 12-Column Magic Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.5rem;
  }

  /* Utility classes to easily span grid columns */
  .span-5 { grid-column: span 5; }
  .span-6 { grid-column: span 6; }
  .span-7 { grid-column: span 7; }

  /* Helps stretch the StreakBadge to match the height of the Macro card */
  .stretch-child {
    display: flex;
    flex-direction: column;
  }
  .stretch-child > div {
    flex: 1; 
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }

  /* Top Stat Cards */
  .stat-card {
    grid-column: span 3;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stat-card h3 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .stat-unit {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  /* Full Screen Error View */
  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
  }

  .error-card {
    text-align: center;
    border: 1px solid var(--accent-red);
    box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.2);
    max-width: 400px;
  }

  .error-card h2 { 
    color: var(--accent-red); 
    margin-bottom: 1rem; 
  }

  .error-card p { 
    color: var(--text-secondary); 
    margin-bottom: 1.5rem; 
  }

  /* MEDIA QUERIES (Mobile Responsiveness) */
  @media (max-width: 900px) {
    /* On Tablets: Make the top stats a 2x2 square instead of 1x4 */
    .stat-card { grid-column: span 6; } 
    /* Stack all the charts vertically */
    .span-5, .span-6, .span-7 { grid-column: span 12; } 
  }

  @media (max-width: 600px) {
    /* On Phones: Shrink padding to save screen space */
    .dashboard-container { padding: 1rem; }
    /* Stack the top stats 1 on top of the other (1x4) */
    .stat-card { grid-column: span 12; } 
  }
`;

const skeletonStyles = `
  /* Same layout as the real dashboard, but filled with gray pulsing blocks! */
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.5rem;
  }
  .skeleton-greeting {
    height: 60px;
    width: 300px;
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    margin-bottom: 2rem;
    animation: pulse 1.5s infinite ease-in-out;
  }
  .skeleton-card {
    background: var(--bg-card-hover);
    border-radius: var(--radius);
    animation: pulse 1.5s infinite ease-in-out;
  }
  .stat-skeleton { grid-column: span 3; height: 120px; }
  .main-skeleton { height: 350px; }
  .span-5 { grid-column: span 5; }
  .span-7 { grid-column: span 7; }
  .span-6 { grid-column: span 6; }

  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { opacity: 0.3; }
  }

  @media (max-width: 900px) {
    .stat-skeleton { grid-column: span 6; }
    .span-5, .span-6, .span-7 { grid-column: span 12; }
  }

  @media (max-width: 600px) {
    .dashboard-container { padding: 1rem; }
    .stat-skeleton { grid-column: span 12; }
  }
`;
