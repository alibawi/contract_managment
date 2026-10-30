import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import Health from './pages/Health'
import Home from './pages/Home'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/health" element={<Health />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppLayout>
  )
}
