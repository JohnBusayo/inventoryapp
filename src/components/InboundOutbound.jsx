import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Form, Button, Alert } from 'react-bootstrap';

const InboundOutbound = () => {
  const [operation, setOperation] = useState('inbound');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const { items, logInbound, logOutbound } = useInventory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = parseInt(itemId);
    if (operation === 'inbound') {
      logInbound(id, quantity);
    } else {
      logOutbound(id, quantity);
    }
    setQuantity(0);
  };

  return (
    <div>
      <h3>{operation === 'inbound' ? 'Inbound (Receipts)' : 'Outbound (Sales/Returns)'}</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Select Item</Form.Label>
          <Form.Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
            <option value="">Choose...</option>
            {items.map(item => <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Quantity</Form.Label>
          <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
        </Form.Group>
        <Button type="submit" variant={operation === 'inbound' ? 'success' : 'warning'}>
          {operation === 'inbound' ? 'Add Stock' : 'Remove Stock'}
        </Button>
      </Form>
      <Button variant="secondary" onClick={() => setOperation(operation === 'inbound' ? 'outbound' : 'inbound')}>
        Switch to {operation === 'inbound' ? 'Outbound' : 'Inbound'}
      </Button>
      <Alert variant="info">POS Sync: Simulated - In production, integrate with your POS API.</Alert>
    </div>
  );
};

export default InboundOutbound;