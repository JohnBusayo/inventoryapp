import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import InventoryImage from "./images/inventory.jpg";

const AddItem = () => {
  const [formData, setFormData] = useState({ 
    instrumentName: '', 
    serialNumber: '', 
    description: '', 
    category: '', 
    supplier: '', 
    costPrice: '', 
    value: '', 
    quantity: 0,
    minThreshold: 1,
    assignedEvent: '', 
    maintenanceNotes: '' 
  });
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const { addItem, categories: rawCategories, addCategory, deleteCategory } = useInventory();
  const categories = rawCategories || [];

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      const newCat = { value: newCategory.trim(), label: newCategory.trim() };
      try {
        await addCategory(newCat);
        setFormData({ ...formData, category: newCat.value });
        setNewCategory('');
        setShowAddCategory(false);
        setMessage('New category added successfully!');
      } catch (error) {
        setMessage('Error adding category: ' + error.message);
      }
    }
  };

  const handleDeleteCategory = async (catValue) => {
    try {
      await deleteCategory(catValue);
      if (formData.category === catValue) {
        setFormData({ ...formData, category: '' });
      }
      setMessage('Category deleted successfully!');
    } catch (error) {
      setMessage('Error deleting category: ' + error.message);
    }
  };

  const handleScan = (err, result) => {
    if (result && result.text) {
      setFormData({ ...formData, serialNumber: result.text });
      setScanning(false);
      setMessage('Serial number scanned successfully!');
    } else if (err) {
      setMessage('Scan error: Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instrumentName || !formData.serialNumber) {
      setMessage('Instrument Name and Serial Number are required!');
      return;
    }
    addItem(formData);
    setMessage('Item added to church media inventory successfully! It will appear in Stock Tracker.');
    setFormData({ 
      instrumentName: '', 
      serialNumber: '', 
      description: '', 
      category: '', 
      supplier: '', 
      costPrice: '', 
      value: '', 
      quantity: 0,
      minThreshold: 1,
      assignedEvent: '',
      maintenanceNotes: '' 
    });
    setScanning(false);  // Stop scanning on submit
    setTimeout(() => window.location.href = '/stock', 2000);
  };

  return (
    <Container className="bg-white min-vh-100 py-4">  {/* Changed to non-fluid for auto margins & centering */}
      <Row className="g-4 justify-content-center">  {/* Added justify-content-center for additional centering */}
        {/* Left-hand side image - hidden on mobile, full column height */}
        <Col md={4} className="d-none d-md-block">
          <Card className="h-100 shadow-sm border-0 rounded-3">
            <Card.Body className="d-flex flex-column p-0">
              <img 
                src={InventoryImage}
                alt="Item Preview" 
                className="img-fluid rounded-3 h-100 w-100" 
                style={{ objectFit: 'cover' }}  // Ensures image fills the space without distortion
              />
            </Card.Body>
          </Card>
        </Col>
        {/* Right-hand side form */}
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-primary-custom text-white border-0 pb-0">  {/* Primary bg for "Add Media Item" header */}
              <h3 className="text-center mb-o text-[25px] text-white">Add Church Media Item</h3>  {/* White text for contrast */}
              <p className="text-center text-light small mt-1">Track instruments and equipment for services and events</p>
            </Card.Header>
            <Card.Body className="p-4">
              {message && (
                <Alert 
                  variant={message.includes('successfully') || message.includes('scanned') ? 'success' : 'warning'} 
                  className="rounded-3 mb-4"
                  dismissible 
                  onClose={() => setMessage('')}
                >
                  {message}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Instrument Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., Wireless Microphone"
                        value={formData.instrumentName} 
                        onChange={(e) => setFormData({ ...formData, instrumentName: e.target.value })} 
                        required 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Serial Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., SN-12345"
                        value={formData.serialNumber} 
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} 
                        required 
                        className="rounded-3 shadow-sm"
                      />
                      <Button 
                        variant="outline-primary"  // Changed to outline-primary for consistent color theme
                        size="sm" 
                        className="mt-1 w-100 rounded-3"
                        onClick={() => setScanning(!scanning)}
                      >
                        {scanning ? 'Stop Scan' : 'Scan Barcode'}
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-primary-custom">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="e.g., Shure SM58 vocal mic for worship services"
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="rounded-3 shadow-sm"
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Category</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Select 
                          value={formData.category} 
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                          className="rounded-3 shadow-sm flex-grow-1"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="rounded-3 p-1"
                          onClick={() => setShowAddCategory(true)}
                          title="Add New Category"
                        >
                          +
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-3 p-1"
                          onClick={() => setShowManageCategories(!showManageCategories)}
                          title="Manage Categories"
                        >
                          x
                        </Button>
                      </div>
                      {showAddCategory && (
                        <div className="mt-2">
                          <Form.Control
                            type="text"
                            placeholder="Enter new category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="rounded-3 shadow-sm mb-1"
                            autoFocus
                          />
                          <div className="d-flex gap-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-3"
                              onClick={handleAddCategory}
                            >
                              Add
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-3"
                              onClick={() => {
                                setShowAddCategory(false);
                                setNewCategory('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {showManageCategories && (
                        <div className="mt-2">
                          <h6 className="mb-2">Manage Categories</h6>
                          {categories.length === 0 ? (
                            <p className="text-muted small">No categories available.</p>
                          ) : (
                            categories.map((cat) => (
                              <div key={cat.value} className="d-flex justify-content-between align-items-center mb-1 p-1 bg-light rounded">
                                <span className="small">{cat.label}</span>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="rounded"
                                  onClick={() => handleDeleteCategory(cat.value)}
                                >
                                  Delete
                                </Button>
                              </div>
                            ))
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2 w-100 rounded-3"
                            onClick={() => setShowManageCategories(false)}
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Supplier</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., Church Audio Supplies"
                        value={formData.supplier} 
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Cost Price (R)</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        value={formData.costPrice} 
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Current Value (R)</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        value={formData.value} 
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Quantity</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="1"
                        value={formData.quantity} 
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Min Stock Alert</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="1"
                        value={formData.minThreshold} 
                        onChange={(e) => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 1 })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-primary-custom">Assigned Event</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="e.g., Sunday Worship"
                        value={formData.assignedEvent} 
                        onChange={(e) => setFormData({ ...formData, assignedEvent: e.target.value })} 
                        className="rounded-3 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-primary-custom">Maintenance Notes</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="e.g., Batteries replaced on 10/31/2025"
                    value={formData.maintenanceNotes} 
                    onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })} 
                    className="rounded-3 shadow-sm"
                  />
                </Form.Group>
                <div className="d-flex gap-2 justify-content-center">
                  <Button type="submit" variant="primary" className="px-4 rounded-3 shadow-sm">  {/* Uses overridden primary */}
                    Add to Inventory
                  </Button>
                </div>
              </Form>
              {scanning && (
                <div className="mt-4 p-3 border rounded-3 bg-light">
                  <h6 className="text-center mb-3 text-primary-custom">Scanning for Serial Number...</h6>
                  <BarcodeScannerComponent 
                    onUpdate={handleScan} 
                    facingMode="environment"  // Use back camera if available
                    width={300} 
                    height={200} 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-100 mt-2 rounded-3"
                    onClick={() => setScanning(false)}
                  >
                    Cancel Scan
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddItem;