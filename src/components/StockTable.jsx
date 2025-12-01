import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import for navigation
import { Table, Form, Button, Badge, Dropdown, Pagination, Container, Row, Col, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const StockTable = ({ 
  items, 
  selectedItems, 
  onSelectItem, 
  onBulkAction, 
  onToggleStatus,
  onUpdateItem,  // New prop for editing qty/min
  onBulkDelete   // New prop for bulk delete
}) => {
  const navigate = useNavigate();  // Hook for programmatic navigation
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);  // For inline editing
  const [editQuantity, setEditQuantity] = useState(0);
  const [editMinThreshold, setEditMinThreshold] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);  // Confirmation modal state
  const itemsPerPage = 10;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const totalPages = Math.ceil(items.length / itemsPerPage);

  // Use real items only—no fallback
  const displayItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const displayTotalPages = Math.ceil(items.length / itemsPerPage);
  const displayItemsCount = items.length;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleBulkAction = (action) => {
    if (action === 'complete' || action === 'pending') {
      onBulkAction(action);
    } else if (action === 'delete') {
      setShowDeleteConfirm(true);  // Show confirmation modal
    }
  };

  const confirmDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedItems);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getStatusBadge = (status) => {
    const variant = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'secondary';
    const icon = status === 'completed' ? <FaCheck className="me-1" /> : <FaTimes className="me-1" />;
    return <Badge bg={variant} className="rounded-pill px-3 py-2 d-flex align-items-center">{icon}{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity || 0);
    setEditMinThreshold(item.minThreshold || 1);
  };

  const saveEdit = (id) => {
    if (onUpdateItem) {
      onUpdateItem(id, { quantity: parseInt(editQuantity) || 0, minThreshold: parseInt(editMinThreshold) || 1 });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Handler for Add Item button
  const handleAddItem = () => {
    navigate('/add');  // Navigate to the add item page (adjust path if needed, e.g., '/add')
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Table Card */}
          <div className="shadow-sm border-0 rounded-3 overflow-hidden mb-4">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: '50px' }}>
                      <Form.Check type="checkbox" onChange={() => {}} />
                    </th>
                    <th>Serial #</th>
                    <th>Instrument</th>
                    <th>Category</th>
                    <th>Assigned Event</th>
                    <th>Notes</th>
                    <th>Qty/Min</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="text-center">
                        <Form.Check 
                          type="checkbox" 
                          checked={selectedItems.includes(item.id)}
                          onChange={() => onSelectItem(item.id)}
                        />
                      </td>
                      <td><span className="fw-medium text-primary-custom">{item.orderId}</span></td>
                      <td className="fw-medium">{item.name}</td>
                      <td><Badge bg="light" className="text-dark rounded-pill px-2 py-1">{item.category}</Badge></td>
                      <td className="text-muted">{item.salesChannel}</td>
                      <td className="text-muted small">{item.instruction}</td>
                      <td>
                        {editingId === item.id ? (
                          <div className="d-flex align-items-center gap-1">
                            <InputGroup size="sm" className="flex-grow-1">
                              <InputGroup.Text className="bg-light border-0 px-2">Qty:</InputGroup.Text>
                              <Form.Control 
                                type="number" 
                                value={editQuantity} 
                                onChange={(e) => setEditQuantity(e.target.value)} 
                                className="border-end-0"
                                style={{ maxWidth: '60px' }}
                              />
                              <InputGroup.Text className="bg-light border-0 px-1">/</InputGroup.Text>
                              <InputGroup.Text className="bg-light border-0 px-2">Min:</InputGroup.Text>
                              <Form.Control 
                                type="number" 
                                value={editMinThreshold} 
                                onChange={(e) => setEditMinThreshold(e.target.value)} 
                                className="border-start-0"
                                style={{ maxWidth: '60px' }}
                              />
                            </InputGroup>
                            <Button 
                              size="sm" 
                              variant="outline-success" 
                              className="px-1" 
                              onClick={() => saveEdit(item.id)}
                            >
                              <FaCheck className="fs-6" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              className="px-1" 
                              onClick={cancelEdit}
                            >
                              <FaTimes className="fs-6" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="fw-semibold text-success cursor-pointer" 
                            onClick={() => startEditing(item)} 
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title="Click to edit"
                          >
                            {item.itemsCount}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          {getStatusBadge(item.status)}
                          <Button 
                            size="sm" 
                            variant="link" 
                            className="p-0 text-primary-custom" 
                            onClick={() => onToggleStatus(item.id)}
                          >
                            <FaEdit className="fs-6" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {items.length === 0 && (
              <div className="text-center py-5 bg-light rounded-bottom">
                <h5 className="text-muted mb-3">No Media Items in Stock</h5>
                <p className="text-muted">Get started by adding your first instrument or equipment.</p>
                <Button variant="primary" className="rounded-pill px-4" onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="d-flex justify-content-start mb-4">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="rounded-pill px-4 shadow-sm">
                  Bulk Actions ({selectedItems.length})
                </Dropdown.Toggle>
                <Dropdown.Menu className="rounded-3 shadow">
                  <Dropdown.Item onClick={() => handleBulkAction('complete')}>Mark as Completed</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleBulkAction('pending')}>Mark as Pending</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleBulkAction('delete')}>
                    <FaTrash className="me-2" /> Delete Selected
                  </Dropdown.Item>
                  <Dropdown.Item>Maintenance Log</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}

          {/* Pagination */}
          {displayTotalPages > 1 && (
            <Pagination className="justify-content-center mb-0">
              <Pagination.Prev 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
              />
              {[...Array(displayTotalPages)].map((_, index) => (
                <Pagination.Item 
                  key={index + 1} 
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages))} 
                disabled={currentPage === displayTotalPages}
              />
            </Pagination>
          )}
          {items.length > 0 && (
            <small className="text-muted d-block text-center mt-2">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, displayItemsCount)} of {displayItemsCount} items
            </small>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={cancelDelete} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary-custom">
            <FaTrash className="me-2" /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <FaTrash className="text-danger fs-1 mb-3" />
          </div>
          <p className="mb-0">Are you sure you want to delete {selectedItems.length} selected item(s)?</p>
          <small className="text-muted d-block mt-1">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="outline-secondary" onClick={cancelDelete} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="rounded-pill px-4">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StockTable;