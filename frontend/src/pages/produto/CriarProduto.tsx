import { useState } from "react";
import ProductForm from "../../components/ProductForm";
import FeedbackModal from "../../components/FeedbackModal";
import api from "../../api/axios";

export default function CriarProduto() {
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const handleCreate = async (data: any) => {
    try {
      await api.post("/items/", data);
      setModal({
        open: true,
        message: "Produto cadastrado com sucesso no sistema!",
        type: "success",
      });
    } catch (error) {
      setModal({
        open: true,
        message: "Não foi possível cadastrar o produto. Verifique os dados.",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Novo Produto
        </h2>

        <ProductForm onSubmit={handleCreate} buttonText="Cadastrar" />

        <FeedbackModal
          isOpen={modal.open}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal({ ...modal, open: false })}
          redirectPath="/produto"
        />
      </div>
    </div>
  );
}
