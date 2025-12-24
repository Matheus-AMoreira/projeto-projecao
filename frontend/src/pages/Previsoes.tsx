import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TrendingUp, History, PlayCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import FeedbackModal from "../components/FeedbackModal";

export default function Previsoes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"novas" | "antigas">("novas");
  const [predictions, setPredictions] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [options, setOptions] = useState<string[]>([]); // Armazena Categorias ou Nomes
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { type: "category", value: "" },
  });

  const selectedType = watch("type");
  const selectedValue = watch("value");

  // Busca as opções (Categorias ou Nomes) para preencher o Select
  useEffect(() => {
    async function loadOptions() {
      try {
        const endpoint =
          selectedType === "category" ? "/items/categories" : "/items/names";
        const res = await api.get(endpoint);
        const data =
          selectedType === "category" ? res.data.categorias : res.data.names;
        setOptions(data);
        setValue("value", ""); // Limpa o valor selecionado ao trocar o tipo
      } catch (err) {
        setOptions([]);
      }
    }
    loadOptions();
  }, [selectedType, setValue]);

  // Busca dados (Previsões e Histórico) quando o valor do filtro muda
  useEffect(() => {
    if (selectedValue) {
      const fetchData = async () => {
        try {
          const predRes = await api.get(
            `/predictions/?${selectedType}=${selectedValue}`,
          );
          setPredictions(predRes.data[0]?.dados || []);

          const histRes = await api.get(
            `/items/stats?${selectedType}=${selectedValue}`,
          );
          setHistoricalData(histRes.data.dados || []);
        } catch (err) {
          setPredictions([]);
          setHistoricalData([]);
        }
      };
      fetchData();
    }
  }, [selectedValue, selectedType]);

  const handleGenerate = async (data: any) => {
    try {
      await api.post("/predictions/update", { [data.type]: data.value });
      setModal({
        open: true,
        message: "IA processada. Dados atualizados!",
        type: "success",
      });
      // Recarrega as previsões após gerar
      const res = await api.get(`/predictions/?${data.type}=${data.value}`);
      setPredictions(res.data[0]?.dados || []);
    } catch (error) {
      setModal({
        open: true,
        message: "Erro ao gerar previsões.",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 w-4" /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Projeções com Machine Learning
        </h1>
      </header>

      {/* Formulário de Geração */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form
          onSubmit={handleSubmit(handleGenerate)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Projeção
            </label>
            <select
              {...register("type")}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="category">Por Categoria</option>
              <option value="name">Por Produto Específico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Selecionar {selectedType === "category" ? "Categoria" : "Produto"}
            </label>
            <select
              {...register("value")}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma opção...</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!selectedValue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-gray-300"
            >
              <PlayCircle size={20} /> Atualizar IA
            </button>
          </div>
        </form>
      </section>

      {/* Abas de Alternância */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("novas")}
          className={`px-6 py-3 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === "novas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <TrendingUp size={18} /> Projeções Futuras (6 meses)
        </button>
        <button
          onClick={() => setActiveTab("antigas")}
          className={`px-6 py-3 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === "antigas" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <History size={18} /> Histórico de Dados Reais
        </button>
      </div>

      {/* Lista de Resultados */}
      <main className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Ano
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Mês
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Quantidade {activeTab === "novas" ? "Prevista" : "Real"}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(activeTab === "novas" ? predictions : historicalData).map(
              (item: any, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {item.ano}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.mes}</td>
                  <td className="px-6 py-4 text-blue-700 font-bold">
                    {item.quantidade}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === "novas" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {activeTab === "novas" ? "IA PROJECTION" : "REAL DATA"}
                    </span>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {(activeTab === "novas" ? predictions : historicalData).length ===
          0 && (
          <div className="p-10 text-center text-gray-500 italic">
            Nenhum dado encontrado para os critérios selecionados.
          </div>
        )}
      </main>

      <FeedbackModal
        isOpen={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </div>
  );
}
