import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "../schemas/productSchema";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  buttonText: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  buttonText,
}: ProductFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || { purchase_currency: "BRL", quantity: 1 },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Item
        </label>
        <input
          {...register("name")}
          className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <input
          {...register("category")}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantidade em Estoque
        </label>
        <input
          type="number"
          {...register("quantity")}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.quantity && (
          <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preço de Compra (R$)
        </label>
        <input
          type="number"
          step="0.01"
          {...register("purchase_price")}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.purchase_price && (
          <p className="text-red-500 text-xs mt-1">
            {errors.purchase_price.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preço de Venda (R$)
        </label>
        <input
          type="number"
          step="0.01"
          {...register("sale_price")}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.sale_price && (
          <p className="text-red-500 text-xs mt-1">
            {errors.sale_price.message}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Validade
        </label>
        <input
          type="date"
          {...register("expiration_date")}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.expiration_date && (
          <p className="text-red-500 text-xs mt-1">
            {errors.expiration_date.message}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-blue-300"
        >
          <Save size={18} /> {isSubmitting ? "Processando..." : buttonText}
        </button>
      </div>
    </form>
  );
}
