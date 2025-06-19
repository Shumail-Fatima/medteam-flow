import { Typography } from '@mui/material';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, padding: 20 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
      </div>
      {/* Rest of dashboard content */}
    </div>
  );
};

export default DashboardPage;