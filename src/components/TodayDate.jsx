import { useEffect, useState } from 'react';
import { getTodayInBothFormats } from '../utils/dateConverter';
import '../styles/TodayDate.css';

const TodayDate = () => {
  const [dateInfo, setDateInfo] = useState(null);

  useEffect(() => {
    const updateDate = () => {
      setDateInfo(getTodayInBothFormats());
    };
    
    updateDate();
    
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(updateDate, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  if (!dateInfo) return null;

  return (
    <div className="today-date-banner">
      <div className="date-container">
        <span className="date-label">आज (Today):</span>
        <span className="date-value nepali">{dateInfo.bsFormatted}</span>
      </div>
    </div>
  );
};

export default TodayDate;
