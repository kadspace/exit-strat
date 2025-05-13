import { useState, createContext, useContext, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Create context for sharing items state
const ItemsContext = createContext()

// Icons for expense categories
const expenseIcons = [
  { id: 'car', label: 'Car Insurance', icon: '🚗', defaultAmount: 200, color: '#FF6B6B', category: 'Transportation' },
  { id: 'groceries', label: 'Groceries', icon: '🛒', defaultAmount: 300, color: '#4ECDC4', category: 'Food' },
  { id: 'utilities', label: 'Utilities', icon: '💡', defaultAmount: 150, color: '#FFD166', category: 'Housing' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', defaultAmount: 80, color: '#6B5B95', category: 'Leisure' },
  { id: 'rent', label: 'Rent', icon: '🏠', defaultAmount: 1200, color: '#88D8B0', category: 'Housing' },
  { id: 'dining', label: 'Dining', icon: '🍽️', defaultAmount: 100, color: '#FF8C94', category: 'Food' },
  { id: 'health', label: 'Healthcare', icon: '⚕️', defaultAmount: 150, color: '#7AC7D3', category: 'Health' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', defaultAmount: 120, color: '#F8A055', category: 'Personal' }
]

// ExpenseModal component
function ExpenseModal({ showOptions, closeMenu, items, addExpense }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [customMode, setCustomMode] = useState(false)
  const [customExpense, setCustomExpense] = useState({
    name: '',
    icon: '💰',
    defaultAmount: 0,
    category: ''
  })
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
    setCustomMode(false)
  }
  
  const handleAddExpense = () => {
    if (customMode) {
      if (!customExpense.name || customExpense.defaultAmount <= 0) return
      
      // Create a random color for custom expense
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      
      const finalCustomExpense = {
        id: `custom-${Date.now()}`,
        label: customExpense.name,
        icon: customExpense.icon,
        defaultAmount: Number(customExpense.defaultAmount),
        color: randomColor,
        category: customExpense.category || 'Uncategorized'
      }
      
      addExpense(finalCustomExpense)
      setCustomMode(false)
      setCustomExpense({
        name: '',
        icon: '💰',
        defaultAmount: 0,
        category: ''
      })
    } else if (selectedIcon) {
      addExpense(selectedIcon)
      setSelectedIcon(null)
    }
  }
  
  const switchToCustomMode = () => {
    setCustomMode(true)
    setSelectedIcon(null)
  }
  
  const handleCustomChange = (e) => {
    const { name, value } = e.target
    setCustomExpense({
      ...customExpense,
      [name]: value
    })
  }
  
  return (
    <>
      <div className="expense-menu-layout" ref={menuRef}>
        <div className="menu-close-button" onClick={closeMenu}>
          <span>×</span>
        </div>
        
        <div className="expense-options">
          {!customMode ? (
            <>
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
                
                <div 
                  className="expense-icon-item create-custom"
                  onClick={switchToCustomMode}
                >
                  <div className="expense-icon">+</div>
                  <div className="expense-label">Create Custom</div>
                </div>
              </div>
            </>
          ) : (
            <div className="custom-expense-form">
              <h2>Create Custom Expense</h2>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={customExpense.name}
                  onChange={handleCustomChange}
                  placeholder="Expense name"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Icon</label>
                <select 
                  name="icon" 
                  value={customExpense.icon}
                  onChange={handleCustomChange}
                >
                  <option value="💰">💰 Money</option>
                  <option value="🛒">🛒 Shopping</option>
                  <option value="🍔">🍔 Food</option>
                  <option value="🏠">🏠 Housing</option>
                  <option value="🚗">🚗 Transportation</option>
                  <option value="💼">💼 Business</option>
                  <option value="🏥">🏥 Healthcare</option>
                  <option value="✈️">✈️ Travel</option>
                  <option value="📚">📚 Education</option>
                  <option value="🎮">🎮 Entertainment</option>
                  <option value="💻">💻 Technology</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Amount</label>
                <div className="expense-input">
                  <span>$</span>
                  <input 
                    type="number" 
                    name="defaultAmount"
                    value={customExpense.defaultAmount} 
                    onChange={handleCustomChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={customExpense.category}
                  onChange={handleCustomChange}
                  placeholder="Category"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option value="Food" />
                  <option value="Housing" />
                  <option value="Transportation" />
                  <option value="Utilities" />
                  <option value="Personal" />
                  <option value="Health" />
                  <option value="Leisure" />
                  <option value="Education" />
                  <option value="Debt" />
                  <option value="Savings" />
                  <option value="Other" />
                </datalist>
              </div>
              
              <div className="custom-form-buttons">
                <button 
                  type="button" 
                  className="cancel-custom"
                  onClick={() => setCustomMode(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="add-custom"
                  onClick={handleAddExpense}
                >
                  Add Custom Expense
                </button>
              </div>
            </div>
          )}
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
          
          {selectedIcon && !customMode && (
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
      color: selectedIcon.color,
      category: selectedIcon.category || 'Uncategorized'
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
  const { items, setItems } = useContext(ItemsContext)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemData, setNewItemData] = useState({
    name: '',
    icon: '💰',
    amount: '',
    date: new Date().toLocaleString(),
    category: 'Uncategorized',
    color: '#888888'
  })
  
  // Function to update an item's value when it's edited
  const handleInlineEdit = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: field === 'amount' ? Number(value) : value };
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleNewItemChange = (event) => {
    const { name, value } = event.target
    setNewItemData({ ...newItemData, [name]: value })
  }

  const handleAddItemSubmit = (event) => {
    event.preventDefault();
    
    if (!newItemData.name || !newItemData.amount) {
      alert("Please enter at least a name and amount.");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newItemData.name,
      icon: newItemData.icon,
      amount: Number(newItemData.amount),
      date: newItemData.date,
      category: newItemData.category,
      color: newItemData.color
    }

    setItems([...items, newItem]);
    setNewItemData({
      name: '',
      icon: '💰',
      amount: '',
      date: new Date().toLocaleString(),
      category: 'Uncategorized',
      color: '#888888'
    });
    setShowAddForm(false);
  }

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  }

  return (
    <div className="data-view">
      <div className="data-header">
        <h1>Data View</h1>
        <button className="add-data-button" onClick={toggleAddForm}>
          {showAddForm ? 'Cancel' : 'Add New Expense'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-expense-form">
          <h2>Add New Expense</h2>
          <form onSubmit={handleAddItemSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                name="name"
                id="name"
                value={newItemData.name}
                onChange={handleNewItemChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="icon">Icon:</label>
              <select
                name="icon"
                id="icon"
                value={newItemData.icon}
                onChange={handleNewItemChange}
              >
                {expenseIcons.map(icon => (
                  <option key={icon.id} value={icon.icon}>
                    {icon.icon} {icon.label}
                  </option>
                ))}
                <option value="💰">💰 General</option>
                <option value="🛒">🛒 Shopping</option>
                <option value="🍔">🍔 Food</option>
                <option value="🏠">🏠 Housing</option>
                <option value="🚗">🚗 Transportation</option>
                <option value="💼">💼 Business</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount ($):</label>
              <input
                type="number"
                name="amount"
                id="amount"
                value={newItemData.amount}
                onChange={handleNewItemChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input
                type="text"
                name="category"
                id="category"
                value={newItemData.category}
                onChange={handleNewItemChange}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Food" />
                <option value="Housing" />
                <option value="Transportation" />
                <option value="Utilities" />
                <option value="Personal" />
                <option value="Health" />
                <option value="Leisure" />
                <option value="Education" />
                <option value="Debt" />
                <option value="Savings" />
                <option value="Other" />
              </datalist>
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">Add Expense</button>
              <button type="button" className="cancel-button" onClick={toggleAddForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="csv-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Icon</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleInlineEdit(item.id, 'name', e.target.value)}
                    className="editable-cell"
                  />
                </td>
                <td>
                  <select
                    value={item.icon}
                    onChange={(e) => handleInlineEdit(item.id, 'icon', e.target.value)}
                    className="editable-cell icon-select"
                  >
                    {expenseIcons.map(icon => (
                      <option key={icon.id} value={icon.icon}>
                        {icon.icon}
                      </option>
                    ))}
                    <option value="💰">💰</option>
                    <option value="🛒">🛒</option>
                    <option value="🍔">🍔</option>
                    <option value="🏠">🏠</option>
                    <option value="🚗">🚗</option>
                    <option value="💼">💼</option>
                    <option value="🏥">🏥</option>
                    <option value="✈️">✈️</option>
                    <option value="📚">📚</option>
                    <option value="🎮">🎮</option>
                    <option value="💻">💻</option>
                  </select>
                </td>
                <td>
                  <div className="amount-input-container">
                    <span>$</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleInlineEdit(item.id, 'amount', e.target.value)}
                      className="editable-cell amount-input"
                    />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    value={item.category || 'Uncategorized'}
                    onChange={(e) => handleInlineEdit(item.id, 'category', e.target.value)}
                    className="editable-cell"
                    list="category-suggestions"
                  />
                </td>
                <td>{item.date}</td>
                <td className="action-buttons">
                  <button type="button" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </td>
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
