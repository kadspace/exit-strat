import { useState, createContext, useContext, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Create context for sharing items state
const ItemsContext = createContext()

// Icons for expense categories
const expenseIcons = [
  { id: 'car', label: 'Car Insurance', icon: '🚗', defaultAmount: 200, color: '#FF6B6B' },
  { id: 'groceries', label: 'Groceries', icon: '🛒', defaultAmount: 300, color: '#4ECDC4' },
  { id: 'utilities', label: 'Utilities', icon: '💡', defaultAmount: 150, color: '#FFD166' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', defaultAmount: 80, color: '#6B5B95' },
  { id: 'rent', label: 'Rent', icon: '🏠', defaultAmount: 1200, color: '#88D8B0' },
  { id: 'dining', label: 'Dining', icon: '🍽️', defaultAmount: 100, color: '#FF8C94' },
  { id: 'health', label: 'Healthcare', icon: '⚕️', defaultAmount: 150, color: '#7AC7D3' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', defaultAmount: 120, color: '#F8A055' }
]

// ExpenseModal component
function ExpenseModal({ showOptions, closeMenu, items, addExpense }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(null)
  const menuRef = useRef(null)
  const searchInputRef = useRef(null)
  
  // Focus the search input when the modal mounts
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100)
    }
  }, [])
  
  // Filter icons based on search term
  const filteredIcons = expenseIcons.filter(icon => 
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectIcon = (icon) => {
    setSelectedIcon(icon)
  }
  
  const handleAddExpense = () => {
    if (!selectedIcon) return
    addExpense(selectedIcon)
    setSelectedIcon(null)
  }
  
  return (
    <>
      <div className="expense-menu-layout" ref={menuRef}>
        <div className="menu-close-button" onClick={closeMenu}>
          <span>×</span>
        </div>
        
        <div className="expense-options">
          <div className="expense-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="expense-icons-grid">
            {filteredIcons.map(icon => (
              <div 
                key={icon.id} 
                className={`expense-icon-item ${selectedIcon && selectedIcon.id === icon.id ? 'selected' : ''}`}
                onClick={() => selectIcon(icon)}
              >
                <div className="expense-icon">{icon.icon}</div>
                <div className="expense-label">{icon.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="expense-preview">
          <h2>Preview</h2>
          {items.length > 0 ? (
            <div className="expense-items-list">
              {items.map(item => (
                <div key={item.id} className="expense-preview-item">
                  <div className="expense-preview-icon">{item.icon}</div>
                  <div className="expense-preview-details">
                    <div className="expense-preview-name">{item.name}</div>
                    <div className="expense-preview-amount">${item.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items">No expenses added yet</div>
          )}
          
          {selectedIcon && (
            <div className="selected-expense">
              <h3>Add New Expense</h3>
              <div className="selected-expense-details">
                <div className="selected-expense-icon">{selectedIcon.icon}</div>
                <div className="selected-expense-label">{selectedIcon.label}</div>
                <div className="expense-input">
                  <span>$</span>
                  <input 
                    type="number" 
                    value={selectedIcon.defaultAmount} 
                    onChange={(e) => setSelectedIcon({...selectedIcon, defaultAmount: e.target.value})}
                  />
                </div>
              </div>
              <button 
                className="expense-add"
                onClick={handleAddExpense}
              >
                Add Expense
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="backdrop" onClick={closeMenu}></div>
    </>
  )
}

// Visualization component with charts
function VisualizationPage() {
  const { items, setItems } = useContext(ItemsContext)
  const [showOptions, setShowOptions] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
  // Check if there's data and control visibility
  useEffect(() => {
    if (items.length > 0) {
      // Small delay to allow for animations to work properly
      setTimeout(() => {
        setShowContent(true)
      }, 100)
    } else {
      setShowContent(false)
    }
  }, [items])
  
  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showOptions) {
        closeMenu()
      }
    }
    
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [showOptions])
  
  const toggleOptions = () => {
    if (showOptions) {
      closeMenu()
    } else {
      openMenu()
    }
  }
  
  const openMenu = () => {
    setShowOptions(true)
  }
  
  const closeMenu = () => {
    setShowOptions(false)
  }
  
  const addExpense = (selectedIcon) => {
    const newItem = {
      id: Date.now(),
      name: selectedIcon.label,
      icon: selectedIcon.icon,
      amount: Number(selectedIcon.defaultAmount),
      date: new Date().toLocaleString(),
      color: selectedIcon.color
    }
    setItems([...items, newItem])
  }
  
  // Calculate summary data for charts
  const totalExpenses = items.reduce((sum, item) => sum + Number(item.amount), 0)
  
  // Group expenses by category
  const expensesByCategory = items.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        total: 0,
        icon: item.icon,
        color: item.color
      }
    }
    acc[item.name].total += Number(item.amount)
    return acc
  }, {})
  
  // Calculate percentages for pie chart
  const pieChartData = Object.keys(expensesByCategory).map(category => {
    const percentage = (expensesByCategory[category].total / totalExpenses) * 100
    return {
      name: category,
      icon: expensesByCategory[category].icon,
      value: expensesByCategory[category].total,
      percentage: percentage.toFixed(1),
      color: expensesByCategory[category].color
    }
  }).sort((a, b) => b.value - a.value)
  
  return (
    <div className="visualization-page">
      <div className="header-container">
        <h1>exit strat</h1>
        <button 
          className="add-button-minimal"
          onClick={toggleOptions}
          aria-label={showOptions ? "Close menu" : "Add expense"}
        >
          +
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="empty-state">
          <p>Add your first expense to get started</p>
          <div className="gesture-arrow">→</div>
        </div>
      ) : (
        <>
          <div className={`viz-summary ${showContent ? 'show' : ''}`}>
            <div className="summary-card total-card">
              <h2>Total Expenses</h2>
              <div className="summary-amount">${totalExpenses.toFixed(2)}</div>
              <div className="summary-count">{items.length} expenses</div>
            </div>
            
            <div className="summary-card avg-card">
              <h2>Average Expense</h2>
              <div className="summary-amount">
                ${items.length ? (totalExpenses / items.length).toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="summary-card largest-card">
              <h2>Largest Expense</h2>
              <div className="summary-amount">
                ${items.length ? Math.max(...items.map(item => Number(item.amount))).toFixed(2) : '0.00'}
              </div>
              <div className="summary-category">
                {items.length ? 
                  items.find(item => Number(item.amount) === Math.max(...items.map(item => Number(item.amount))))?.name 
                  : 'None'}
              </div>
            </div>
          </div>
          
          <div className={`viz-content ${showContent ? 'show' : ''}`}>
            <div className="viz-overview">
              <div className="mini-charts">
                <div className="mini-pie-chart">
                  <h3>Expense Distribution</h3>
                  <div className="pie-container">
                    <div className="pie-chart">
                      {pieChartData.map((segment, index) => (
                        <div 
                          key={index}
                          className="pie-segment"
                          style={{
                            '--percentage': `${segment.percentage}%`,
                            '--color': segment.color,
                            '--offset': `${pieChartData
                              .slice(0, index)
                              .reduce((sum, s) => sum + parseFloat(s.percentage), 0)}%`
                          }}
                          title={`${segment.name}: $${segment.value} (${segment.percentage}%)`}
                        />
                      ))}
                      <div className="pie-center">
                        <div className="pie-total">${totalExpenses}</div>
                        <div className="pie-label">Total</div>
                      </div>
                    </div>
                    <div className="pie-legend">
                      {pieChartData.slice(0, 5).map((segment, index) => (
                        <div key={index} className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: segment.color }}></div>
                          <div className="legend-icon">{segment.icon}</div>
                          <div className="legend-label">{segment.name}</div>
                          <div className="legend-value">${segment.value}</div>
                          <div className="legend-percentage">{segment.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mini-bar-chart">
                  <h3>Top Expenses</h3>
                  <div className="bar-container">
                    {pieChartData.slice(0, 5).map((category, index) => (
                      <div key={index} className="bar-row">
                        <div className="bar-label">
                          <span className="bar-icon">{category.icon}</span>
                          <span className="bar-text">{category.name}</span>
                        </div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ 
                              '--width': `${category.value / Math.max(...pieChartData.map(c => c.value)) * 100}%`,
                              backgroundColor: category.color
                            }}
                          ></div>
                          <span className="bar-value">${category.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {showOptions && (
        <ExpenseModal
          showOptions={showOptions}
          closeMenu={closeMenu}
          items={items}
          addExpense={addExpense}
        />
      )}
    </div>
  )
}

// Data view component with CSV-style display
function DataView() {
  const { items } = useContext(ItemsContext)

  return (
    <div className="data-view">
      <div className="csv-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Icon</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.icon || '-'}</td>
                <td>{item.amount ? `$${item.amount}` : '-'}</td>
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
        Visualize
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
              <Route path="/" element={<VisualizationPage />} />
              <Route path="/data" element={<DataView />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ItemsContext.Provider>
  )
}

export default App
