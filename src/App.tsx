import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginFormPage from './pages/LoginFormPage';
import DashboardPage from './pages/DashboardPage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginFormPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;