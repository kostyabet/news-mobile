import { createContext } from "react";

export interface AuthContextData {
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (login: string, pass: string) => Promise<void>;
  signUp: (login: string, password: string, role: number) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);
