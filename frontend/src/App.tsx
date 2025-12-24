import {
  HardDriveUpload,
  LayoutDashboard,
  PackageSearch,
  TrendingUp,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import "./index.css";

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Projeção App</h1>
        </div>
        <nav className="mt-6">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            <LayoutDashboard className="mr-3 w-5" /> Dashboard
          </Link>
          <Link
            to="/previsoes"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            <TrendingUp className="mr-3 w-5" /> Previsões
          </Link>
          <Link
            to="/produto"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            <PackageSearch className="mr-3 w-5" /> Produto
          </Link>
          <Link
            to="/produto/importar"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            <HardDriveUpload className="mr-3 w-5" /> Importar Dados
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
