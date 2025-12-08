import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB065yiD-EweWds2s4-fQyUg9auCm0dMKs",
  authDomain: "sparkle-studio-efcf3.firebaseapp.com",
  projectId: "sparkle-studio-efcf3",
  storageBucket: "sparkle-studio-efcf3.firebasestorage.app",
  messagingSenderId: "753016501234",
  appId: "1:753016501234:web:ec2db5d4cfbc0a7454f16b",
  measurementId: "G-4KTR2VJYYT"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
export default app;

