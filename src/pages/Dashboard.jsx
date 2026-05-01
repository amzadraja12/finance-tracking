import { useState, useEffect } from 'react';
import { PlusCircle, Wallet, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';
import '../styles/Dashboard.css';

const Dashboard = ({ onAddClick, refreshKey }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const usersData = await storage.getUsers();
      setUsers(usersData || []);
      setLoading(false);
    };

    fetchUsers();
  }, [refreshKey]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">💰 Finance Tracker</h1>
        <button onClick={onAddClick} className="btn-add-user">
          <PlusCircle size={20} className="btn-icon" /> 
          <span className="btn-text">Add User</span>
        </button>
      </header>

      <div className="users-grid">
        {loading ? (
          <p className="empty-state">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No users found. Add your first investment!</p>
        ) : (
          users.map(user => {
            const stats = calculateFinance(user);
            return (
              <div key={user.id} className="user-card">
                <div className="user-card-left">
                  <h3 className="user-name">{user.name}</h3>
                  <div className="user-details">
                    <span className="detail-item">
                      <Calendar size={16} /> {user.planType}
                    </span>
                    <span className="detail-item">
                      <Wallet size={16} /> ₹{user.amountPerCycle} / cycle
                    </span>
                  </div>
                </div>

                <div className="user-card-right">
                  <div className={`due-amount ${stats.dueAmount > 0 ? 'due' : 'settled'}`}>
                    {stats.dueAmount > 0 ? `Due: ₹${stats.dueAmount}` : 'Settled'}
                  </div>
                  <div className={`status-badge ${stats.status === 'Due' ? 'pending' : 'paid'}`}>
                    {stats.status === 'Due' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    {stats.status}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;