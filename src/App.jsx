import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ExplorePage from './pages/ExplorePage'
import EventsPage from './pages/EventsPage'
import ComparePage from './pages/ComparePage'
import SourcesPage from './pages/SourcesPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-base-900">
      <Header />
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  )
}
