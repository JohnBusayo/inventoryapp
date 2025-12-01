import React, { useState } from 'react';
import { Row, Col, Button, InputGroup, Form, Dropdown } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StockFilters = ({ 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateChange, 
  statusFilter, 
  onStatusChange,
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDate, setLocalDate] = useState(dateFilter);
  const [localStatus, setLocalStatus] = useState(statusFilter);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setLocalDate(value);
    onDateChange(value);
  };

  const handleStatusChange = (filter) => {
    setLocalStatus(filter);
    onStatusChange(filter);
  };

  const handleRefresh = () => {
    // Reset local states to match props if needed, then call parent
    onRefresh();
  };

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary-custom text-[25px] fw-bold mb-1">In Stock</h2>  {/* Primary custom color */}
          {/* <p className="text-muted mb-0">Church media equipment ready for events and services</p> */}
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="primary"  
            size="sm" 
            className="d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm"
            onClick={handleRefresh}
          >
            <FaSync className="fs-6" /> Refresh
          </Button>
          <Button 
            variant="primary"  
            className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm"
            onClick={() => navigate('/add')}
          >
            <FaPlus className="fs-6" />
            + New Item
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <Row className="mb-4 g-3 align-items-end">
        <Col md={4}>
          <InputGroup className="shadow-sm rounded-pill">
            <InputGroup.Text className="bg-white border-0 px-3">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Quick search instruments or serials"
              value={localSearch}
              onChange={handleSearchChange}
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
              value={localDate}
              onChange={handleDateChange}
              className="border-0 rounded-pill ps-0"
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="primary" className="w-100 rounded-pill shadow-sm text-start px-3 text-white">  {/* Changed to primary for filled color, added text-white for contrast */}
              Status: {localStatus}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100 rounded-3 shadow">
              <Dropdown.Item onClick={() => handleStatusChange('All')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => handleStatusChange('Completed')}>Completed</Dropdown.Item>
              <Dropdown.Item onClick={() => handleStatusChange('Pending')}>Pending</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={3}>
          <small className="text-muted">Filters update live</small>
        </Col>
      </Row>
    </>
  );
};

export default StockFilters;