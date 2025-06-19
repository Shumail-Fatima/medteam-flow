import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginFormPage from './pages/LoginFormPage';
import DashboardPage from './pages/DashboardPage';
import AdminUserManagement from './pages/AdminUserManagement';
import ProtectedRoute from './components/ProtectedRoutes';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginFormPage />} />

        <Route 
        path='/admin/user-management'
        element={
          <ProtectedRoute>
            <AdminUserManagement />
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;