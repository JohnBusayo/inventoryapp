import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Button, Table, Card, Form, InputGroup, Dropdown, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaPrint, FaFilePdf, FaFileCsv } from 'react-icons/fa';

const ReportDashboard = () => {
  const { items: rawItems } = useInventory();
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let filtered = rawItems.map(item => ({
      ...item,
      stock: item.quantity || 0,
      name: item.instrumentName || 'Unnamed Item',
      category: item.category || 'Uncategorized',
      salesValue: (item.quantity || 0) * (parseFloat(item.value) || 0)
    }));

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter.toLowerCase());
    }
    if (dateFilter) {
      filtered = filtered.filter(item => new Date(item.addedDate).toDateString() === new Date(dateFilter).toDateString());
    }
    setFilteredItems(filtered);
  }, [rawItems, searchTerm, categoryFilter, statusFilter, dateFilter]);

  const totalStockValue = filteredItems.reduce((sum, item) => sum + (item.stock * (parseFloat(item.value) || 0)), 0);
  const avgQuantity = filteredItems.length > 0 ? filteredItems.reduce((sum, item) => sum + item.stock, 0) / filteredItems.length : 0;
  const topItems = filteredItems.sort((a, b) => b.stock - a.stock).slice(0, 5);
  const lowStockItems = filteredItems.filter(item => item.stock <= (item.minThreshold || 1));

  const categories = [...new Set(rawItems.map(item => item.category).filter(Boolean))];

  const exportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Church Media Inventory Report', 10, yPos);
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, yPos);
    yPos += 10;
    doc.text(`Filtered Results: ${filteredItems.length} items`, 10, yPos);
    yPos += 15;

    doc.text(`Total Stock Value: R ${totalStockValue.toFixed(2)}`, 10, yPos);
    yPos += 10;
    doc.text(`Average Quantity per Item: ${avgQuantity.toFixed(2)}`, 10, yPos);
    yPos += 15;

    doc.text('Top 5 Items by Quantity:', 10, yPos);
    yPos += 10;
    topItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} (${item.category}): ${item.stock} units - Value: R ${(item.stock * parseFloat(item.value || 0)).toFixed(2)}`, 10, yPos);
      yPos += 8;
    });

    if (lowStockItems.length > 0) {
      yPos += 10;
      doc.text('Low Stock Alerts:', 10, yPos);
      yPos += 10;
      lowStockItems.forEach((item, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${item.name}: ${item.stock}/${item.minThreshold} (Reorder needed)`, 10, yPos);
        yPos += 8;
      });
    }

    doc.save(`church-media-report-${new Date().toISOString().split('T')[0]}.pdf`);
    setMessage('PDF exported successfully!');
  };

  const exportCSV = () => {
    const exportData = filteredItems.map(item => ({
      Name: item.name,
      Serial: item.serialNumber,
      Category: item.category,
      Quantity: item.stock,
      Value: item.value,
      TotalValue: (item.stock * parseFloat(item.value || 0)).toFixed(2),
      Status: item.status,
      AssignedEvent: item.assignedEvent
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church-media-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setMessage('CSV exported successfully!');
  };

  const handlePrint = () => {
    window.print();
    setMessage('Print dialog opened!');
  };

  return (
    <Card className="shadow-sm border-0">
      
      <Card.Body className="p-4">
        {message && (
          <Alert variant="success" dismissible onClose={() => setMessage('')} className="rounded-3 mb-4">
            {message}
          </Alert>
        )}

        <Row className="mb-4 g-3 align-items-end">
          <Col md={3}>
            <InputGroup className="shadow-sm rounded-pill">
              <InputGroup.Text className="bg-white border-0 px-3">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or serial"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 rounded-pill ps-0"
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup className="shadow-sm rounded-pill">
              <InputGroup.Text className="bg-white border-0 px-3">
                <FaCalendarAlt className="text-muted fs-6" />
              </InputGroup.Text>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-0 rounded-pill ps-0"
                max={new Date().toISOString().split('T')[0]}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Dropdown>
              <Dropdown.Toggle variant="primary" className="w-100 rounded-pill shadow-sm text-start px-3 text-white">
                Category: {categoryFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100 rounded-3 shadow">
                <Dropdown.Item onClick={() => setCategoryFilter('All')}>All Categories</Dropdown.Item>
                {categories.map(cat => (
                  <Dropdown.Item key={cat} onClick={() => setCategoryFilter(cat)}>{cat}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={2}>
            <Dropdown>
              <Dropdown.Toggle variant="primary" className="w-100 rounded-pill shadow-sm text-start px-3 text-white">
                Status: {statusFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100 rounded-3 shadow">
                <Dropdown.Item onClick={() => setStatusFilter('All')}>All Status</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter('Completed')}>Completed</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter('Pending')}>Pending</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={2}>
            <small className="text-muted">Live filtering applied</small>
          </Col>
        </Row>

        <Table bordered className="mb-4 rounded-3 overflow-hidden">
          <tbody>
            <tr className="table-primary-custom">
              <td><strong>Total Items:</strong></td>
              <td>{filteredItems.length}</td>
            </tr>
            <tr>
              <td><strong>Total Stock Value:</strong></td>
              <td>R {totalStockValue.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Average Quantity:</strong></td>
              <td>{avgQuantity.toFixed(2)}</td>
            </tr>
            {lowStockItems.length > 0 && (
              <tr className="table-warning">
                <td><strong>Low Stock Alerts:</strong></td>
                <td>{lowStockItems.length}</td>
              </tr>
            )}
          </tbody>
        </Table>

        <h5 className="mb-3 text-primary-custom">Top 5 Items by Quantity</h5>
        <div className="table-responsive mb-4">
          <Table striped bordered hover className="rounded-3 overflow-hidden">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Value per Unit</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><Badge bg="secondary">{item.category}</Badge></td>
                  <td className="fw-bold">{item.stock}</td>
                  <td>R {parseFloat(item.value || 0).toFixed(2)}</td>
                  <td>R {(item.stock * parseFloat(item.value || 0)).toFixed(2)}</td>
                </tr>
              ))}
              {topItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No items match the filters</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Button 
            variant="primary" 
            onClick={handlePrint}
            className="d-flex align-items-center gap-1 rounded-pill px-4"
          >
            <FaPrint /> Print Report
          </Button>
          <Button 
            variant="danger" 
            onClick={exportPDF}
            className="d-flex align-items-center gap-1 rounded-pill px-4"
          >
            <FaFilePdf /> Export PDF
          </Button>
          <Button 
            variant="success" 
            onClick={exportCSV}
            className="d-flex align-items-center gap-1 rounded-pill px-4"
          >
            <FaFileCsv /> Export CSV
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReportDashboard;