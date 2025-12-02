import React from 'react';  // Add if missing
import { useInventory } from '../hooks/useInventory';  // <-- ADD THIS LINE
import { Table, Button, Card } from 'react-bootstrap';

const ItemList = () => {
  const { items, deleteItem } = useInventory();

  return (
    <Card>
      <Card.Header><h3>Item Catalog</h3></Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.supplier}</td>
                <td>${item.costPrice}</td>
                <td>${item.sellingPrice}</td>
                <td>{item.stock}</td>
                <td>
                  <Button variant="warning" size="sm">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteItem(item.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="primary" onClick={() => window.location.href = '/add'}>Add New Item</Button>
      </Card.Body>
    </Card>
  );
};

export default ItemList;