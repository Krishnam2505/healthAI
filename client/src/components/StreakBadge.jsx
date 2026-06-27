import React from 'react';

export default function StreakBadge({ current, longest }) {
  // Edge Case Handling: If the backend sends us 'undefined' or 'null' data because 
  // the user is brand new, we default it to 0 so the app doesn't crash!
  const safeCurrent = current || 0;
  const safeLongest = longest || 0;

  return (
    <>
      {/* We apply the global .card utility class, plus our own custom .streak-card class */}
      <div className="card streak-card">
        
        {/* Conditional Rendering: If they have 0 days, show an encouraging message. Otherwise, show the big number! */}
        {safeCurrent === 0 ? (
          <div className="streak-header zero-state">Start your streak today! 🔥</div>
        ) : (
          <div className="streak-header">
            <span className="fire-emoji">🔥</span>
            <span className="streak-number">{safeCurrent}</span>
            <span className="streak-text"> Day Streak</span>
          </div>
        )}
        
        {/* The historical best streak */}
        <div className="streak-best">
          Best: {safeLongest} days
        </div>
      </div>

      {/* Component-Specific Styles */}
      <style>{`
        .streak-card {
          border: 1px solid var(--accent-orange);
          /* This creates the beautiful glowing orange effect around the card! */
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.3); 
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 1.5rem;
          /* A subtle gradient that hints at the orange fire */
          background: linear-gradient(145deg, var(--bg-card) 0%, rgba(249, 115, 22, 0.05) 100%);
        }

        .streak-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .zero-state {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent-orange);
        }

        .fire-emoji {
          font-size: 2.5rem;
        }

        .streak-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--accent-orange);
          line-height: 1;
        }

        .streak-text {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .streak-best {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
