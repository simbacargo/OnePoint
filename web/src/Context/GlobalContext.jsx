"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

// Initial state for user, language, and theme
const initialState = {
  user: null,
  language: 'en',  // Default to English
  theme: 'light',  // Default to light theme
};

// Create context
const GlobalContext = createContext();

// Provider component
export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(initialState.user);
  const [language, setLanguage] = useState(initialState.language);
  const [theme, setTheme] = useState(initialState.theme);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(false);

  // UseEffect to persist language and theme in localStorage (optional)
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    const savedUser = JSON.parse(localStorage.getItem('user'));

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
    if (savedUser) setUser(savedUser);
  }, []);

  // Update language and theme in localStorage
  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <GlobalContext.Provider
      value={{
       showNavbar, setShowNavbar,
       showSidebar, setShowSidebar,
       isLoggedIn, setisLoggedIn
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to access global state
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
