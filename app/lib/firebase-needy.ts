import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase';

const app = getApps().some((a) => a.name === 'needy')
  ? getApp('needy')
  : initializeApp(firebaseConfig, 'needy');

export const needyAuth = getAuth(app);
export const needyDb = getFirestore(app);

if (typeof window !== 'undefined') {
  setPersistence(needyAuth, browserLocalPersistence).catch(console.error);
}