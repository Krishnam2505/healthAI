import React from 'react';
// 1. Import the necessary tools from Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 2. Register the specific elements we need for a Doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CalorieRing({ consumed = 0, target = 2000 }) {
  // Defensive check in case the backend sends undefined data
  const safeConsumed = consumed || 0;
  const safeTarget = target || 2000;

  // Check if they ate more calories than they were supposed to!
  const isOverTarget = safeConsumed > safeTarget;

  // 3. Configure the Chart Data
  // If they are under target, we show Green (eaten) and Grey (remaining).
  // If they are over target, we show Bright Red (target limit) and Dark Red (the extra calories they shouldn't have eaten).
  const data = {
    datasets: [
      {
        data: isOverTarget 
          ? [safeTarget, safeConsumed - safeTarget] 
          : [safeConsumed, safeTarget - safeConsumed],
        backgroundColor: isOverTarget 
          ? ['#ef4444', '#7f1d1d'] // Red & Dark Red
          : ['#22c55e', '#334155'], // Green & Muted Grey
        borderWidth: 0, // Remove the white borders between segments for a cleaner look
      },
    ],
  };

  // 4. Configure the Chart Options
  const options = {
    cutout: '72%', // This makes the inner hole massive, turning a "pie chart" into a thin "ring"
    plugins: {
      legend: { display: false }, // Hide the color labels
      tooltip: { enabled: false } // Disable hover popups for a cleaner UI
    },
    maintainAspectRatio: true,
  };

  return (
    <>
      <div className="calorie-ring-container">
        {/* The actual Chart.js Canvas */}
        <Doughnut data={data} options={options} />

        {/* The Absolute Centered Text Overlay */}
        <div className="ring-overlay">
          <div className="ring-consumed">{safeConsumed}</div>
          <div className="ring-target">/ {safeTarget} kcal</div>
          <div className="ring-label">CALORIES</div>
        </div>
      </div>

      <style>{`
        .calorie-ring-container {
          position: relative; /* This allows us to absolute position the text directly in the center */
          max-width: 220px;
          margin: 0 auto;
        }

        .ring-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%); /* Perfectly centers the div */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .ring-consumed {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .ring-target {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.2rem;
        }

        .ring-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>
    </>
  );
}
