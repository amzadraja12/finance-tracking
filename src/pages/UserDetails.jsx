import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wallet, Calendar, AlertCircle, CheckCircle, PlusCircle, Trash2, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';
import '../styles/UserDetails.css';

const UserDetails = ({ refreshKey, isAdmin = false }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await storage.getUser(userId);
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, [userId, refreshKey]);

  const stats = user ? calculateFinance(user) : null;
  const payments = user?.payments || [];

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.date) return alert('Please fill all required fields');

    try {
      await storage.addPayment(userId, {
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        note: paymentForm.note || ''
      });
      
      // Refresh user data
      const updatedUser = await storage.getUser(userId);
      setUser(updatedUser);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
} catch {
      alert('Failed to add payment. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await storage.deleteUser(userId);
        navigate('/');
      } catch (error) {
        console.error(error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="user-details-container">
        <div className="loading-state">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-container">
        <div className="error-state">User not found.</div>
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <div className="user-details-header">
<button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} /> Back
        </button>
        {isAdmin && (
          <button onClick={handleDeleteUser} className="delete-user-btn">
            <Trash2 size={18} /> Delete User
          </button>
        )}
      </div>

      {/* User Info Card */}
      <div className={`user-info-card ${stats.dueAmount <= 0 ? 'paid-status' : 'due-status'}`}>
        <div className="user-info-main">
          <h2 className="user-name">{user.name}</h2>
<div className="user-meta">
            <span className="meta-item">
              <Calendar size={16} /> Started: {format(new Date(user.startDate), 'dd MMM yyyy')}
            </span>
            <span className="meta-item">
              <Wallet size={16} /> ₹{user.amountPerCycle} / {user.planType}
            </span>
<span className="meta-item">
              <Calendar size={16} /> {stats.periodsPassed + 1} {stats.periodLabel} passed
            </span>
          </div>
        </div>
        
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">Expected</span>
            <span className="stat-value">₹{stats.expectedTotal.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Paid</span>
            <span className="stat-value success">₹{stats.paidTotal.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Due</span>
            <span className={`stat-value ${stats.dueAmount > 0 ? 'danger' : 'success'}`}>
              ₹{Math.abs(stats.dueAmount).toLocaleString()}
            </span>
          </div>
          <div className={`status-badge-large ${stats.status === 'Due' ? 'pending' : 'paid'}`}>
            {stats.status === 'Due' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {stats.status}
          </div>
        </div>
      </div>

      {/* Add Payment Button */}
      <div className="payment-actions">
        <button onClick={() => setShowPaymentModal(true)} className="add-payment-btn">
          <PlusCircle size={20} /> Add Payment
        </button>
      </div>

      {/* Payments History */}
      <div className="payments-section">
        <h3 className="section-title">Payment History</h3>
        {sortedPayments.length === 0 ? (
          <p className="no-payments">No payments recorded yet.</p>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{format(new Date(payment.date), 'dd MMM yyyy')}</td>
                  <td className="amount-cell">₹{payment.amount.toLocaleString()}</td>
                  <td className="note-cell">{payment.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="form-container">
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input 
                  type="date" 
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cash, Bank transfer..."
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                />
              </div>

              <button type="submit" className="btn-submit">
                <Save size={18} /> Save Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
