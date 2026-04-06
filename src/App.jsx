import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Result from './pages/Result.jsx';
import Appointment from './pages/Appointment.jsx';
import Medicines from './pages/Medicines.jsx';
import VideoCall from './pages/VideoCall.jsx';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/result" element={<Result />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/video-call" element={<VideoCall />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
