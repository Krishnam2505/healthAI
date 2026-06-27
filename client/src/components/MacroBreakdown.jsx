import React from 'react';

export default function MacroBreakdown({ protein = 0, carbs = 0, fat = 0 }) {
  // 1. Calculate the total macros
  const total = protein + carbs + fat;

  // 2. Empty State Handling
  // If the user hasn't eaten anything yet today, don't show the bars (and avoid a divide-by-zero math error)
  if (total === 0) {
    return (
      <div className="macro-empty">
        No meals logged today
      </div>
    );
  }

  // 3. Percentage Math
  // We use Math.round() so we get clean whole numbers like "34%" instead of "33.9213%"
  const proteinPct = Math.round((protein / total) * 100);
  const carbsPct = Math.round((carbs / total) * 100);
  const fatPct = Math.round((fat / total) * 100);

  return (
    <>
      <div className="macro-container">
        
        {/* Protein Row */}
        <div className="macro-row">
          <div className="macro-info">
            <span className="macro-label">Protein</span>
            <span className="macro-grams">{protein}g</span>
          </div>
          <div className="macro-bar-container">
            {/* The width of the bar is dynamically driven by the percentage we calculated above! */}
            <div className="macro-bar-fill protein-fill" style={{ width: `${proteinPct}%` }}></div>
          </div>
          <span className="macro-pct">{proteinPct}%</span>
        </div>

        {/* Carbs Row */}
        <div className="macro-row">
          <div className="macro-info">
            <span className="macro-label">Carbs</span>
            <span className="macro-grams">{carbs}g</span>
          </div>
          <div className="macro-bar-container">
            <div className="macro-bar-fill carbs-fill" style={{ width: `${carbsPct}%` }}></div>
          </div>
          <span className="macro-pct">{carbsPct}%</span>
        </div>

        {/* Fat Row */}
        <div className="macro-row">
          <div className="macro-info">
            <span className="macro-label">Fat</span>
            <span className="macro-grams">{fat}g</span>
          </div>
          <div className="macro-bar-container">
            <div className="macro-bar-fill fat-fill" style={{ width: `${fatPct}%` }}></div>
          </div>
          <span className="macro-pct">{fatPct}%</span>
        </div>

      </div>

      <style>{`
        .macro-empty {
          text-align: center;
          color: var(--text-secondary);
          padding: 1rem;
          font-weight: 500;
        }

        .macro-container {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .macro-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .macro-info {
          width: 70px;
          display: flex;
          flex-direction: column;
        }

        .macro-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .macro-grams {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* The dark track that the colored bar sits inside */
        .macro-bar-container {
          flex: 1; /* This tells the bar to stretch and fill all available middle space */
          background: var(--bg-primary);
          border-radius: 4px;
          height: 8px;
          overflow: hidden;
        }

        /* The actual colored bar */
        .macro-bar-fill {
          height: 100%;
          border-radius: 4px;
          /* This creates a beautiful, smooth sliding animation when the data loads */
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .protein-fill { background: var(--accent-blue); }
        .carbs-fill { background: var(--accent-orange); }
        .fat-fill { background: var(--accent-amber); }

        .macro-pct {
          width: 40px;
          text-align: right;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
      `}</style>
    </>
  );
}
