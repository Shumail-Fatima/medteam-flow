import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';

interface column<T> {
    header: String;
    //id: string;
    render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: column<T>[];
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    showEdit?: (item: T) => boolean;
    showDelete?: (item: T) => boolean;
}

function DataTable<T extends { id: string }>({ data, columns, onView, onEdit, onDelete, showEdit, showDelete }: DataTableProps<T>) {
  return (
    <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} sx={{ color: 'white', fontWeight: 'bold' }}>{col.header}</TableCell>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((col, idx) => (
                  <TableCell key={idx}>{col.render(item)}</TableCell>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableCell>
                    {onView && (
                      <IconButton onClick={() => onView(item)} color="info"><Visibility /></IconButton>
                    )}
                    {onEdit && (!showEdit || showEdit(item)) && (
                      <IconButton onClick={() => onEdit(item)} color="primary"><Edit /></IconButton>
                    )}
                    {onDelete && (!showDelete || showDelete(item)) &&(
                      <IconButton onClick={() => onDelete(item)} color="error"><Delete /></IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DataTable;

