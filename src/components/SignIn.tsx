import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const SignIn = () => {
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists, create if not
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        points: 0,
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-black">
      <button 
        onClick={signIn}
        className="px-6 py-3 bg-primary text-white font-bold rounded-full"
      >
        Sign in with Google
      </button>
    </div>
  );
};
