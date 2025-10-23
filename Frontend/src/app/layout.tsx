import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerenciamento de Estoque",
  description: "Feito pela equipe da Bonten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="hover:text-blue-200">
                  Cadastrar Produto
                </Link>
              </li>
              <li>
                <Link href="/EditarProduto" className="hover:text-blue-200">
                  Editar Produto
                </Link>
              </li>
              <li>
                <Link href="/Previsoes" className="hover:text-blue-200">
                  Previsões
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4">
          <div className="container mx-auto text-center">
            <p>© 2025 Cadastro de Produtos</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
