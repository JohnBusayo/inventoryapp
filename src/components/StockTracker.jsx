import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Container, Row, Col } from 'react-bootstrap';

import StockFilters from './StockFilters';
import StockTable from './StockTable';

const StockTracker = () => {
  const { items: rawItems, updateItem, deleteItem } = useInventory();  // Now includes deleteItem
  
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    let filtered = rawItems.map(item => ({
      ...item,
      orderId: item.serialNumber || 'N/A',
      name: item.instrumentName || 'Unnamed Item',
      category: item.category || 'Uncategorized',
      salesChannel: item.assignedEvent || 'Unassigned',
      instruction: item.maintenanceNotes || 'Ready for use',
      itemsCount: `${item.quantity || 0}/${item.minThreshold || 1}`,  // Dynamic based on item
      status: item.status || 'pending'
    }));
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter.toLowerCase());
    }
    if (dateFilter) {
      filtered = filtered.filter(item => new Date(item.addedDate).toDateString() === new Date(dateFilter).toDateString());
    }
    setFilteredItems(filtered);
  }, [rawItems, searchTerm, statusFilter, dateFilter]);

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === 'complete' || action === 'pending') {
      const newStatus = action;  // 'complete' or 'pending'
      selectedItems.forEach(id => {
        updateItem(id, { status: newStatus });
      });
    }
    setSelectedItems([]);
  };

  const handleBulkDelete = (ids) => {
    ids.forEach(id => {
      deleteItem(id);  // Now uses hook's deleteItem
    });
    setSelectedItems([]);  // Clear selection after delete
  };

  const handleToggleStatus = (id) => {
    const item = rawItems.find(i => i.id === id);
    if (item) {
      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      updateItem(id, { status: newStatus });
    }
  };

  const handleUpdateItem = (id, updates) => {
    updateItem(id, updates);  // Handles qty/min updates
    // Re-filter to update itemsCount display
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    }, 0);
  };

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  };

  return (
    <Container fluid className="bg-white min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col xs={12}>
          <StockFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onRefresh={handleRefresh}
          />
          <StockTable
            items={filteredItems}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onBulkAction={handleBulkAction}
            onBulkDelete={handleBulkDelete}
            onToggleStatus={handleToggleStatus}
            onUpdateItem={handleUpdateItem}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default StockTracker;