import { useState, useEffect } from 'react';

export const useInventory = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('churchMediaInventory');
    return saved ? JSON.parse(saved) : [];
  });

  const addItem = (newItem) => {
    const itemWithId = { 
      ...newItem, 
      id: Date.now(), 
      addedDate: new Date().toISOString(),
      status: 'pending'  // Default status for new items
    };
    const updatedItems = [...items, itemWithId];
    setItems(updatedItems);
    localStorage.setItem('churchMediaInventory', JSON.stringify(updatedItems));
    
    // Trigger custom event for real-time sync across components
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  };

  const updateItem = (id, updates) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates, updatedDate: new Date().toISOString() } : item
    );
    setItems(updatedItems);
    localStorage.setItem('churchMediaInventory', JSON.stringify(updatedItems));
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  };

  const deleteItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem('churchMediaInventory', JSON.stringify(updatedItems));
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  };


  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('churchMediaInventory');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    };

    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, []);

  return { items, addItem, updateItem, deleteItem };
};