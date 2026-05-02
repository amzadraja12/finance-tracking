import { useState, useRef, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import '../styles/BSDatePicker.css';

const BSDatePicker = ({ value, onChange, label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(() => {
    if (value) {
      const [year] = value.split('-');
      return parseInt(year);
    }
    return new NepaliDate().getYear();
  });
  const [displayMonth, setDisplayMonth] = useState(() => {
    if (value) {
      const [, month] = value.split('-');
      return parseInt(month);
    }
    return new NepaliDate().getMonth() + 1;
  });
  const pickerRef = useRef(null);

  const nepaliMonths = ['Baishakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashoj', 
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

  const getDaysInMonth = (year, month) => {
    // Standard BS month days (some can vary)
    const daysInMonth = [31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 29, 30];
    return daysInMonth[month - 1] || 30;
  };

  const handleDayClick = (day) => {
    const yearStr = String(displayYear);
    const monthStr = String(displayMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${yearStr}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const daysInCurrentMonth = getDaysInMonth(displayYear, displayMonth);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const displayText = value ? `${value}` : 'Select Date';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="bs-date-picker-container" ref={pickerRef}>
      {label && <label className="bs-date-label">{label}{required ? ' *' : ''}</label>}
      
      <button
        type="button"
        className="bs-date-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayText}
      </button>

      {isOpen && (
        <div className="bs-date-picker-popup">
          <div className="bs-calendar-header">
            <button
              type="button"
              className="nav-btn"
              onClick={handlePrevMonth}
            >
              ←
            </button>
            <div className="month-year-display">
              <span className="month-name">{nepaliMonths[displayMonth - 1]}</span>
              <span className="year-name">{displayYear}</span>
            </div>
            <button
              type="button"
              className="nav-btn"
              onClick={handleNextMonth}
            >
              →
            </button>
          </div>

          <div className="bs-calendar-days">
            <div className="weekday-header">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>
            <div className="days-grid">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${
                    value === `${displayYear}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSDatePicker;
