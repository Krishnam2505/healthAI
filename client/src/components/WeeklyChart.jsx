import React from 'react';
// 1. Import all the necessary tools from Chart.js for a Bar Chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// 2. Register them so the browser knows how to draw them
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklyChart({ labels = [], caloriesData = [], workoutMinutesData = [] }) {
  // 3. Edge Case Handling (Empty State)
  // We calculate the total sum of all calories and workouts. 
  // If they are both exactly 0, it means the user hasn't logged anything all week.
  const sumCalories = caloriesData.reduce((a, b) => a + (b || 0), 0);
  const sumWorkouts = workoutMinutesData.reduce((a, b) => a + (b || 0), 0);
  const isEmpty = sumCalories === 0 && sumWorkouts === 0;

  // 4. Configure the Chart Data
  const data = {
    labels: labels, // The 7 days (e.g. "Mon", "Tue")
    datasets: [
      {
        label: 'Calories',
        data: caloriesData,
        backgroundColor: '#22c55e', // Bright Green
        borderRadius: 4, // Slightly round the top corners of the bars
      },
      {
        label: 'Workout (min)',
        data: workoutMinutesData,
        backgroundColor: '#3b82f6', // Bright Blue
        borderRadius: 4,
      },
    ],
  };

  // 5. Configure the Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to stretch and fill its container
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#71717a' } // Match our new light theme var(--text-secondary)
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Force the graph to start at 0, not at their lowest value
        grid: { color: '#e4e4e7' }, // Match our new light theme var(--border)
        ticks: { color: '#71717a' }
      },
      x: {
        grid: { display: false }, // Hide the vertical grid lines for a cleaner look
        ticks: { color: '#71717a' }
      },
    },
  };

  return (
    <>
      <div className="chart-container">
        {/* If there is no data, render a beautiful message directly on top of the empty chart */}
        {isEmpty && (
          <div className="empty-state-overlay">
            No data yet — log workouts and meals to see trends
          </div>
        )}
        
        {/* We fade the actual chart down to 30% opacity if it is empty so the text pops out! */}
        <div className="chart-wrapper" style={{ opacity: isEmpty ? 0.3 : 1 }}>
           <Bar data={data} options={options} />
        </div>
      </div>

      <style>{`
        .chart-container {
          position: relative;
          width: 100%;
          height: 300px; /* Force a fixed height so the chart doesn't collapse */
        }

        .chart-wrapper {
          width: 100%;
          height: 100%;
          transition: opacity 0.3s ease;
        }

        .empty-state-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          color: var(--text-secondary);
          font-weight: 500;
          text-align: center;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.9); /* A slightly transparent white background for the light theme */
          border-radius: 8px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
      `}</style>
    </>
  );
}
