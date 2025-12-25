import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Arena from './pages/Arena'
import Victory from './pages/Victory'

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="min-h-screen coliseum-bg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/arena/:roomCode" element={<Arena />} />
            <Route path="/victory/:roomCode" element={<Victory />} />
          </Routes>
        </div>
      </GameProvider>
    </BrowserRouter>
  )
}

export default App
