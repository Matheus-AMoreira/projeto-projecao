import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

const formatDateToBrazilian = (date: string | null) => {
  if (!date) return null;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

const formatDateToInput = (date: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  try {
    if (id) {
      const query = `SELECT * FROM products WHERE id = $1`;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        throw new Error('Produto não encontrado');
      }
      const product = result.rows[0];
      return NextResponse.json({
        id: product.id,
        name: product.name,
        category: product.category,
        expiration_date: formatDateToInput(product.expiration_date),
        quantity: product.quantity,
        purchase_price: parseFloat(product.purchase_price),
        purchase_currency: product.purchase_currency,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        sale_currency: product.sale_currency,
        created_at: formatDateToBrazilian(product.created_at),
      });
    }

    const query = `
      SELECT * FROM products
      WHERE name ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM products
      WHERE name ILIKE $1
    `;
    
    const productsPerPage = 10;
    const offset = (page - 1) * productsPerPage;
    const values = [`%${search}%`, productsPerPage, offset];
    const result = await pool.query(query, values);
    const countResult = await pool.query(countQuery, [`%${search}%`]);

    const formattedProducts = result.rows.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      expiration_date: formatDateToBrazilian(product.expiration_date),
      quantity: product.quantity,
      purchase_price: parseFloat(product.purchase_price),
      purchase_currency: product.purchase_currency,
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      sale_currency: product.sale_currency,
      created_at: formatDateToBrazilian(product.created_at),
    }));

    return NextResponse.json({
      products: formattedProducts,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name) throw new Error('Nome do produto é obrigatório');
    if (!data.category) throw new Error('Categoria é obrigatória');
    if (!data.quantity || data.quantity <= 0) throw new Error('Quantidade deve ser maior que zero');
    if (!data.purchasePrice || data.purchasePrice <= 0) throw new Error('Preço de compra deve ser maior que zero');
    if (!['BRL', 'USD'].includes(data.purchaseCurrency)) throw new Error('Moeda de compra inválida');
    if (data.salePrice && !['BRL', 'USD'].includes(data.saleCurrency)) throw new Error('Moeda de venda inválida');
    
    if (data.expirationDate) {
      const inputDate = new Date(data.expirationDate);
      const currentDate = new Date('2025-04-27');
      if (isNaN(inputDate.getTime())) throw new Error('Data de expiração inválida');
      if (inputDate <= currentDate) throw new Error('A data de expiração deve ser posterior a 27/04/2025');
    }

    const query = `
      INSERT INTO products (
        name, category, expiration_date, quantity,
        purchase_price, purchase_currency, sale_price, sale_currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `;
    
    const values = [
      data.name,
      data.category,
      data.expirationDate || null,
      data.quantity,
      data.purchasePrice,
      data.purchaseCurrency,
      data.salePrice || null,
      data.saleCurrency || null,
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json({ 
      id: result.rows[0].id, 
      created_at: formatDateToBrazilian(result.rows[0].created_at),
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID do produto é obrigatório');

    const data = await request.json();
    
    if (!data.name) throw new Error('Nome do produto é obrigatório');
    if (!data.category) throw new Error('Categoria é obrigatória');
    if (!data.quantity || data.quantity <= 0) throw new Error('Quantidade deve ser maior que zero');
    if (!data.purchasePrice || data.purchasePrice <= 0) throw new Error('Preço de compra deve ser maior que zero');
    if (!['BRL', 'USD'].includes(data.purchaseCurrency)) throw new Error('Moeda de compra inválida');
    if (data.salePrice && !['BRL', 'USD'].includes(data.saleCurrency)) throw new Error('Moeda de venda inválida');
    
    if (data.expirationDate) {
      const inputDate = new Date(data.expirationDate);
      const currentDate = new Date('2025-04-27');
      if (isNaN(inputDate.getTime())) throw new Error('Data de expiração inválida');
      if (inputDate <= currentDate) throw new Error('A data de expiração deve ser posterior a 27/04/2025');
    }

    const query = `
      UPDATE products
      SET
        name = $1,
        category = $2,
        expiration_date = $3,
        quantity = $4,
        purchase_price = $5,
        purchase_currency = $6,
        sale_price = $7,
        sale_currency = $8
      WHERE id = $9
      RETURNING id, created_at
    `;
    
    const values = [
      data.name,
      data.category,
      data.expirationDate || null,
      data.quantity,
      data.purchasePrice,
      data.purchaseCurrency,
      data.salePrice || null,
      data.saleCurrency || null,
      id,
    ];

    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }

    return NextResponse.json({ 
      id: result.rows[0].id, 
      created_at: formatDateToBrazilian(result.rows[0].created_at),
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID do produto é obrigatório');

    const query = `DELETE FROM products WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}