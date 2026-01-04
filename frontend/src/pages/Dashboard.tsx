import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Package,
  Filter,
} from "lucide-react";
import api from "../api/axios";

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState({ type: "category", value: "" });
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Carrega métricas gerais
    api
      .get("/items/dashboard/summary")
      .then((res) => setSummary(res.data.metrics));

    // Carrega opções de filtro
    const endpoint =
      filter.type === "category" ? "/items/categories" : "/items/names";
    api.get(endpoint).then((res) => {
      const data =
        filter.type === "category" ? res.data.categorias : res.data.names;
      setOptions(data);
    });
  }, [filter.type]);

  useEffect(() => {
    if (filter.value) {
      api.get(`/items/stats?${filter.type}=${filter.value}`).then((res) => {
        setChartData(res.data.dados);
      });
    }
  }, [filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard de Inventário
      </h1>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Produtos Vencidos"
          value={summary?.expired}
          icon={<AlertTriangle className="text-red-500" />}
          color="border-l-red-500"
        />
        <MetricCard
          title="Vencem em 30 dias"
          value={summary?.expiring_soon}
          icon={<Clock className="text-amber-500" />}
          color="border-l-amber-500"
        />
        <MetricCard
          title="Melhor Categoria"
          value={summary?.top_category}
          icon={<TrendingUp className="text-blue-500" />}
          color="border-l-blue-500"
        />
        <MetricCard
          title="Produto Top Vendas"
          value={summary?.top_product}
          icon={<Package className="text-green-500" />}
          color="border-l-green-500"
        />
      </div>

      {/* Seção do Gráfico com Filtro */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Filter size={20} /> Histórico de Movimentação
          </h2>
          <div className="flex gap-2">
            <select
              className="p-2 border rounded-lg bg-gray-50"
              onChange={(e) =>
                setFilter({ ...filter, type: e.target.value, value: "" })
              }
            >
              <option value="category">Por Categoria</option>
              <option value="name">Por Produto</option>
            </select>
            <select
              className="p-2 border rounded-lg"
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
            >
              <option value="">Selecione...</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tickFormatter={(m) => `Mês ${m}`} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Selecione um filtro para visualizar o gráfico
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 ${color}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">
            {value ?? "0"}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
