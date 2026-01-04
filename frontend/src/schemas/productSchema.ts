import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "A quantidade deve ser pelo menos 1"),
  purchase_price: z.coerce.number().min(0.01, "Preço inválido"),
  purchase_currency: z.string().default("BRL"),
  expiration_date: z.string().optional(),
  created_at: z.string().optional(),
  sale_price: z.coerce.number().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
