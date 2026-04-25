import './App.css'
import Sidebar from './components/Sidebar'
import { useState, useCallback } from 'react'
import { DEFAULT_CONFIG } from './types'
import type { JellysplashConfig, ImageItem } from './types'

function App() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [config, setConfig] = useState<JellysplashConfig>(DEFAULT_CONFIG)
  const patchConfig = useCallback((patch: Partial<JellysplashConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }))
  }, [])

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
      <Sidebar config={config} onChange={patchConfig} images={images} onImagesChange={setImages} />
      <main className="app-canvas">Canvas</main>
    </div>
  )
}

export default App
