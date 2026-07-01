import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test as per skill guidelines
async function testConnection() {
  try {
    // Attempting a read to verify connection/config
    await getDocFromCache(doc(db, '_connection_test_', 'init'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firebase: Client appears to be offline or config is invalid.");
    }
  }
}
testConnection();
