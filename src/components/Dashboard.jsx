import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Row, Col, Card, Table, Container, Form, Button, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { items: rawItems } = useInventory();
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let items = rawItems.map(item => ({
      ...item,
      stock: item.quantity || 0,
      name: item.instrumentName || 'Unnamed Item',
      category: item.category || 'Uncategorized',
      salesValue: (item.quantity || 0) * (parseFloat(item.value) || 0)
    }));

    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(items);
  }, [rawItems, searchTerm]);

  // Live metrics from Report logic
  const totalItems = filteredItems.length;
  const totalStockValue = filteredItems.reduce((sum, item) => sum + (item.stock * (parseFloat(item.value) || 0)), 0);
  const avgQuantity = filteredItems.length > 0 ? filteredItems.reduce((sum, item) => sum + item.stock, 0) / filteredItems.length : 0;
  const lowStockItems = filteredItems.filter(item => item.stock <= (item.minThreshold || 1));

  // Category data for Bar chart (histogram: categories vs total quantity)
  const categoryTotals = filteredItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.stock;
    return acc;
  }, {});
  const barChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Total Quantity by Category',
        data: Object.values(categoryTotals),
        backgroundColor: 'rgba(20, 33, 61, 0.6)',  // Primary color for bars
        borderColor: '#14213d',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        onClick: (e, legendItem, legend) => {
          // Toggle dataset visibility on legend click
          const index = legend.chart.data.datasets[0].data.findIndex((_, i) => legend.chart.data.labels[i] === legendItem.text);
          if (index !== -1) {
            const meta = legend.chart.getDatasetMeta(0);
            meta.data[index].hidden = !meta.data[index].hidden;
            legend.chart.update();
          }
        },
      },
      title: {
        display: true,
        text: 'Inventory by Category (Click bars for details)',
      },
      tooltip: {
        callbacks: {
          title: (context) => `Category: ${context[0].label}`,
          label: (context) => `Quantity: ${context.parsed.y} items`,
          afterLabel: (context) => {
            // Add average value per item in category
            const categoryItems = filteredItems.filter(item => item.category === context.label);
            const avgValue = categoryItems.reduce((sum, item) => sum + parseFloat(item.value || 0), 0) / categoryItems.length || 0;
            return `Avg Value: $${avgValue.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString(),  // Format y-axis numbers
        },
      },
      x: {
        ticks: {
          maxRotation: 45,  // Rotate labels if long
        },
      },
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = barChartData.labels[index];
        // Navigate to search page with category filter (simulate via query param or state)
        window.location.href = `/search?category=${encodeURIComponent(category)}`;
      }
    },
    animation: {
      duration: 1000,  // Smooth animation on load/hover
      easing: 'easeInOutQuart',
    },
  };

  // Doughnut for category distribution (top 5)
  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .reduce((acc, [cat, qty]) => {
      acc.labels.push(cat);
      acc.data.push(qty);
      return acc;
    }, { labels: [], data: [] });

  const doughnutChartData = {
    labels: topCategories.labels.length > 0 ? topCategories.labels : ['No Data'],
    datasets: [
      {
        data: topCategories.data.length > 0 ? topCategories.data : [1],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        onClick: (e, legendItem, legend) => {
          // Toggle segment visibility on legend click
          const index = legend.chart.data.labels.indexOf(legendItem.text);
          if (index !== -1) {
            const meta = legend.chart.getDatasetMeta(0);
            meta.data[index].hidden = !meta.data[index].hidden;
            legend.chart.update();
          }
        },
      },
      title: {
        display: true,
        text: 'Top Categories Distribution (Click segments for details)',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} items (${percentage}%)`;
          },
        },
      },
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = doughnutChartData.labels[index];
        // Navigate to search page with category filter
        window.location.href = `/search?category=${encodeURIComponent(category)}`;
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,  // Longer animation for pie
      easing: 'easeInOutBounce',
    },
  };

  // Stock Alerts (low stock items)
  const stockAlertsData = lowStockItems.slice(0, 3).map(item => ({
    orderId: item.serialNumber,
    date: new Date(item.addedDate).toLocaleDateString(),
    quantity: item.stock,
    alert: 'Low Stock',
    status: 'Active'
  }));

  // Top Items by Quantity
  const topSellingData = filteredItems
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(item => ({
      orderId: item.serialNumber,
      quantity: item.stock,
      alert: item.stock <= (item.minThreshold || 1) ? 'Low' : 'None',
      product: item.name
    }));

  return (
    <Container fluid className="p-0 bg-white">  {/* Explicit white background */}
      {/* Top Bar */}
      <div className="bg-white p-3 d-flex justify-content-between align-items-center border-bottom">
        <div className="d-flex align-items-center">
        
          {/* Add Item Button - Styled properly */}
         <Button 
  variant="primary"  
  size="sm" 
  as={Link} 
  to="/add" 
  className="me-3 rounded-pill px-4 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-light text-center"
>
 
  Add
</Button>
          {/* Search Form - Styled properly */}
          <InputGroup size="sm" className="me-3 rounded-pill shadow-sm overflow-hidden" style={{ maxWidth: '300px' }}>
            <Form.Control 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search" 
              className="border-0 ps-3 py-2"  // No border, custom padding
            />
            <Button variant="outline-light" className="border-0 px-3">
              <i className="bi bi-search text-primary-custom"></i>  {/* Primary icon */}
            </Button>
          </InputGroup>
        </div>
        <div className="d-flex align-items-center">
          {/* Profile Button - Styled properly */}
          <Dropdown>
            <Dropdown.Toggle 
              variant="light" 
              id="dropdown-user" 
              className="d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm border-0 bg-white text-primary-custom fw-medium"
            >
              {/* <img src={LogoImage} alt="Profile" className="rounded-circle" width="32" height="32" /> */}
              <i class="fa fa-user"></i>
             MR ESE
              <i className="bi bi-chevron-down ms-1"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="rounded-3 shadow border-0 mt-2">
              <Dropdown.Item className="px-3 py-2">
                <i className="bi bi-person me-2"></i>Profile
              </Dropdown.Item>
              <Dropdown.Item className="px-3 py-2">
                <i className="bi bi-gear me-2"></i>Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="px-3 py-2 text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Dashboard Content */}
      <Container fluid className="p-4 bg-white">  {/* Explicit white background */}
        {/* Cards Row - Live Metrics */}
        <Row className="mb-4 g-4">
          <Col md={3}>
            <Card className="text-center h-100 border-0 shadow-sm rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center py-4">
                <Card.Title className="text-primary-custom mb-2 fs-5 fw-bold">Total Items</Card.Title>
                <Card.Text className="display-4 mb-1 fw-bold text-primary-custom">{totalItems.toLocaleString()}</Card.Text>
                <Card.Text className="text-muted small mb-0">Live from Inventory</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 border-0 shadow-sm rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center py-4">
                <Card.Title className="text-primary-custom mb-2 fs-5 fw-bold">Total Stock Value</Card.Title>
                <Card.Text className="display-4 mb-1 fw-bold text-primary-custom">R{totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Card.Text>
                <Card.Text className="text-muted small mb-0">Current Valuation</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 border-0 shadow-sm rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center py-4">
                <Card.Title className="text-primary-custom mb-2 fs-5 fw-bold">Average Quantity</Card.Title>
                <Card.Text className="display-4 mb-1 fw-bold text-primary-custom">{avgQuantity.toFixed(1)}</Card.Text>
                <Card.Text className="text-muted small mb-0">Per Item</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100 border-0 shadow-sm rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center py-4">
                <Card.Title className="text-primary-custom mb-2 fs-5 fw-bold">Low Stock Alerts</Card.Title>
                <Card.Text className="display-4 mb-1 fw-bold text-primary-custom">{lowStockItems.length}</Card.Text>
                <Badge bg="warning" className="mb-0">Active</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4 g-4">
          <Col md={8}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Header className="bg-primary-custom text-white rounded-top-3">
                <h5 className="mb-0 fw-bold">Inventory by Category (Histogram)</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: '400px' }}>  {/* Fixed height for better interaction */}
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-3 h-100">
              <Card.Header className="bg-primary-custom text-white rounded-top-3">
                <h5 className="mb-0 fw-bold">Category Distribution</h5>
              </Card.Header>
              <Card.Body className="p-4 d-flex flex-column justify-content-center">
                <div style={{ height: '300px' }}>  {/* Fixed height for better interaction */}
                  <Doughnut data={doughnutChartData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tables Row */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Header className="bg-primary-custom text-white rounded-top-3">
                <h5 className="mb-0 fw-bold">Low Stock Alerts</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped bordered hover className="mb-0 rounded-bottom-3">
                  <thead className="table-dark">
                    <tr>
                      <th>Serial #</th>
                      <th>Date Added</th>
                      <th>Quantity</th>
                      <th>Alert</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlertsData.map((alert, index) => (
                      <tr key={index}>
                        <td>{alert.orderId}</td>
                        <td>{alert.date}</td>
                        <td>{alert.quantity}</td>
                        <td><Badge bg="warning">{alert.alert}</Badge></td>
                        <td><Badge bg="primary">{alert.status}</Badge></td>
                      </tr>
                    ))}
                    {stockAlertsData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">No alerts</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Header className="bg-primary-custom text-white rounded-top-3">
                <h5 className="mb-0 fw-bold">Top Items by Quantity</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped bordered hover className="mb-0 rounded-bottom-3">
                  <thead className="table-dark">
                    <tr>
                      <th>Serial #</th>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.orderId}</td>
                        <td>{product.product}</td>
                        <td className="fw-bold">{product.quantity}</td>
                        <td><Badge bg={product.alert === 'Low' ? 'warning' : 'success'}>{product.alert}</Badge></td>
                      </tr>
                    ))}
                    {topSellingData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">No items</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Dashboard;