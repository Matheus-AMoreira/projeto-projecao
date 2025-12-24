import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import FeedbackModal from "../../components/FeedbackModal";
import api from "../../api/axios";

export default function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    api.get(`/items/${id}`).then((res) => {
      const data = res.data;
      if (data.expiration_date)
        data.expiration_date = data.expiration_date.split("T")[0];
      setProduct(data);
    });
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      await api.put(`/items/${id}`, data);
      setModal({
        open: true,
        message: "Produto atualizado com sucesso!",
        type: "success",
      });
    } catch {
      setModal({
        open: true,
        message: "Erro ao atualizar produto.",
        type: "error",
      });
    }
  };

  const handleCloseModal = () => {
    setModal({ ...modal, open: false });
    if (modal.type === "success") navigate("/"); // Volta para listagem apenas se deu certo
  };

  if (!product)
    return <div className="p-10 text-center">Carregando dados...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
        Editar Produto
      </h2>
      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
        buttonText="Salvar"
      />
      <FeedbackModal
        isOpen={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={handleCloseModal}
      />
    </div>
  );
}
