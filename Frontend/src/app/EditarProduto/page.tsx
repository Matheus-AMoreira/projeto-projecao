'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProduct() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expirationDate: '',
    quantity: '',
    purchasePrice: '',
    purchaseCurrency: 'BRL',
    salePrice: '',
    saleCurrency: 'BRL',
    createdAt: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setSubmitStatus('ID do produto não fornecido');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/produtos?id=${id}`);
        console.log('Response:', response);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erro ${response.status}: ${errorData.error || 'Falha na requisição'}`);
        }
        const data = await response.json();
        console.log('Data:', data);
        setFormData({
          name: data.name,
          category: data.category,
          expirationDate: data.expiration_date || '',
          quantity: data.quantity.toString(),
          purchasePrice: data.purchase_price.toFixed(2).replace('.', data.purchase_currency === 'BRL' ? ',' : '.'),
          purchaseCurrency: data.purchase_currency,
          salePrice: data.sale_price ? data.sale_price.toFixed(2).replace('.', data.sale_currency === 'BRL' ? ',' : '.') : '',
          saleCurrency: data.sale_currency || 'BRL',
          createdAt: data.created_at,
        });
      } catch (error: any) {
        console.error('Fetch error:', error);
        setSubmitStatus(`Erro ao carregar o produto: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
      const response = await fetch(`/api/produtos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setSubmitStatus('Produto atualizado com sucesso!');
        setErrors({});
        setTimeout(() => router.push('/'), 1000);
      } else {
        const errorData = await response.json();
        setSubmitStatus(`Erro: ${errorData.error}`);
      }
    } catch (error: any) {
      setSubmitStatus(`Erro ao salvar o produto: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubmitStatus('Produto excluído com sucesso!');
        setTimeout(() => router.push('/'), 1000);
      } else {
        const errorData = await response.json();
        setSubmitStatus(`Erro: ${errorData.error}`);
      }
    } catch (error: any) {
      setSubmitStatus(`Erro ao excluir o produto: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Produto</h2>
        
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

          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
              Data de Cadastro
            </label>
            <input
              type="text"
              id="createdAt"
              name="createdAt"
              value={formData.createdAt}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
            />
          </div>

          <div className="flex justify-between">
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
              Voltar
            </Link>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Deletar
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}