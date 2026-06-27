import React, { useState } from 'react';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

export default function Log() {
  const [activeTab, setActiveTab] = useState('workout'); 
  const { toastProps, showToast } = useToast();
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // ---------------------------------------------------------
  // 1. WORKOUT FORM STATE
  // ---------------------------------------------------------
  const [workoutData, setWorkoutData] = useState({ type: '', duration: '', caloriesBurned: '', notes: '', date: getTodayStr() });
  const [workoutLoading, setWorkoutLoading] = useState(false);

  const handleWorkoutSubmit = async () => {
    if (!workoutData.type || !workoutData.duration) {
      showToast('Workout Type and Duration are required', 'error');
      return;
    }
    setWorkoutLoading(true);
    try {
      await api.post('/workouts', {
        type: workoutData.type,
        duration: Number(workoutData.duration),
        caloriesBurned: workoutData.caloriesBurned ? Number(workoutData.caloriesBurned) : undefined,
        notes: workoutData.notes,
        date: workoutData.date
      });
      showToast('✅ Workout logged successfully!', 'success');
      setWorkoutData({ type: '', duration: '', caloriesBurned: '', notes: '', date: getTodayStr() });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log workout', 'error');
    } finally {
      setWorkoutLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2. MEAL FORM STATE
  // ---------------------------------------------------------
  const [mealData, setMealData] = useState({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fat: '', date: getTodayStr() });
  const [mealLoading, setMealLoading] = useState(false);

  const handleMealSubmit = async () => {
    if (!mealData.name || !mealData.calories) {
      showToast('Food Name and Calories are required', 'error');
      return;
    }
    setMealLoading(true);
    try {
      await api.post('/meals', {
        name: mealData.name,
        mealType: mealData.mealType,
        calories: Number(mealData.calories),
        protein: mealData.protein ? Number(mealData.protein) : undefined,
        carbs: mealData.carbs ? Number(mealData.carbs) : undefined,
        fat: mealData.fat ? Number(mealData.fat) : undefined,
        date: mealData.date
      });
      showToast('✅ Meal logged successfully!', 'success');
      setMealData({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fat: '', date: getTodayStr() });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log meal', 'error');
    } finally {
      setMealLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 3. SLEEP FORM STATE
  // ---------------------------------------------------------
  const [sleepData, setSleepData] = useState({ hours: '', quality: 3, date: getTodayStr() });
  const [sleepLoading, setSleepLoading] = useState(false);

  const getSleepQualityLabel = (val) => {
    const labels = { 1: 'Poor 😫', 2: 'Fair 🥱', 3: 'Good 😌', 4: 'Very Good 😃', 5: 'Excellent 🤩' };
    return labels[val] || 'Good 😌';
  };

  const handleSleepSubmit = async () => {
    if (!sleepData.hours) {
      showToast('Hours slept is required', 'error');
      return;
    }
    setSleepLoading(true);
    try {
      await api.post('/sleep', {
        hours: Number(sleepData.hours),
        quality: Number(sleepData.quality),
        date: sleepData.date
      });
      showToast('✅ Sleep logged successfully!', 'success');
      setSleepData({ hours: '', quality: 3, date: getTodayStr() });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log sleep', 'error');
    } finally {
      setSleepLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 4. WATER FORM STATE
  // ---------------------------------------------------------
  const [waterData, setWaterData] = useState({ liters: '', date: getTodayStr() });
  const [waterLoading, setWaterLoading] = useState(false);

  const handleWaterSubmit = async () => {
    if (!waterData.liters) {
      showToast('Amount is required', 'error');
      return;
    }
    setWaterLoading(true);
    try {
      await api.post('/water', {
        liters: Number(waterData.liters),
        date: waterData.date
      });
      showToast('✅ Water logged successfully!', 'success');
      setWaterData({ liters: '', date: getTodayStr() });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log water', 'error');
    } finally {
      setWaterLoading(false);
    }
  };

  const handleQuickAddWater = (amount) => {
    const current = parseFloat(waterData.liters || '0');
    // Using parseFloat to avoid floating point math weirdness (e.g. 0.1 + 0.2 = 0.300000004)
    setWaterData({ ...waterData, liters: parseFloat((current + amount).toFixed(2)) });
  };


  return (
    <>
      <div className="log-page">
        <div className="log-container">
          <h1 className="page-heading">Log Your Activity</h1>
          
          {/* TABS */}
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>
              💪 Workout
            </button>
            <button className={`tab-btn ${activeTab === 'meal' ? 'active' : ''}`} onClick={() => setActiveTab('meal')}>
              🍽️ Meal
            </button>
            <button className={`tab-btn ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => setActiveTab('sleep')}>
              😴 Sleep
            </button>
            <button className={`tab-btn ${activeTab === 'water' ? 'active' : ''}`} onClick={() => setActiveTab('water')}>
              💧 Water
            </button>
          </div>

          <div className="card form-card">
            
            {/* ----------------- WORKOUT TAB ----------------- */}
            {activeTab === 'workout' && (
              <div className="form-content">
                <h2>Log a Workout</h2>
                
                <div className="input-group">
                  <label>Workout Type</label>
                  <input type="text" placeholder="e.g. Running, Gym, Cycling" value={workoutData.type} onChange={(e) => setWorkoutData({...workoutData, type: e.target.value})} />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Duration (minutes)</label>
                    <input type="number" min="1" value={workoutData.duration} onChange={(e) => setWorkoutData({...workoutData, duration: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Calories Burned (optional)</label>
                    <input type="number" min="1" value={workoutData.caloriesBurned} onChange={(e) => setWorkoutData({...workoutData, caloriesBurned: e.target.value})} />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Date</label>
                    <input type="date" value={workoutData.date} onChange={(e) => setWorkoutData({...workoutData, date: e.target.value})} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Notes (optional)</label>
                  <textarea rows="3" value={workoutData.notes} onChange={(e) => setWorkoutData({...workoutData, notes: e.target.value})} />
                </div>

                <button className="btn-primary submit-btn" onClick={handleWorkoutSubmit} disabled={workoutLoading}>
                  {workoutLoading ? 'Saving...' : 'Save Workout'}
                </button>
              </div>
            )}

            {/* ----------------- MEAL TAB ----------------- */}
            {activeTab === 'meal' && (
              <div className="form-content">
                <h2>Log a Meal</h2>
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Food Name</label>
                    <input type="text" placeholder="e.g. Chicken Salad" value={mealData.name} onChange={(e) => setMealData({...mealData, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Meal Type</label>
                    <select value={mealData.mealType} onChange={(e) => setMealData({...mealData, mealType: e.target.value})}>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Calories</label>
                  <input type="number" min="0" value={mealData.calories} onChange={(e) => setMealData({...mealData, calories: e.target.value})} />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Protein (g)</label>
                    <input type="number" min="0" value={mealData.protein} onChange={(e) => setMealData({...mealData, protein: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Carbs (g)</label>
                    <input type="number" min="0" value={mealData.carbs} onChange={(e) => setMealData({...mealData, carbs: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Fat (g)</label>
                    <input type="number" min="0" value={mealData.fat} onChange={(e) => setMealData({...mealData, fat: e.target.value})} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={mealData.date} onChange={(e) => setMealData({...mealData, date: e.target.value})} />
                </div>

                <button className="btn-primary submit-btn" onClick={handleMealSubmit} disabled={mealLoading}>
                  {mealLoading ? 'Saving...' : 'Save Meal'}
                </button>
              </div>
            )}

            {/* ----------------- SLEEP TAB ----------------- */}
            {activeTab === 'sleep' && (
              <div className="form-content">
                <h2>Log Sleep</h2>
                
                <div className="input-group">
                  <label>Hours Slept</label>
                  <input type="number" step="0.5" min="0" max="24" placeholder="e.g. 7.5" value={sleepData.hours} onChange={(e) => setSleepData({...sleepData, hours: e.target.value})} />
                </div>

                <div className="input-group">
                  <label>Sleep Quality: <span className="quality-label">{getSleepQualityLabel(sleepData.quality)}</span></label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={sleepData.quality} 
                    onChange={(e) => setSleepData({...sleepData, quality: e.target.value})}
                    className="range-slider"
                  />
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={sleepData.date} onChange={(e) => setSleepData({...sleepData, date: e.target.value})} />
                </div>

                <button className="btn-primary submit-btn" onClick={handleSleepSubmit} disabled={sleepLoading}>
                  {sleepLoading ? 'Saving...' : 'Save Sleep'}
                </button>
              </div>
            )}

            {/* ----------------- WATER TAB ----------------- */}
            {activeTab === 'water' && (
              <div className="form-content">
                <h2>Log Water</h2>
                
                <div className="input-group">
                  <label>Amount (Liters)</label>
                  <input type="number" step="0.1" min="0" placeholder="e.g. 1.5" value={waterData.liters} onChange={(e) => setWaterData({...waterData, liters: e.target.value})} />
                </div>

                {/* Quick Add Buttons for great UX */}
                <div className="quick-add-row">
                  <button className="btn-secondary quick-add-btn" onClick={() => handleQuickAddWater(0.25)}>+ 0.25L</button>
                  <button className="btn-secondary quick-add-btn" onClick={() => handleQuickAddWater(0.5)}>+ 0.5L</button>
                  <button className="btn-secondary quick-add-btn" onClick={() => handleQuickAddWater(1.0)}>+ 1L</button>
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={waterData.date} onChange={(e) => setWaterData({...waterData, date: e.target.value})} />
                </div>

                <button className="btn-primary submit-btn" onClick={handleWaterSubmit} disabled={waterLoading}>
                  {waterLoading ? 'Saving...' : 'Save Water'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <Toast {...toastProps} />

      <style>{`
        /* Most of the CSS is perfectly reusable from Chunk 8.5! */
        .log-page { padding: 2rem 1rem; }
        .log-container { max-width: 600px; margin: 0 auto; }
        .page-heading { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1.5rem; text-align: center; }
        
        .tab-bar { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); margin-bottom: 2rem; overflow-x: auto; }
        .tab-btn { flex: 1; background: transparent; border: none; padding: 1rem 0.5rem; font-size: 1rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: var(--accent-green); border-bottom: 2px solid var(--accent-green); }
        
        .form-card { padding: 2rem; }
        .form-content { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-content h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
        
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .input-row { display: flex; gap: 1.5rem; }
        @media (max-width: 480px) { .input-row { flex-direction: column; gap: 1.5rem; } }
        
        .input-group label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
        .input-group input, .input-group select, .input-group textarea { width: 100%; background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; font-family: inherit; }
        .input-group input:focus, .input-group select:focus, .input-group textarea:focus { outline: none; border-color: var(--accent-green); }
        
        .submit-btn { width: 100%; padding: 0.8rem; font-size: 1.1rem; margin-top: 0.5rem; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Specific to Sleep Tab */
        .quality-label {
          color: var(--accent-green);
          font-weight: 800;
          margin-left: 0.5rem;
        }

        .range-slider {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }

        /* Specific to Water Tab */
        .quick-add-row {
          display: flex;
          gap: 1rem;
        }
        
        .quick-add-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
