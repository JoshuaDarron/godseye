import Globe from './components/Globe/Globe'
import Sidebar from './components/HUD/Sidebar'
import SatelliteTooltip from './components/HUD/SatelliteTooltip'
import SatelliteDetailPanel from './components/HUD/SatelliteDetailPanel'

function App() {
  return (
    <div className="relative w-full h-full bg-black">
      <Globe />
      <Sidebar />
      <SatelliteTooltip />
      <SatelliteDetailPanel />
    </div>
  )
}

export default App
