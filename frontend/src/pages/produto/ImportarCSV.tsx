import { useState } from "react";
import { Upload, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import FeedbackModal from "../../components/FeedbackModal";

export default function ImportarCSV() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await api.post("/items/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal({
        open: true,
        message: response.data.message,
        type: "success",
      });
    } catch (error) {
      setModal({
        open: true,
        message: "Falha ao processar o arquivo CSV. Verifique a estrutura.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="mr-2 w-4" /> Voltar
      </button>

      <div className="bg-white p-10 rounded-xl shadow-sm border-2 border-dashed border-gray-200 text-center">
        <Upload className="mx-auto w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Importar Produtos via CSV</h2>
        <p className="text-gray-500 mb-6 text-sm">
          O arquivo deve conter as colunas: name, category, quantity,
          purchase_price, purchase_currency...
        </p>

        <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border p-4 rounded-lg block mb-6 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <FileText size={20} />
            {file ? (
              <strong>{file.name}</strong>
            ) : (
              "Clique para selecionar o arquivo"
            )}
          </div>
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Iniciar Importação"
          )}
        </button>
      </div>

      <FeedbackModal
        isOpen={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, open: false })}
        redirectPath="/produto"
      />
    </div>
  );
}
