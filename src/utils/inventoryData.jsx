// import { useState, useEffect } from 'react';

// export const useInventory = () => {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     const saved = localStorage.getItem('inventoryItems');
//     if (saved) setItems(JSON.parse(saved));
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('inventoryItems', JSON.stringify(items));
//   }, [items]);

//   const addItem = (newItem) => setItems([...items, { id: Date.now(), ...newItem }]);
//   const updateItem = (id, updatedItem) => setItems(items.map(item => item.id === id ? { ...item, ...updatedItem } : item));
//   const deleteItem = (id) => setItems(items.filter(item => item.id !== id));
//   const logInbound = (id, quantity) => updateItem(id, { stock: (items.find(item => item.id === id)?.stock || 0) + quantity });
//   const logOutbound = (id, quantity) => {
//     const item = items.find(item => item.id === id);
//     if (item.stock >= quantity) {
//       updateItem(id, { stock: item.stock - quantity });
//     }
//   };

//   return { items, addItem, updateItem, deleteItem, logInbound, logOutbound };
// };