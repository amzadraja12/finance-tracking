import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Calendar, AlertCircle, CheckCircle, Search, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';
import '../styles/Dashboard.css';

const Dashboard = ({ onAddClick, refreshKey, isAdmin = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const usersData = await storage.getUsers();
      setUsers(usersData || []);
      setLoading(false);
    };

    fetchUsers();
  }, [refreshKey]);

  // Calculate global summary
  const globalSummary = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    
    users.forEach(user => {
      const stats = calculateFinance(user);
      totalExpected += stats.expectedTotal;
      totalCollected += stats.paidTotal;
    });

    return {
      totalExpected,
      totalCollected,
      outstanding: totalExpected - totalCollected
    };
  }, [users]);

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const stats = calculateFinance(user);
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'due' && stats.dueAmount > 0) ||
        (statusFilter === 'paid' && stats.dueAmount <= 0);
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const handleCardClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleDeleteUser = async (e, userId, userName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await storage.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error(error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  return (
<div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">💰 Finance Tracker</h1>
        {isAdmin && (
          <button onClick={onAddClick} className="btn-add-user">
            <PlusCircle size={20} className="btn-icon" /> 
            <span className="btn-text">Add User</span>
          </button>
        )}
      </header>

      {/* Global Summary Header */}
      <div className="global-summary">
        <div className="summary-card expected">
          <TrendingUp size={24} />
          <div className="summary-content">
            <span className="summary-label">Total Expected</span>
            <span className="summary-value">₹{globalSummary.totalExpected.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card collected">
          <DollarSign size={24} />
          <div className="summary-content">
            <span className="summary-label">Total Collected</span>
            <span className="summary-value">₹{globalSummary.totalCollected.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card outstanding">
          <TrendingDown size={24} />
          <div className="summary-content">
            <span className="summary-label">Outstanding</span>
            <span className="summary-value">₹{globalSummary.outstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'due' ? 'active' : ''}`}
            onClick={() => setStatusFilter('due')}
          >
            Due
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paid')}
          >
            Paid
          </button>
        </div>
      </div>

      <div className="users-grid">
        {loading ? (
          <p className="empty-state">Loading users…</p>
        ) : filteredUsers.length === 0 ? (
          <p className="empty-state">
            {searchTerm || statusFilter !== 'all' 
              ? 'No users match your search/filter.' 
              : 'No users found. Add your first investment!'}
          </p>
        ) : (
          filteredUsers.map(user => {
            const stats = calculateFinance(user);
            const isPaid = stats.dueAmount <= 0;
            
            return (
              <div 
                key={user.id} 
                className={`user-card ${isPaid ? 'paid-status' : 'due-status'}`}
                onClick={() => handleCardClick(user.id)}
              >
{isAdmin && (
                  <button 
                    className="delete-btn"
                    onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="user-card-left">
                  <h3 className="user-name">{user.name}</h3>
<div className="user-details">
                    <span className="detail-item">
                      <Calendar size={16} /> {user.planType}
                    </span>
                    <span className="detail-item">
                      <Wallet size={16} /> ₹{user.amountPerCycle} / cycle
                    </span>
                    <span className="detail-item">
                      <Calendar size={16} /> {stats.periodsPassed + 1} {stats.periodLabel}
                    </span>
                  </div>
                </div>

                <div className="user-card-right">
                  <div className={`due-amount ${isPaid ? 'settled' : 'due'}`}>
                    {isPaid ? 'Settled' : `Due: ₹${stats.dueAmount}`}
                  </div>
                  <div className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>
                    {isPaid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {isPaid ? 'Paid' : 'Due'}
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
