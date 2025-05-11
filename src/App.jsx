import { useState, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Create context for sharing items state
const ItemsContext = createContext()

// Landing page component with + button
function LandingPage() {
  const { items, setItems } = useContext(ItemsContext)
  
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: `Item ${items.length + 1}`,
      date: new Date().toLocaleString()
    }
    setItems([...items, newItem])
  }

  return (
    <div className="landing-page">
      <h1>Landing Page</h1>
      <button 
        className="add-button"
        onClick={addItem}
      >
        +
      </button>
    </div>
  )
}

// Data view component with CSV-style display
function DataView() {
  const { items } = useContext(ItemsContext)

  return (
    <div className="data-view">
      <h1>Data View</h1>
      <div className="csv-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Tab navigation component
function TabNavigation() {
  const location = useLocation()
  
  return (
    <div className="tab-navigation">
      <Link 
        to="/" 
        className={`tab ${location.pathname === '/' ? 'active' : ''}`}
      >
        Landing
      </Link>
      <Link 
        to="/data" 
        className={`tab ${location.pathname === '/data' ? 'active' : ''}`}
      >
        Data
      </Link>
    </div>
  )
}

function App() {
  const [items, setItems] = useState([])
  
  return (
    <ItemsContext.Provider value={{ items, setItems }}>
      <Router>
        <div className="app">
          <TabNavigation />
          <div className="content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/data" element={<DataView />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ItemsContext.Provider>
  )
}

export default App
