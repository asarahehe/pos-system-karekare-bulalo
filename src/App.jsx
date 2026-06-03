import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-iris-80 min-h-screen p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Jose Kare-Kare Bulalo POS System</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-lg text-gray-700 mb-4">Welcome to your Point of Sale System</p>
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-wine-100 hover:bg-wine-80 text-white font-bold py-2 px-4 rounded"
          >
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
