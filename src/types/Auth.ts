export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
  roleName: string;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface UserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number ;
}