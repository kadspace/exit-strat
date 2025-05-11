import { useState, createContext, useContext, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Create context for sharing items state
const ItemsContext = createContext()

// Icons for expense categories
const expenseIcons = [
  { id: 'car', label: 'Car Insurance', icon: '🚗', defaultAmount: 200 },
  { id: 'groceries', label: 'Groceries', icon: '🛒', defaultAmount: 300 },
  { id: 'utilities', label: 'Utilities', icon: '💡', defaultAmount: 150 },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', defaultAmount: 80 },
  { id: 'rent', label: 'Rent', icon: '🏠', defaultAmount: 1200 },
  { id: 'dining', label: 'Dining', icon: '🍽️', defaultAmount: 100 },
  { id: 'health', label: 'Healthcare', icon: '⚕️', defaultAmount: 150 },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', defaultAmount: 120 }
]

// Landing page component with + button
function LandingPage() {
  const { items, setItems } = useContext(ItemsContext)
  const [showOptions, setShowOptions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const menuRef = useRef(null)
  const landingPageRef = useRef(null)
  
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
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && menuRef.current && 
          !menuRef.current.contains(event.target) && 
          !event.target.closest('.add-button')) {
        closeMenu()
      }
    }
    
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    setSelectedIcon(null)
    setSearchTerm('')
  }
  
  const closeMenu = () => {
    setShowOptions(false)
    setSelectedIcon(null)
    setSearchTerm('')
  }
  
  const selectIcon = (icon) => {
    setSelectedIcon(icon)
  }
  
  const addExpense = () => {
    if (!selectedIcon) return;
    
    // Get random position in grid layout
    const gridPositions = generateGridPositions(items.length)
    
    const newItem = {
      id: Date.now(),
      name: selectedIcon.label,
      icon: selectedIcon.icon,
      amount: selectedIcon.defaultAmount,
      date: new Date().toLocaleString(),
      position: gridPositions
    }
    setItems([...items, newItem])
    setSelectedIcon(null)
  }
  
  // Generate grid-based positions for new items
  const generateGridPositions = (index) => {
    const gridSize = 200; // Size of each grid cell
    const cols = Math.floor((landingPageRef.current?.clientWidth || 800) / gridSize) || 3;
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: col * gridSize + 20,
      y: row * gridSize + 100
    };
  }

  // Filter icons based on search term
  const filteredIcons = expenseIcons.filter(icon => 
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Handle drag start
  const handleDragStart = (e, item) => {
    setActiveItem(item)
    
    // Prevent default drag ghost image
    const ghostImage = new Image()
    ghostImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(ghostImage, 0, 0)
    
    const element = e.currentTarget
    const rect = element.getBoundingClientRect()
    
    // Store offset from mouse to element corner
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    element.dataset.offsetX = offsetX
    element.dataset.offsetY = offsetY
    
    element.classList.add('dragging')
  }
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault()
    
    if (!activeItem) return
    
    const element = document.querySelector(`.expense-item[data-id="${activeItem.id}"]`)
    if (!element) return
    
    // Get the offset values we stored in dragStart
    const offsetX = Number(element.dataset.offsetX) || 0
    const offsetY = Number(element.dataset.offsetY) || 0
    
    // Calculate new position
    const containerRect = landingPageRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left - offsetX
    const y = e.clientY - containerRect.top - offsetY
    
    // Update element position visually first (for smooth movement)
    element.style.transform = `translate(${x}px, ${y}px)`
  }
  
  // Handle drag end
  const handleDragEnd = (e) => {
    e.preventDefault()
    
    if (!activeItem) return
    
    const element = document.querySelector(`.expense-item[data-id="${activeItem.id}"]`)
    if (!element) return
    
    element.classList.remove('dragging')
    
    // Get the offset values we stored in dragStart
    const offsetX = Number(element.dataset.offsetX) || 0
    const offsetY = Number(element.dataset.offsetY) || 0
    
    // Calculate final position
    const containerRect = landingPageRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left - offsetX
    const y = e.clientY - containerRect.top - offsetY
    
    // Update the item's position in state
    const newItems = items.map(item => {
      if (item.id === activeItem.id) {
        return {
          ...item,
          position: { x, y }
        }
      }
      return item
    })
    
    setItems(newItems)
    setActiveItem(null)
  }
  
  return (
    <div className="landing-page" ref={landingPageRef}>
      <h1>Expense Tracker</h1>
      
      <div className="expense-items-container" 
           onDragOver={handleDragOver}>
        {items.map(item => (
          <div 
            key={item.id}
            data-id={item.id}
            className="expense-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            style={{
              transform: `translate(${item.position.x}px, ${item.position.y}px)`
            }}
          >
            <div className="expense-item-icon">{item.icon}</div>
            <div className="expense-item-details">
              <div className="expense-item-name">{item.name}</div>
              <div className="expense-item-amount">${item.amount}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`add-button-container ${showOptions ? 'menu-open' : ''}`}>
        <button 
          className="add-button"
          onClick={toggleOptions}
          aria-label={showOptions ? "Close menu" : "Add expense"}
        >
          +
        </button>
      </div>
      
      {showOptions && (
        <>
          <div className="expense-menu-layout" ref={menuRef}>
            <div className="menu-close-button" onClick={closeMenu}>
              <span>×</span>
            </div>
            
            <div className="expense-options">
              <div className="expense-search">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
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
                    onClick={addExpense}
                  >
                    Add Expense
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="backdrop" onClick={closeMenu}></div>
        </>
      )}
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
