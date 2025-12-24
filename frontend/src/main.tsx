import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Previsoes from "./pages/Previsoes";
import EditarProduto from "./pages/produto/EditarProduto";
import CriarProduto from "./pages/produto/CriarProduto";
import Produto from "./pages/produto/Produto";
import Dashboard from "./pages/Dashboard";
import ImportarCSV from "./pages/produto/ImportarCSV";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "previsoes",
        element: <Previsoes />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "produto",
        element: <Produto />,
      },
      {
        path: "produto/importar",
        element: <ImportarCSV />,
      },
      {
        path: "produto/adicionar",
        element: <CriarProduto />,
      },
      {
        path: "produto/editar/:id",
        element: <EditarProduto />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="text-center p-10">404 - Página não encontrada</div>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
