import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjGDMRwJu5b0yTN2QrkPWmL19P0zVJCMM",
  authDomain: "icarus-31ad5.firebaseapp.com",
  databaseURL: "https://icarus-31ad5.firebaseio.com",
  projectId: "icarus-31ad5",
  storageBucket: "icarus-31ad5.firebasestorage.app",
  messagingSenderId: "902973398931",
  appId: "1:902973398931:web:f9baa2e44c64520e991266",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});
export const signUpWithGooglePopup = () => signInWithPopup(auth, provider);
