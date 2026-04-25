import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span>Jellysplash</span>
        <div>
          <button type="button">Settings</button>
          <button type="button">Randomise</button>
          <button type="button">Export</button>
        </div>
      </header>
      <Sidebar />
      <main className="app-canvas">Canvas</main>
    </div>
  )
}

export default App
