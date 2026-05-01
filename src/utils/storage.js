import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc,
  arrayUnion,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';

const USERS_COLLECTION = 'users';

export const storage = {
  // Get all users from Firestore
  getUsers: async () => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const snapshot = await getDocs(usersRef);
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // Save a new user to Firestore
  saveUser: async (newUser) => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const docRef = await addDoc(usersRef, {
        ...newUser,
        payments: [],
        totalPaid: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: docRef.id, ...newUser, payments: [], totalPaid: 0 };
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  // Add payment for a user
  addPayment: async (userId, payment) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      // Add payment to payments array
      await updateDoc(userRef, {
        payments: arrayUnion({
          ...payment,
          id: Date.now(),
          date: new Date(payment.date).toISOString()
        }),
        totalPaid: increment(payment.amount),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }
};