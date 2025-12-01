import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from './components/Navbar';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';
import StockTracker from './components/StockTracker';
import InboundOutbound from './components/InboundOutbound';
import SearchFilter from './components/SearchFilter';
import ReportDashboard from './components/ReportDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <AppNavbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<ItemList />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/stock" element={<StockTracker />} />
            <Route path="/operations" element={<InboundOutbound />} />
            <Route path="/search" element={<SearchFilter />} />
            <Route path="/reports" element={<ReportDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;