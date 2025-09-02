import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  // subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {/* <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography> */}
    </Box>
  );
};

export default PageHeader; 