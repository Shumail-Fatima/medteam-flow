// components/Sidebar.tsx

import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

const categories = ['Doctor', 'Admin', 'Nurse'];

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: 250,
        height: '100vh',
        bgcolor: 'primary.main', // MUI theme primary color (usually blue)
        color: 'white',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Categories
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem key={category} disablePadding>
            <ListItemButton>
              <ListItemText primary={category} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
