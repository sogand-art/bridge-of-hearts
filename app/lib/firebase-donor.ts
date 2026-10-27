import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase';

const app = getApps().some((a) => a.name === 'donor')
  ? getApp('donor')
  : initializeApp(firebaseConfig, 'donor');

export const donorAuth = getAuth(app);
export const donorDb = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(donorAuth, browserLocalPersistence).catch(console.error);
}