import React from "react";
import { TextField } from "@mui/material";

interface SearchFilterboxProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minWidth?: number;
    width?: number | string;
}

export const SearchFilterbox: React.FC<SearchFilterboxProps> = ({
    label = 'Filter by Name or Email',
    value,
    onChange,
    placeholder = 'Enter name to search...',
    minWidth = 200,
    width = 250,}) => {
        return(
            <TextField
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                placeholder={placeholder}
                sx={{ minWidth, width }}
            />
        )
    }