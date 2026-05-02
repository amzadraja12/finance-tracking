import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wallet, Calendar, AlertCircle, CheckCircle, PlusCircle, Trash2, X, Save, Hash } from 'lucide-react';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';
import { displayBSDate, convertBSToAD } from '../utils/dateConverter';
import BSDatePicker from '../components/BSDatePicker';
import '../styles/UserDetails.css';

const UserDetails = ({ refreshKey, isAdmin = false }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: '',
    note: '',
    isAdvance: false
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

const handleAmountChange = (value) => {
    setPaymentForm(prev => ({ ...prev, amount: value }));
    
    // Auto-check advance if amount > expected total
    const numValue = Number(value);
    if (stats && numValue > stats.expectedTotal && numValue > 0) {
      setPaymentForm(prev => ({ ...prev, isAdvance: true }));
    } else if (stats && numValue <= stats.expectedTotal) {
      setPaymentForm(prev => ({ ...prev, isAdvance: false }));
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.date) return alert('Please fill all required fields');

    try {
      // Convert BS date to AD for database storage
      const adDate = convertBSToAD(paymentForm.date);
      if (!adDate) return alert('Invalid date. Please enter a valid BS date.');

      const note = paymentForm.isAdvance ? 'Advance Payment' : (paymentForm.note || 'Payment');
      
      await storage.addPayment(userId, {
        amount: Number(paymentForm.amount),
        date: adDate.toISOString().split('T')[0],
        note: note,
        isAdvance: paymentForm.isAdvance
      });
      
      // Refresh user data
      const updatedUser = await storage.getUser(userId);
      setUser(updatedUser);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        date: '',
        note: '',
        isAdvance: false
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
          
          <div className="account-info">
            <span className="account-id-large">
              <Hash size={18} /> {user.accountNo || 'No Account Number'}
            </span>
          </div>
        <div className="user-meta">
            <span className="meta-item">
              <Calendar size={16} /> Started: {displayBSDate(user.startDate)}
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
          {stats.advanceBalance > 0 && (
            <div className="stat-item">
              <span className="stat-label">Advance</span>
              <span className="stat-value advance">₹{stats.advanceBalance.toLocaleString()}</span>
            </div>
          )}
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
                  <td>{displayBSDate(payment.date)}</td>
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
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                />
                {stats && Number(paymentForm.amount) > stats.expectedTotal && Number(paymentForm.amount) > 0 && (
                  <span className="auto-advance-notice">Auto: Advance payment</span>
                )}
              </div>

              <div className="form-group">
                <BSDatePicker 
                  label="Date (बि.स.)"
                  value={paymentForm.date}
                  onChange={(date) => setPaymentForm({...paymentForm, date})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={paymentForm.isAdvance}
                    onChange={(e) => setPaymentForm({...paymentForm, isAdvance: e.target.checked})}
                  />
                  <span>Mark as Advance Payment</span>
                </label>
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
