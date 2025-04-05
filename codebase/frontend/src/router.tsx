import NotFound from './pages/notefound/NotFound';
import React from 'react';
import { createBrowserRouter } from "react-router-dom";


export const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFound />,
  },
]);