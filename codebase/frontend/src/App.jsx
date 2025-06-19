import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import authService from './services/auth.service';

const App = () => {
  useEffect(() => {
    // Setup axios interceptors globally when app starts
    authService.setupAxiosInterceptors();
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
