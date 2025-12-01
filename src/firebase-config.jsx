import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKIFmhCr18dmiJXfXsI1yFrNoomSV6BOQ",
  authDomain: "rccg-hg-inventory.firebaseapp.com",
  projectId: "rccg-hg-inventory",
  storageBucket: "rccg-hg-inventory.firebasestorage.app",
  messagingSenderId: "580655645318",
  appId: "1:580655645318:web:4d779c66e8f07fa4d30707",
  measurementId: "G-0FBDHEZ09H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

