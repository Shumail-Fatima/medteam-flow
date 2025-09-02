import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import FilterBar from '../sharedComponents/FilterBar';
import { AppointmentFilterChips } from '../AppointStatFilterBadge';
import type { AppointmentFilters, FilterType } from '../../hooks/useAppointmentFiltering';

export interface AppointmentFiltersProps {
  filters: AppointmentFilters;
  filterOptions: {
    statuses: Array<{ value: string; label: string }>;
    doctors: Array<{ value: string; label: string }>;
    patients: Array<{ value: string; label: string }>;
  };
  onFilterChange: (key: keyof AppointmentFilters, value: string | FilterType) => void;
  onClearFilters: () => void;
}

export const AppointmentFiltersComponent: React.FC<AppointmentFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters
}) => {
  const filterFields = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search appointments...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: filterOptions.statuses,
    },
    {
      key: 'doctor',
      label: 'Doctor',
      type: 'select' as const,
      options: filterOptions.doctors,
    },
    {
      key: 'patient',
      label: 'Patient',
      type: 'select' as const,
      options: filterOptions.patients,
    },
    {
      key: 'date',
      label: 'Follow-up Date',
      type: 'date' as const,
      startIcon: <Schedule />,
    },
  ];

  return (
    <Box>
      {/* Filter Type Chips */}
      <AppointmentFilterChips 
        filter={filters.filterType} 
        onChange={(value) => onFilterChange('filterType', value as FilterType)} 
      />
      
      {/* Filter Bar */}
      <FilterBar
        filters={filterFields}
        values={Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => typeof value === 'string')
        ) as Record<string, string>}
        onFilterChange={(key, value) => onFilterChange(key as keyof AppointmentFilters, value)}
        onClearFilters={onClearFilters}
        sx={{ mb: 2 }}
      />
    </Box>
  );
};

export default AppointmentFiltersComponent;
