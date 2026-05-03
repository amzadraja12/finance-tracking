import { useState, useRef, useEffect } from 'react';
import { Search, Save, User as UserIcon, Loader2 } from 'lucide-react';
import { storage } from '../utils/storage';
import { calculateFinance } from '../utils/financeLogic';

const QuickPay = ({ users, onPaymentDone }) => {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [isAdvance, setIsAdvance] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// Calculate due amount for each user
const getUserDueAmount = (user) => {
  const stats = calculateFinance(user);
  return stats.dueAmount;
};

  const trimmedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter(u => 
    trimmedQuery && (
      u.name.toLowerCase().includes(trimmedQuery) || 
      (u.accountNo || '').toLowerCase().includes(trimmedQuery)
    )
  ).slice(0, 5).map(u => ({
    ...u,
    dueAmount: getUserDueAmount(u)
  }));

  const handleSelect = (user) => {
    setSelectedUser(user);
    setQuery(user.name);
    setIsDropdownOpen(false);
    setError('');
  };

const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
    
    if (selectedUser && value) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        const stats = calculateFinance(selectedUser);
        
        // Calculate what the user actually owes (expected - advance credit)
        const actualDue = stats.dueAmount > 0 ? stats.dueAmount : 0;
        
        // If payment > actual due amount, automatically mark as advance
        if (numValue > actualDue) {
          setIsAdvance(true);
        } else {
          setIsAdvance(false);
        }
      }
    }
  };

const handleInputChange = (e) => {
    const value = e.target.value;
    // Check for amount input
    if (e.target.name === 'amountField') {
      handleAmountChange(e);
    } else {
      setQuery(value);
      setIsDropdownOpen(true);
      if (!value) {
        setSelectedUser(null);
        setError('');
      }
    }
  };

  const validateAmount = (value) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive amount');
      return false;
    }
    setError('');
    return true;
  };

  const handleQuickSave = async () => {
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }
    if (!amount || !validateAmount(amount)) return;
    
    setLoading(true);
    setError('');

    try {
      const todayAd = new Date().toISOString().split('T')[0];
      const note = isAdvance ? 'Advance Payment' : 'Quick Pay Entry';
      
      await storage.addPayment(selectedUser.id, {
        amount: Number(amount),
        date: todayAd,
        note: note,
        isAdvance: isAdvance
      });
      
      // Show appropriate success message
      if (isAdvance) {
        alert(`Success! ₹${amount} added as advance for ${selectedUser.name}`);
      } else {
        alert(`Success! ₹${amount} added for ${selectedUser.name}`);
      }
      
      // Reset form
      setAmount('');
      setSelectedUser(null);
      setQuery('');
      setIsAdvance(false);
      onPaymentDone(); // Refresh dashboard data
    } catch (err) {
      console.error(err);
      setError('Failed to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-pay-container" ref={dropdownRef}>
      <div className="quick-pay-input-group">
        <div className="search-box">
          <Search size={18} className="icon" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Search Name or A/C for Quick Pay..." 
            value={query}
            onChange={handleInputChange}
            className="search-input-field"
            aria-label="Search user for quick pay"
            autoComplete="off"
          />
{isDropdownOpen && trimmedQuery && !selectedUser && (
            <div className="quick-results-dropdown" role="listbox">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <div 
                    key={u.id} 
                    className="result-item" 
                    onClick={() => handleSelect(u)}
                    role="option"
                  >
                    <UserIcon size={14} />
                    <span className="result-name">{u.name} ({u.accountNo})</span>
                    <span className={`result-due ${u.dueAmount > 0 ? 'due' : 'paid'}`}>
                      {u.dueAmount > 0 ? `Due: ₹${u.dueAmount}` : 'Settled'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="result-item no-results">
                  <span>No users found</span>
                </div>
              )}
            </div>
          )}
        </div>

<input 
          type="number" 
          name="amountField"
          className="amount-input"
          placeholder="₹ Amount" 
          value={amount}
          onChange={handleInputChange}
          disabled={!selectedUser || loading}
          aria-label="Payment amount"
        />

        <label className="advance-toggle">
          <input 
            type="checkbox" 
            checked={isAdvance}
            onChange={(e) => setIsAdvance(e.target.checked)}
            disabled={!selectedUser || loading}
          />
          <span>Advance</span>
        </label>

        <button 
          className="quick-save-btn" 
          onClick={handleQuickSave} 
          disabled={!selectedUser || !amount || loading}
          aria-label="Save payment"
        >
          {loading ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{loading ? 'Saving...' : isAdvance ? 'Advance' : 'Pay'}</span>
        </button>
      </div>
      
      {error && (
        <div className="quick-pay-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default QuickPay;
