import { differenceInDays, differenceInMonths, startOfDay } from 'date-fns';

export const calculateStatus = (user, payments = []) => {
  const today = startOfDay(new Date());
  const startDate = startOfDay(new Date(user.startDate));
  
  let periodsPassed = 0;

  if (user.planType === 'daily') {
    periodsPassed = differenceInDays(today, startDate);
  } else if (user.planType === 'monthly') {
    periodsPassed = differenceInMonths(today, startDate);
  }

  // We add 1 because usually, the first payment is due on Day 1
  const expectedTotal = (periodsPassed + 1) * user.amountPerCycle;
  const paidTotal = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const dueAmount = expectedTotal - paidTotal;

  return {
    expectedTotal,
    paidTotal,
    dueAmount,
    status: dueAmount <= 0 ? 'Paid' : 'Due'
  };
};

export const calculateFinance = (user) => {
  return calculateStatus(user, user.payments || []);
};