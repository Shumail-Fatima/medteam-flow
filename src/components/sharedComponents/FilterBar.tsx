import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  type BoxProps,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
} from '@mui/icons-material';
import { SearchFilterbox } from '../SearchFilterbox';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'search' | 'select' | 'date' | 'text';
  options?: FilterOption[];
  placeholder?: string;
  width?: number | string;
  startIcon?: React.ReactElement;
}

export interface FilterBarProps extends BoxProps {
  filters: FilterField[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  showFilterIcon?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onFilterChange,
  onClearFilters,
  showClearButton = true,
  showFilterIcon = true,
  sx = {},
  ...boxProps
}) => {
  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Clear all filters by setting them to empty strings
      filters.forEach(filter => {
        onFilterChange(filter.key, '');
      });
    }
  };

  const hasActiveFilters = Object.values(values).some(value => value !== '');

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        mb: 3,
        ...sx,
      }}
      {...boxProps}
    >
      {showFilterIcon && (
        <FilterList color="action" sx={{ mr: 1 }} />
      )}
      
      {filters.map((filter) => {
        const value = values[filter.key] || '';
        
        switch (filter.type) {
          case 'search':
            return (
              <SearchFilterbox
                key={filter.key}
                value={value}
                onChange={(newValue) => onFilterChange(filter.key, newValue)}
                placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              />
            );
            
          case 'select':
            return (
              <FormControl
                key={filter.key}
                size="small"
                sx={{ 
                  minWidth: filter.width || 200,
                  width: filter.width || 250 
                }}
              >
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={value}
                  label={filter.label}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                >
                  <MenuItem value="">All {filter.label}</MenuItem>
                  {filter.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
            
          case 'date':
            return (
              <TextField
                key={filter.key}
                label={filter.label}
                type="datetime-local"
                value={value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: filter.startIcon && (
                    <InputAdornment position="start">
                      {filter.startIcon}
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ width: filter.width || 250 }}
              />
            );
            
          case 'text':
            return (
              <TextField
                key={filter.key}
                label={filter.label}
                value={value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                size="small"
                sx={{ width: filter.width || 200 }}
                InputProps={{
                  startAdornment: filter.startIcon && (
                    <InputAdornment position="start">
                      {filter.startIcon}
                    </InputAdornment>
                  ),
                }}
              />
            );
            
          default:
            return null;
        }
      })}
      
      {showClearButton && hasActiveFilters && (
        <Tooltip title="Clear all filters">
          <IconButton
            onClick={handleClearFilters}
            size="small"
            color="primary"
          >
            <Clear />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default FilterBar;
