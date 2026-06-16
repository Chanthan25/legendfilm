import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp({
  ...firebaseConfig,
  databaseURL: "https://legendfilms-default-rtdb.asia-southeast1.firebasedatabase.app"
});
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Must be called from a button click or user interaction
export const customGoogleSignIn = async (_optionalAuth?: any, _optionalProvider?: any) => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('Could not get access token from Firebase Auth');
    } else {
      cachedAccessToken = credential.accessToken;
    }
    return result;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  // If we don't have a cached token, we can't do much here except return null 
  // until the user signs in again.
  return cachedAccessToken;
};

// Intercept original signout
export const customSignOut = async (_arg?: any) => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

// Also listen for state changes to clear token if needed
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

export { customGoogleSignIn as signInWithPopup, customSignOut as firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser };

