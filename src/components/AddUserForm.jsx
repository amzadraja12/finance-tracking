import { useState} from 'react';
import { X, Save } from 'lucide-react';
import { storage } from '../utils/storage';
import '../styles/AddUserForm.css';

const AddUserForm = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    planType: 'monthly',
    amountPerCycle: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amountPerCycle) return alert("Please fill all fields");

    const newUser = {
      ...formData,
      amountPerCycle: Number(formData.amountPerCycle),
    };

    try {
      await storage.saveUser(newUser);
      onUserAdded();
      onClose();
    } catch (error) {
      alert('Unable to save user. Check Firebase configuration and console for details.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Plan Type</label>
            <select 
              value={formData.planType}
              onChange={(e) => setFormData({...formData, planType: e.target.value})}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount per Cycle (₹)</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={formData.amountPerCycle}
              onChange={(e) => setFormData({...formData, amountPerCycle: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            <Save size={18} /> Save User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;