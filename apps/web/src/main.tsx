import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import SessionRoot from "./auth/SessionRoot.tsx";
import { queryClient } from "./query-client.ts";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <SessionRoot /> },
  {
    path: "*",
    element: (
      <main>
        <h1>Página no encontrada</h1>
        <p>La dirección no corresponde a una pantalla del taller.</p>
        <Link to="/">Volver a las órdenes</Link>
      </main>
    ),
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("Falta el elemento #root en index.html.");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
