import ScreenStreamProvider from "./components/ScreenStreamProvider"
import MonitoringService from "./components/MonitoringService"
import ExamPage from "./pages/ExamPage"

function App() {
  return (
    <ScreenStreamProvider>
      <MonitoringService />
      <ExamPage />
    </ScreenStreamProvider>
  )
}

export default App