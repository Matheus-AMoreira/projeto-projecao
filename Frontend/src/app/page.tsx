'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expirationDate: '',
    quantity: '',
    purchasePrice: '',
    purchaseCurrency: 'BRL',
    salePrice: '',
    saleCurrency: 'BRL',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const productsPerPage = 10;

  const fetchProducts = async (page: number, search: string) => {
    try {
      const response = await fetch(`/api/produtos?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / productsPerPage));
      } else {
        setSubmitStatus(`Erro ao carregar produtos: ${data.error}`);
      }
    } catch (error) {
      setSubmitStatus('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePrice = (price: string, currency: string) => {
    if (!price) return currency === 'BRL' ? 'Preço de compra é obrigatório' : 'Purchase price is required';
    
    const brlRegex = /^\d+(,\d{0,2})?$/;
    const usdRegex = /^\d+(\.\d{0,2})?$/;
    
    if (currency === 'BRL' && !brlRegex.test(price)) {
      return 'Formato inválido. Use vírgula para Reais (ex.: 10,50)';
    }
    if (currency === 'USD' && !usdRegex.test(price)) {
      return 'Invalid format. Use dot for Dollars (ex.: 10.50)';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!formData.name) newErrors.name = 'Nome do produto é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    const purchasePriceError = validatePrice(formData.purchasePrice, formData.purchaseCurrency);
    if (purchasePriceError) newErrors.purchasePrice = purchasePriceError;

    if (formData.salePrice) {
      const salePriceError = validatePrice(formData.salePrice, formData.saleCurrency);
      if (salePriceError) newErrors.salePrice = salePriceError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus('');
      return;
    }

    const formattedData = {
      name: formData.name,
      category: formData.category,
      expirationDate: formData.expirationDate || null,
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchaseCurrency === 'BRL' 
        ? formData.purchasePrice.replace(',', '.') 
        : formData.purchasePrice),
      purchaseCurrency: formData.purchaseCurrency,
      salePrice: formData.salePrice 
        ? Number(formData.saleCurrency === 'BRL' 
          ? formData.salePrice.replace(',', '.') 
          : formData.salePrice) 
        : null,
      saleCurrency: formData.salePrice ? formData.saleCurrency : null,
    };

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setSubmitStatus('Produto cadastrado com sucesso!');
        setFormData({
          name: '',
          category: '',
          expirationDate: '',
          quantity: '',
          purchasePrice: '',
          purchaseCurrency: 'BRL',
          salePrice: '',
          saleCurrency: 'BRL',
        });
        setErrors({});
        setCurrentPage(1);
        fetchProducts(1, searchTerm);
      } else {
        const errorData = await response.json();
        setSubmitStatus(`Erro: ${errorData.error}`);
      }
    } catch (error) {
      setSubmitStatus('Erro ao conectar com o servidor');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price || !currency) return '-';
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Formulário de Cadastro</h2>
        
        {submitStatus && (
          <div className={`p-4 mb-4 rounded ${submitStatus.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {submitStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome do Produto
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
              Data de Expiração (Opcional)
            </label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              min="2025-04-28"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.expirationDate && <p className="text-red-500 text-sm mt-1">{errors.expirationDate}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantidade
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
              Preço de Compra
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder={formData.purchaseCurrency === 'BRL' ? 'Ex.: 10,50' : 'Ex.: 10.50'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <select
                id="purchaseCurrency"
                name="purchaseCurrency"
                value={formData.purchaseCurrency}
                onChange={handleChange}
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD (US$)</option>
              </select>
            </div>
            {errors.purchasePrice && (
              <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
              Preço de Venda (Opcional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="salePrice"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder={formData.saleCurrency === 'BRL' ? 'Ex.: 15,00' : 'Ex.: 15.00'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <select
                id="saleCurrency"
                name="saleCurrency"
                value={formData.saleCurrency}
                onChange={handleChange}
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD (US$)</option>
              </select>
            </div>
            {errors.salePrice && <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Cadastrar Produto
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-screen mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Produtos Cadastrados</h2>

        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Tabela de Produtos */}
        {products.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Expiração</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço de Compra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço de Venda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product: any) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.expiration_date || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(product.purchase_price, product.purchase_currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(product.sale_price, product.sale_currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.created_at}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/EditarProduto?id=${product.id}`}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Próximo
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}