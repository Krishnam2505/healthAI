import React, { useState } from 'react';
import api from '../api/axios';

export default function Plan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calls our Node.js backend, which forwards the request to Google's Gemini AI
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/weekly-plan');
      // We expect the backend to return an array of 7 day objects
      setPlan(response.data.plan);
    } catch (err) {
      console.error("Plan generation error:", err);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // Gemini can take 5-15 seconds to stream the massive JSON response.
  // We need a very clear loading indicator so the user doesn't leave.
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="plan-page center-content">
        <div className="ai-loader">
          <div className="ai-icon-large">🤖</div>
          <h2>Gemini is analyzing your data...</h2>
          <p>Writing your custom meal and workout plan.</p>
          <p className="loader-subtext">This usually takes 10-15 seconds.</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------
  if (error) {
    return (
      <div className="plan-page center-content">
        <div className="card error-card">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={handleGenerate}>Try Again</button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // ---------------------------------------------------------
  // INITIAL STATE (No Plan Generated Yet)
  // ---------------------------------------------------------
  if (!plan) {
    return (
      <div className="plan-page center-content">
        <div className="card intro-card">
          <div className="ai-icon-large">🤖</div>
          <h1>Your Personalized Weekly Plan</h1>
          <p className="intro-subtext">
            Gemini AI will analyze your last 7 days of activity, workouts, and meals to create a highly optimized, custom plan specifically for you.
          </p>
          <button className="btn-primary generate-btn" onClick={handleGenerate}>
            ✨ Generate My Plan
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  // ---------------------------------------------------------
  // SUCCESS STATE (Render the 7-Day Plan)
  // ---------------------------------------------------------
  return (
    <div className="plan-page">
      <div className="plan-header">
        <h1>Your AI Weekly Plan 🤖</h1>
        <button className="btn-secondary" onClick={handleGenerate}>
          Regenerate Plan
        </button>
      </div>

      <div className="plan-grid">
        {plan.map((dayPlan, idx) => (
          <div className="card day-card" key={idx}>
            <h2 className="day-name">{dayPlan.day}</h2>
            
            {/* WORKOUT SECTION (Blue Tint) */}
            <div className="plan-section workout-section">
              <h3>💪 Workout</h3>
              <p className="workout-summary">{dayPlan.workout.type} • {dayPlan.workout.duration} min</p>
              <ul className="exercise-list">
                {dayPlan.workout.exercises.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>

            {/* MEALS SECTION (Green Tint) */}
            <div className="plan-section meal-section">
              <h3>🍽️ Meals</h3>
              <div className="meal-item">
                <span className="meal-type">Breakfast</span>
                <span>{dayPlan.meals.breakfast.name} ({dayPlan.meals.breakfast.calories} kcal)</span>
              </div>
              <div className="meal-item">
                <span className="meal-type">Lunch</span>
                <span>{dayPlan.meals.lunch.name} ({dayPlan.meals.lunch.calories} kcal)</span>
              </div>
              <div className="meal-item">
                <span className="meal-type">Dinner</span>
                <span>{dayPlan.meals.dinner.name} ({dayPlan.meals.dinner.calories} kcal)</span>
              </div>
              <div className="meal-item">
                <span className="meal-type">Snack</span>
                <span>{dayPlan.meals.snack.name} ({dayPlan.meals.snack.calories} kcal)</span>
              </div>
              <div className="meal-total">
                Total: {dayPlan.meals.totalCalories} kcal
              </div>
            </div>

            {/* TIP SECTION (Amber Tint) */}
            <div className="plan-section tip-section">
              <h3>💡 Tip of the Day</h3>
              <p><i>"{dayPlan.tip}"</i></p>
            </div>
          </div>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT STYLES
// ------------------------------------------------------------------
const styles = `
  .plan-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 64px);
  }

  .center-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* INTRO CARD */
  .intro-card {
    text-align: center;
    max-width: 500px;
    padding: 3rem 2rem;
  }

  .ai-icon-large {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 2s infinite ease-in-out;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  .intro-card h1 {
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }

  .intro-subtext {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .generate-btn {
    font-size: 1.2rem;
    padding: 1rem 2rem;
    width: 100%;
    border-radius: 12px;
  }

  /* LOADER */
  .ai-loader {
    text-align: center;
  }

  .ai-loader h2 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .ai-loader p {
    color: var(--text-secondary);
  }

  .loader-subtext {
    font-size: 0.85rem;
    margin-top: 1rem;
    opacity: 0.7;
  }

  /* PLAN LAYOUT */
  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .plan-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .plan-grid {
    display: grid;
    /* 3 columns on desktop */
    grid-template-columns: repeat(3, 1fr); 
    gap: 1.5rem;
  }

  .day-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .day-name {
    color: var(--accent-green);
    font-size: 1.5rem;
    font-weight: 800;
    border-bottom: 2px solid var(--border);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  /* SECTIONS */
  .plan-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .plan-section h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  /* Colored Tints */
  .workout-section {
    background: rgba(59, 130, 246, 0.08); /* Extremely light blue tint */
  }
  .workout-section h3 { color: #2563eb; }
  
  .workout-summary {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .exercise-list {
    margin-left: 1.25rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .meal-section {
    background: rgba(16, 185, 129, 0.08); /* Extremely light green tint */
  }
  .meal-section h3 { color: var(--accent-green); }

  .meal-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .meal-type {
    font-weight: 700;
    color: var(--text-primary);
  }

  .meal-total {
    margin-top: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    text-align: right;
  }

  .tip-section {
    background: rgba(245, 158, 11, 0.08); /* Extremely light amber tint */
  }
  .tip-section h3 { color: #d97706; }
  .tip-section p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* ERROR STATE */
  .error-card {
    text-align: center;
    border: 1px solid var(--accent-red);
  }
  .error-card h2 { color: var(--accent-red); margin-bottom: 1rem; }
  .error-card p { color: var(--text-secondary); margin-bottom: 1.5rem; }

  /* RESPONSIVE MEDIA QUERIES */
  @media (max-width: 1024px) {
    /* Tablets get 2 columns */
    .plan-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    /* Phones get a single column */
    .plan-grid { grid-template-columns: 1fr; }
    .plan-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .plan-page { padding: 1rem; }
  }
`;
