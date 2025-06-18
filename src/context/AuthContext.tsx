import React, { createContext } from "react";
import users from '../data/Users.json'

interface AuthUser{
    id: number;
    name: string;
    email: string;
    roleId: number;
}

interface AuthContextType{
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string , password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

