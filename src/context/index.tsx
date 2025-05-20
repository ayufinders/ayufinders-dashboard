"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: string|null,
  name: string|null,
  email: string|null,
  loggedIn: boolean,
  access: 'full'|'limited'|null,
  subjectId: string|null,
  subjectName: string|null,
  year: string|null,
}
type AppContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  selectedYear: string | null;
  setSelectedYear: React.Dispatch<React.SetStateAction<string | null>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppWrapper = ({children}: {children: React.ReactNode}) => {
  
  const defaultUser: User = {
    id: null,
    name: null,
    email: null,
    loggedIn: false,
    access: null,
    subjectId: null,
    subjectName: null,
    year: null,
  }

 // Load stored values on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedYear = localStorage.getItem("selectedYear");
    if (storedYear) {
      setSelectedYear(storedYear);
    }

    setIsInitialized(true);
  }, []);
  
  const [user, setUser] = useState<User>(defaultUser);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Save selectedYear to localStorage when it changes
  useEffect(() => {
    if (selectedYear) {
      localStorage.setItem("selectedYear", selectedYear);
    }
  }, [selectedYear]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      selectedYear,
      setSelectedYear
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
