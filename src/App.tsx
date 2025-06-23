import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import LoginFormPage from './pages/LoginFormPage';
import AdminUserManagement from './pages/AdminUserManagement';
import ProtectedRoute from './components/ProtectedRoutes';
import Layout from './components/Layout'; // If you have a layout
//import { Dashboard } from '@mui/icons-material';
import AdminTaskManagement from './pages/AdminTaskManagement';
import AdminReports from './pages/AdminReports';
import AdminSupport from './pages/AdminSupport';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginFormPage />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute> <Outlet /> </ProtectedRoute>}>
          {/* Optionally wrap with Layout */}
          <Route element={<Layout> <Outlet /> </Layout>}>
            <Route path="/admin/user-management" element={<AdminUserManagement />} />
            <Route path="/admin/task-management" element={<AdminTaskManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            {/* Add more nested protected routes here */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;