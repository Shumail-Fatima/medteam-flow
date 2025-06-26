import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export interface TabOption {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
}

interface CustomTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: TabOption[];
  sx?: object;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ value, onChange, tabs, sx }) => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, ...sx }}>
    <Tabs value={value} onChange={onChange}>
      {tabs.map((tab, idx) => (
        <Tab
          key={tab.value ?? tab.label}
          label={tab.label}
          icon={React.isValidElement(tab.icon) ? tab.icon : undefined}
          iconPosition={React.isValidElement(tab.icon) ? 'start' : undefined}
          {...(tab.value !== undefined ? { value: tab.value } : {})}
        />
      ))}
    </Tabs>
  </Box>
);

export default CustomTabs;