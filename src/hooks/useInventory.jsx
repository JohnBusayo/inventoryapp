// src/hooks/useInventory.js (or your hook file)
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase-config';  // Adjust path as explained above!

export const useInventory = () => {
  const [items, setItems] = useState([]);  // Starts empty; populates via listener

  // Real-time listener: Fetches initial data and listens for changes
  useEffect(() => {
    // Reference the 'churchMediaInventory' collection in Firestore
    const unsubscribe = onSnapshot(collection(db, 'churchMediaInventory'), (snapshot) => {
      // Map docs to array: { id: docId, ...data }
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,  // Firestore doc ID (string)
        ...doc.data(),  // Spread the item's fields (e.g., name, quantity)
      }));
      setItems(itemsData);  // Updates state automatically on changes
    });

    // Cleanup: Stop listening when component unmounts
    return () => unsubscribe();
  }, []);  // Empty deps: Runs once on mount

  // Add new item (async: returns promise)
  const addItem = async (newItem) => {
    // Generate ID (string for safety; could use Firestore's auto-ID via addDoc if preferred)
    const id = Date.now().toString();
    const itemWithId = { 
      ...newItem, 
      id,  // Include ID in data if your UI needs it
      addedDate: new Date().toISOString(),
      status: 'pending'  // Default for new items
    };
    
    try {
      // Create new doc in collection
      await setDoc(doc(db, 'churchMediaInventory', id), itemWithId);
      // No need to update state—onSnapshot handles it!
    } catch (error) {
      console.error('Error adding item:', error);
      // Optional: Throw or return error for UI handling
      throw error;  // Let caller catch it
    }
  };

  // Update existing item (async)
  const updateItem = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'churchMediaInventory', id), {
        ...updates,
        updatedDate: new Date().toISOString(),  // Timestamp the update
      });
      // onSnapshot auto-refreshes items
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // Delete item (async)
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'churchMediaInventory', id));
      // Auto-refresh via listener
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  // Return the same API as before
  return { items, addItem, updateItem, deleteItem };
};