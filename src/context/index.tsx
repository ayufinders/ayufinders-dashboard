"use client"
import React, { createContext, useContext, useState } from 'react'

type User = {
  id: string|null,
  name: string|null,
  email: string|null,
  loggedIn: boolean,
  access: 'full'|'limited'|null
}
type AppContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppWrapper = ({children}: {children: React.ReactNode}) => {
  // Load user data from Local Storage on initial render
  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {
      id: null,
      name: null,
      email: null,
      loggedIn: false,
      access: null
    };
  };

  const [user, setUser] = useState<User>(loadUserFromLocalStorage);
  return (
    <AppContext.Provider value={{
      user,
      setUser
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useUserContext must be used within an AppWrapper');
  }
  return context;
}