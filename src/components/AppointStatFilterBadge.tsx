import React from 'react';
import { Stack, Chip, Badge } from '@mui/material';

type FilterType = 'all' | 'upcoming' | 'previous';

interface AppointmentFilterChipsProps {
  filter: FilterType;
  onChange: (newFilter: FilterType) => void;
}

const filterOptions: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Previous', value: 'previous' },
];

export const AppointmentFilterChips: React.FC<AppointmentFilterChipsProps> = ({ filter, onChange }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      {filterOptions.map(({ label, value }) => (
        <Badge key={value} color={filter === value ? 'primary' : 'default'}>
          <Chip
            label={label}
            color={filter === value ? 'primary' : 'default'}
            onClick={() => onChange(value)}
            clickable
          />
        </Badge>
      ))}
    </Stack>
  );
};
