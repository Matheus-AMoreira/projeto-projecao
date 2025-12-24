import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Plus, AlertTriangle } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import api from "../../api/axios";

export default function Produto() {
  const navigate = useNavigate();
  const { products, loading, refresh } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Função para abrir o modal de confirmação
  const confirmDelete = (id: number, name: string) => {
    setProductToDelete({ id, name });
    setIsModalOpen(true);
  };

  // Função que realmente chama o DELETE no backend FastAPI
  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/items/${productToDelete.id}`);
      setIsModalOpen(false);
      refresh(); // Atualiza a lista após excluir
    } catch (error) {
      alert("Erro ao excluir produto.");
    }
  };

  if (loading)
    return <div className="text-center mt-10">Carregando estoque...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Controle de Estoque
        </h1>
        <button
          onClick={() => navigate("/produto/adicionar")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="mr-2 w-4" /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Produto
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Categoria
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Qtd
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Preço (Venda)
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product: any) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                <td className="px-6 py-4 text-gray-600">{product.quantity}</td>
                <td className="px-6 py-4 text-gray-600">
                  {product.sale_price ? `R$ ${product.sale_price}` : "---"}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => navigate(`/produto/editar/${product.id}`)}
                    className="text-blue-600 hover:text-blue-800 inline-block"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => confirmDelete(product.id, product.name)}
                    className="text-red-500 hover:text-red-700 inline-block"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center text-amber-500 mb-4">
              <AlertTriangle className="mr-2" size={24} />
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover{" "}
              <strong>{productToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
