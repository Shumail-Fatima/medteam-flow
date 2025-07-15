import  { createContext, useContext, type ReactNode } from "react";
import { useState } from "react";
import { getUserWithRole } from "../utils";

interface AuthUser{
    id: string;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
}
interface AuthContextType{
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string , password: string) => boolean;
    logout: () => void;
    isAdmin: boolean;
    isDoctor: boolean;
    isNurse: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string) => {
    const foundUser = getUserWithRole(email);
    if (foundUser && foundUser.password === password) {
        setUser({ ...foundUser });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        //isAdmin: user ? user.roleId === 1 : false, // assuming roleId 1 is admin
        isAdmin: user ? user.roleName === 'admin' : false,
        isDoctor: user ? user.roleName === 'doctor' : false,
        isNurse: user ? user.roleName === 'nurse' : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};