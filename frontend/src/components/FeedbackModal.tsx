import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedbackModalProps {
  isOpen: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
  redirectPath?: string; // Caminho para onde ir após o sucesso
}

export default function FeedbackModal({
  isOpen,
  message,
  type,
  onClose,
  redirectPath,
}: FeedbackModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = () => {
    onClose();
    if (type === "success" && redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          {type === "success" ? (
            <CheckCircle size={60} className="text-green-500" />
          ) : (
            <XCircle size={60} className="text-red-500" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {type === "success" ? "Sucesso!" : "Erro"}
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={handleAction}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all active:scale-95 ${
            type === "success"
              ? "bg-green-500 hover:bg-green-600 shadow-green-200"
              : "bg-red-500 hover:bg-red-600 shadow-red-200"
          } shadow-lg`}
        >
          {type === "success" ? "Continuar" : "Tentar novamente"}
        </button>
      </div>
    </div>
  );
}
