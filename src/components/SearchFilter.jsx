import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Table, Form} from 'react-bootstrap';

const SearchFilter = () => {
  const { items } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (filterStatus === 'low' && item.stock < 10) ||
    (filterStatus === 'expired' && item.expiry && new Date(item.expiry) < new Date())
  ).filter(item => filterCategory === '' || item.category === filterCategory);

  return (
    <div>
      <h3>Search & Filter Items</h3>
      <Form>
        <Form.Group>
          <Form.Label>Search (Name/SKU/Category)</Form.Label>
          <Form.Control type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Category Filter</Form.Label>
          <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {[...new Set(items.map(item => item.category))].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Status Filter</Form.Label>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="low">Low Stock</option>
            <option value="expired">Expired Items</option>
          </Form.Select>
        </Form.Group>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td>{item.category}</td>
              <td>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SearchFilter;