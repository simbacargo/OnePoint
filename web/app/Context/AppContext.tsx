import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactElement;
};

export function AuthProvider({ children }: AuthProviderProps) {
  // In AppContext.tsx
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("msaidizi_user");
        // Check if it's null OR the common "broken" string
        if (!savedUser || savedUser === "[object Object]") {
          return null;
        }
        const the_user = JSON.parse(savedUser);
        setUser(the_user);
        setIsAuthenticated(true);
        return the_user;
      } catch (e) {
        console.error("Auth initialization error", e);
        // localStorage.removeItem("msaidizi_user"); // Clean up the mess
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };


  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    alert(accessToken);
    const savedUser = localStorage.getItem("msaidizi_user");
    if (accessToken && savedUser) {
      try {
        const the_user = JSON.parse(savedUser);
        setUser(the_user);
        setIsAuthenticated(true);
        setAccessToken(accessToken);
      } catch (e) {
        console.error("Auth effect error", e);
        localStorage.removeItem("msaidizi_user");
        localStorage.removeItem("access_token");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export let useAuth = () => useContext(AuthContext);
