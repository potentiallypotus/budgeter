import {Routes, Route} from 'react-router-dom'
import {useState} from 'react'
import Sidebar from './components/sidebar'
import Overview from './pages/overview'
import Expenses from './pages/expenses'
import Withdrawals from './pages/withdrawals'

import './App.css'


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Hero */}
      <header className="bg-blue-400 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-gray-300"
        >
          {/* simple hamburger icon using divs, swap for an icon library later if you like */}
          <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-700"></div>
        </button>
        <h1 className="text-xl font-bold">Budget Tracker</h1>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App