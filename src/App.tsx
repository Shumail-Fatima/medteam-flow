import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import LoginFormPage from './pages/LoginFormPage';
import AdminUserManagement from './pages/AdminUserManagement';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminTaskManagement from './pages/AdminTaskManagement';
import Appointment from './pages/Appointment';
import AdminSupport from './pages/AdminSupport';
import AdminSettings from './pages/AdminSettings';
import DashboardPage from './pages/DashboardPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginFormPage />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute> <Outlet /> </ProtectedRoute>}>
          {/* Optionally wrap with Layout 
          <Route element={<Layout> <Outlet /> </Layout>}></Route>*/}
            <Route path='/dashboard' element={<DashboardPage/>}/>
            <Route path="/admin/user-management" element={<AdminUserManagement />} />
            <Route path="/task-management" element={<AdminTaskManagement />} />
            <Route path="/Appointment" element={<Appointment />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/support" element={<AdminSupport />} />
            {/* Add more nested protected routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;