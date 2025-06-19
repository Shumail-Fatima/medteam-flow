import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginFormPage from './pages/LoginFormPage';
import DashboardPage from './pages/DashboardPage';
import AdminUserManagement from './pages/AdminUserManagement';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginFormPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/user-management" element={<AdminUserManagement />} />
      </Routes>
    </Router>
  );
}

export default App;