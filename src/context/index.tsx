"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'

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
  
  const defaultUser: User = {
    id: null,
    name: null,
    email: null,
    loggedIn: false,
    access: null
  }

  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsInitialized(true);

  }, [])
  
  const [user, setUser] = useState<User>(defaultUser);
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <AppContext.Provider value={{
      user,
      setUser
    }}>
      {isInitialized ? children : null}
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