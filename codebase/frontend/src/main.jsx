
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";


const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <React.Suspense fallback="Loading ...">
        <RouterProvider router={router} />
      </React.Suspense>
    </React.StrictMode>
  );
}

