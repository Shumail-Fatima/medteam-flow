import { useState, useMemo, useCallback } from 'react';

export interface FilterOptions {
  search?: string;
  role?: string;
  status?: string;
  date?: string;
  assignee?: string;
  patient?: string;
  doctor?: string;
}

export interface UseDataFilteringProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterConfig?: {
    roleField?: keyof T;
    statusField?: keyof T;
    dateField?: keyof T;
    assigneeField?: keyof T;
    patientField?: keyof T;
    doctorField?: keyof T;
  };
  customFilters?: (item: T, filters: FilterOptions) => boolean;
}

export const useDataFiltering = <T>({
  data,
  searchFields,
  filterConfig = {},
  customFilters
}: UseDataFilteringProps<T>) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchValue = filters.search.toLowerCase();
        const hasMatch = searchFields.some(field => {
          const fieldValue = item[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchValue);
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(searchValue);
          }
          return false;
        });
        if (!hasMatch) return false;
      }

      // Role filter
      if (filters.role && filterConfig.roleField) {
        const itemRole = item[filterConfig.roleField];
        if (typeof itemRole === 'string' && itemRole.toLowerCase() !== filters.role.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filterConfig.statusField) {
        const itemStatus = item[filterConfig.statusField];
        if (typeof itemStatus === 'string' && itemStatus.toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
      }

      // Date filter
      if (filters.date && filterConfig.dateField) {
        const itemDate = item[filterConfig.dateField];
        if (typeof itemDate === 'string') {
          const filterDate = new Date(filters.date);
          const itemDateObj = new Date(itemDate);
          if (itemDateObj.toDateString() !== filterDate.toDateString()) {
            return false;
          }
        }
      }

      // Assignee filter
      if (filters.assignee && filterConfig.assigneeField) {
        const itemAssignee = item[filterConfig.assigneeField];
        if (typeof itemAssignee === 'string' && itemAssignee !== filters.assignee) {
          return false;
        }
      }

      // Patient filter
      if (filters.patient && filterConfig.patientField) {
        const itemPatient = item[filterConfig.patientField];
        if (typeof itemPatient === 'string' && itemPatient !== filters.patient) {
          return false;
        }
      }

      // Doctor filter
      if (filters.doctor && filterConfig.doctorField) {
        const itemDoctor = item[filterConfig.doctorField];
        if (typeof itemDoctor === 'string' && itemDoctor !== filters.doctor) {
          return false;
        }
      }

      // Custom filters
      if (customFilters && !customFilters(item, filters)) {
        return false;
      }

      return true;
    });
  }, [data, filters, searchFields, filterConfig, customFilters]);

  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearFilter = useCallback((key: keyof FilterOptions) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    filteredData,
    updateFilter,
    clearFilters,
    clearFilter,
  };
};
