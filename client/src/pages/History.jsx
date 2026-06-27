import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workout');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // For sleep, water, and cycle, the backend routes are singular. 
      // For workout and meal, they are plural.
      const endpoint = ['sleep', 'water', 'cycle'].includes(activeTab) ? activeTab : `${activeTab}s`;
      const response = await api.get(`/${endpoint}`);
      setItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${activeTab} history`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    
    try {
      const endpoint = ['sleep', 'water', 'cycle'].includes(activeTab) ? activeTab : `${activeTab}s`;
      await api.delete(`/${endpoint}/${id}`);
      // Remove from UI immediately
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert("Failed to delete log");
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditItem(null);
  };

  const handleEditChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = ['sleep', 'water', 'cycle'].includes(activeTab) ? activeTab : `${activeTab}s`;
      const response = await api.put(`/${endpoint}/${editItem._id}`, editItem);
      
      // Update the item in the UI list
      setItems(items.map(item => item._id === editItem._id ? response.data : item));
      closeEditModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update log");
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 className="page-heading" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>My History</h1>

        {/* --- TAB BAR --- */}
        <div className="tab-bar">
          {['workout', 'meal', 'sleep', 'water', ...(user?.gender === 'female' ? ['cycle'] : [])].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* --- ERROR & LOADING --- */}
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading history...
          </div>
        ) : (
          /* --- LIST RENDER --- */
          <div className="history-list">
            {items.length === 0 && !loading && !error && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No {activeTab} logs found.
              </div>
            )}
            
            {items.map(item => (
              <div key={item._id} className="history-card">
                <div className="history-info">
                  <div className="history-date">
                    {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  
                  {activeTab === 'workout' && (
                    <>
                      <div className="history-title">{item.type}</div>
                      <div className="history-details">{item.duration} mins • {item.caloriesBurned} kcal burned</div>
                      {item.notes && <div className="history-notes">{item.notes}</div>}
                    </>
                  )}
                  
                  {activeTab === 'meal' && (
                    <>
                      <div className="history-title">{item.name} ({item.mealType})</div>
                      <div className="history-details">{item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F</div>
                    </>
                  )}
                  
                  {activeTab === 'sleep' && (
                    <>
                      <div className="history-title">{item.hours} hours</div>
                      <div className="history-details">Quality: {item.quality}</div>
                    </>
                  )}
                  
                  {activeTab === 'water' && (
                    <>
                      <div className="history-title">{item.liters} Liters</div>
                    </>
                  )}

                  {activeTab === 'cycle' && (
                    <>
                      <div className="history-title">Cycle Log</div>
                      <div className="history-details">Flow: {item.flowIntensity} • Cramps: {item.cramps} • Mood: {item.mood}</div>
                    </>
                  )}
                </div>
                
                <div className="history-actions">
                  <button className="btn-secondary btn-sm" onClick={() => openEditModal(item)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && editItem && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h2 className="page-heading" style={{marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'left'}}>Edit {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <form onSubmit={submitEdit} className="form-content">
              
              {activeTab === 'workout' && (
                <>
                  <div className="input-group">
                    <label>Type</label>
                    <input type="text" name="type" value={editItem.type || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Duration (mins)</label>
                      <input type="number" name="duration" value={editItem.duration || ''} onChange={handleEditChange} required />
                    </div>
                    <div className="input-group">
                      <label>Calories Burned</label>
                      <input type="number" name="caloriesBurned" value={editItem.caloriesBurned || ''} onChange={handleEditChange} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'meal' && (
                <>
                  <div className="input-group">
                    <label>Meal Name</label>
                    <input type="text" name="name" value={editItem.name || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Calories</label>
                      <input type="number" name="calories" value={editItem.calories || ''} onChange={handleEditChange} required />
                    </div>
                    <div className="input-group">
                      <label>Protein (g)</label>
                      <input type="number" name="protein" value={editItem.protein || ''} onChange={handleEditChange} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'sleep' && (
                <>
                  <div className="input-group">
                    <label>Hours Slept</label>
                    <input type="number" step="0.1" name="hours" value={editItem.hours || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="input-group">
                    <label>Quality</label>
                    <select name="quality" value={editItem.quality || 'Good'} onChange={handleEditChange}>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'water' && (
                <div className="input-group">
                  <label>Liters</label>
                  <input type="number" step="0.1" name="liters" value={editItem.liters || ''} onChange={handleEditChange} required />
                </div>
              )}

              {activeTab === 'cycle' && (
                <>
                  <div className="input-group">
                    <label>Flow Intensity</label>
                    <select name="flowIntensity" value={editItem.flowIntensity || 'None'} onChange={handleEditChange}>
                      <option value="None">None</option>
                      <option value="Spotting">Spotting</option>
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Cramps</label>
                    <select name="cramps" value={editItem.cramps || 'None'} onChange={handleEditChange}>
                      <option value="None">None</option>
                      <option value="Mild">Mild</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Mood</label>
                    <select name="mood" value={editItem.mood || 'None'} onChange={handleEditChange}>
                      <option value="None">None</option>
                      <option value="Happy">Happy</option>
                      <option value="Calm">Calm</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Tired">Tired</option>
                    </select>
                  </div>
                </>
              )}

              <div className="input-row" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-secondary submit-btn" onClick={closeEditModal} style={{flex: 1}}>Cancel</button>
                <button type="submit" className="btn-primary submit-btn" style={{flex: 1}}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .page-container { padding: 2rem 1rem; }
        .page-heading { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
        
        /* Tabs (Reused from Log page) */
        .tab-bar { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); margin-bottom: 2rem; overflow-x: auto; }
        .tab-btn { flex: 1; background: transparent; border: none; padding: 1rem 0.5rem; font-size: 1rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: var(--accent-green); border-bottom: 2px solid var(--accent-green); }

        /* Forms inside the modal (Reused from Log page) */
        .form-content { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .input-row { display: flex; gap: 1.5rem; }
        @media (max-width: 480px) { .input-row { flex-direction: column; gap: 1.5rem; } }
        
        .input-group label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
        .input-group input, .input-group select { width: 100%; background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; font-family: inherit; }
        .input-group input:focus, .input-group select:focus { outline: none; border-color: var(--accent-green); }
        .submit-btn { width: 100%; padding: 0.8rem; font-size: 1.1rem; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}
