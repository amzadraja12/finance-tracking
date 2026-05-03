import { differenceInDays, differenceInMonths, startOfDay } from 'date-fns';

export const calculateStatus = (user, payments = []) => {
  const today = startOfDay(new Date());
  const startDate = startOfDay(new Date(user.startDateAD || user.startDate));
  
  let periodsPassed = 0;
  let periodLabel = '';

  if (user.planType === 'daily') {
    periodsPassed = differenceInDays(today, startDate);
    periodLabel = 'days';
  } else if (user.planType === 'monthly') {
    periodsPassed = differenceInMonths(today, startDate);
    periodLabel = 'months';
  } else if (user.planType === 'quarterly') {
    // Calculate months and divide by 3 to get quarters
    const monthsPassed = differenceInMonths(today, startDate);
    periodsPassed = Math.floor(monthsPassed / 3);
    periodLabel = 'quarters';
  }

  // We add 1 because usually, the first payment is due on Day 1
  const expectedTotal = (periodsPassed + 1) * user.amountPerCycle;
  const paidTotal = payments.reduce((acc, curr) => acc + curr.amount, 0);
  let dueAmount = expectedTotal - paidTotal;
  let computedAdvance = 0;
  if (paidTotal > expectedTotal) {
    computedAdvance = paidTotal - expectedTotal;
    dueAmount = 0;
  }

  return {
    expectedTotal,
    paidTotal,
    advanceBalance: computedAdvance,
    dueAmount,
    status: dueAmount <= 0 ? 'Paid' : 'Due',
    periodsPassed,
    periodLabel
  };
};

export const calculateFinance = (user) => {
  return calculateStatus(user, user.payments || [], user.advanceBalance || 0);
};
