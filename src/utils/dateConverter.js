import NepaliDate from 'nepali-date-converter';

/**
 * Convert BS (Bikram Sambat) date string to AD (Anno Domini) Date object
 * Input format: YYYY-MM-DD (BS)
 */
export const convertBSToAD = (bsDateString) => {
  if (!bsDateString) return null;
  const [year, month, day] = bsDateString.split('-').map(Number);
  try {
    // Month - 1 because NepaliDate lib is 0-indexed (Baishakh = 0)
    const nepaliDate = new NepaliDate(year, month - 1, day);
    return nepaliDate.toJsDate();
  } catch (error) {
    console.error('Error converting BS to AD:', error);
    return null;
  }
};

/**
 * Convert AD (JavaScript Date) to BS (Bikram Sambat) string
 */
export const convertADToBS = (adDate) => {
  if (!adDate) return null;
  try {
    const dateObj = typeof adDate === 'string' ? new Date(adDate) : adDate;
    const nepaliDate = new NepaliDate(dateObj);
    const year = nepaliDate.getYear();
    const month = String(nepaliDate.getMonth() + 1).padStart(2, '0');
    const day = String(nepaliDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting AD to BS:', error);
    return null;
  }
};

/**
 * Corrected formatBSDate with all 12 Nepali months
 */
export const formatBSDate = (bsDateString) => {
  if (!bsDateString) return '';
  
  const nepaliMonths = [
    'Baishakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashoj',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  const [year, month, day] = bsDateString.split('-').map(Number);
  if (month < 1 || month > 12) return bsDateString;
  
  return `${day} ${nepaliMonths[month - 1]}, ${year} BS`;
};

export const formatADDate = (adDate) => {
  if (!adDate) return '';
  const date = typeof adDate === 'string' ? new Date(adDate) : adDate;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' AD';
};

export const getTodayInBothFormats = () => {
  const today = new Date();
  const todayBS = convertADToBS(today);
  return {
    bs: todayBS,
    ad: today,
    bsFormatted: formatBSDate(todayBS),
    adFormatted: formatADDate(today)
  };
};

export const displayBSDate = (adDate) => {
  if (!adDate) return '';
  const date = typeof adDate === 'string' ? new Date(adDate) : adDate;
  const bsDate = convertADToBS(date);
  return formatBSDate(bsDate);
};