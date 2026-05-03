import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, AlertCircle, CheckCircle, Search, Trash2, TrendingUp, TrendingDown, DollarSign, Hash } from 'lucide-react';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';
import { convertADToBS } from '../utils/dateConverter';
import { displayBSDate } from '../utils/dateConverter';
import TodayDate from '../components/TodayDate';
import '../styles/Dashboard.css';
import QuickPay from '../components/QuickPay';

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


  // Month selector state
  const [selectedMonth, setSelectedMonth] = useState(''); // format: 'YYYY-MM'

  // Get all months available in data (BS)
  const allMonths = useMemo(() => {
    const monthsSet = new Set();
    users.forEach(user => {
      if (!user.payments || !Array.isArray(user.payments)) return;
      user.payments.forEach(payment => {
        const dateObj = new Date(payment.date);
        const bs = convertADToBS(dateObj); // 'YYYY-MM-DD'
        if (bs) {
          const [year, month] = bs.split('-');
          monthsSet.add(`${year}-${month}`);
        }
      });
    });
    // Sort descending
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [users]);

      // Calculate summary for selected month or global if none
  const summary = useMemo(() => {
    if (!selectedMonth) {
      // Global
      let totalExpected = 0;
      let totalCollected = 0;
      let totalAdvance = 0;
      users.forEach(user => {
        const stats = calculateFinance(user);
        totalExpected += stats.expectedTotal;
        totalCollected += stats.paidTotal;
        totalAdvance += stats.advanceBalance;
      });
      const outstanding = totalExpected - totalCollected;
      return { totalExpected, totalCollected, totalAdvance, outstanding };
    } else {
      // Monthly
      let totalExpected = 0;
      let totalCollected = 0;
      let totalAdvance = 0;
      const [bsYear, bsMonth] = selectedMonth.split('-').map(Number);
      users.forEach(user => {
        // Expected
        const start = new Date(user.startDateAD || user.startDate);
        if (start.getFullYear() < bsYear || (start.getFullYear() === bsYear && start.getMonth() + 1 <= bsMonth)) {
          totalExpected += user.amountPerCycle;
        }
        // Collected & Advance
        if (user.payments) {
          user.payments.forEach(payment => {
            const bsPaymentDate = convertADToBS(new Date(payment.date));
            if (bsPaymentDate && bsPaymentDate.startsWith(selectedMonth)) {
              totalCollected += payment.amount;
              if (payment.isAdvance) {
                totalAdvance += payment.amount;
              }
            }
          });
        }
      });
      const outstanding = totalExpected - totalCollected;
      return { totalExpected, totalCollected, totalAdvance, outstanding };
    }
  }, [users, selectedMonth]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    // { 'YYYY-MM': { expected, collected, outstanding } }
    const summary = {};
    users.forEach(user => {
      if (!user.payments || !Array.isArray(user.payments)) return;
      user.payments.forEach(payment => {
        // payment.date should be AD date string
        const dateObj = new Date(payment.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        if (!summary[key]) {
          summary[key] = { expected: 0, collected: 0 };
        }
        summary[key].collected += payment.amount;
      });
      // For expected, add user's amountPerCycle for each month since startDate
      const start = new Date(user.startDateAD || user.startDate);
      const now = new Date();
      let y = start.getFullYear();
      let m = start.getMonth();
      const endY = now.getFullYear();
      const endM = now.getMonth();
      while (y < endY || (y === endY && m <= endM)) {
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        if (!summary[key]) summary[key] = { expected: 0, collected: 0 };
        summary[key].expected += user.amountPerCycle;
        m++;
        if (m > 11) { m = 0; y++; }
      }
    });
    // Compute outstanding
    Object.keys(summary).forEach(key => {
      summary[key].outstanding = summary[key].expected - summary[key].collected;
    });
    // Sort keys descending (latest month first)
    const sorted = Object.keys(summary).sort((a, b) => b.localeCompare(a));
    return sorted.map(key => ({ month: key, ...summary[key] }));
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

      <TodayDate />
        {(
          <QuickPay 
            users={users} 
            onPaymentDone={() => navigate(0)} // Simplest way to refresh all state
          />
        )}

        {/* Global Summary Header */}
        <div className="global-summary"></div>
        
      {/* Month Selector */}
      <div className="month-selector-bar">
        <label htmlFor="month-selector">Select Month (BS): </label>
        <select
          id="month-selector"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="bs-month-selector"
        >
          <option value="">All (Global)</option>
          {allMonths.map(month => {
            const [year, m] = month.split('-');
            const nepaliMonths = [
              'Baishakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashoj',
              'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
            ];
            const monthName = nepaliMonths[parseInt(m, 10) - 1] || m;
            return (
              <option key={month} value={month}>{monthName} {year}</option>
            );
          })}
        </select>
      </div>

      {/* Summary Header (dynamic) */}
      <div className="global-summary">
        <div className="summary-card expected">
          <TrendingUp size={24} />
          <div className="summary-content">
            <span className="summary-label">Total Expected</span>
            <span className="summary-value">₹{summary.totalExpected.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card collected">
          <DollarSign size={24} />
          <div className="summary-content">
            <span className="summary-label">Total Collected</span>
            <span className="summary-value">₹{summary.totalCollected.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card advance">
          <TrendingUp size={24} />
          <div className="summary-content">
            <span className="summary-label">Total Advance</span>
            <span className="summary-value">₹{summary.totalAdvance.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card outstanding">
          <TrendingDown size={24} />
          <div className="summary-content">
            <span className="summary-label">Outstanding</span>
            <span className="summary-value">₹{summary.outstanding.toLocaleString()}</span>
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
                    <span className="detail-item account-id">
                      <Hash size={14} /> {user.accountNo || 'No A/C'}
                    </span>
                    <span className="detail-item">
                      <Calendar size={16} /> {user.planType}
                    </span>
                    {/* Removed monthly salary/amount per cycle */}
                    <span className="detail-item">
                      <Calendar size={16} /> {displayBSDate(user.startDateAD || user.startDate)}
                    </span>
                  </div>
                </div>

                <div className="user-card-right">
<div className={`due-amount ${isPaid ? 'settled' : 'due'}`}>
                    {isPaid ? 'Settled' : `Due: ₹${stats.dueAmount}`}
                  </div>
                  {stats.advanceBalance > 0 && (
                    <div className="advance-badge">
                      Advance: ₹{stats.advanceBalance}
                    </div>
                  )}
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
