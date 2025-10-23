# Sobre o repositório

Esse repositorio possui um sistema completo para gerenciar itens de estoque com uso de machine learning para projeção de itens.

# Fronend/Back

Um formulário para cadastro de produtos e cosumo da api e inserção de dados no banco

# Backend

Api desenvolvida para a utilização do modelo de machine learn baseado em regressão linear.

# docker compose 

Foi usado para facilitar a construção da aplicação o docker compose que que lê as variáveis de ambiente para criar os containers

### Exemplo de variáveis de ambiente

Esse é o Exemplo de variaveis que serão montado em cada container para estebeler as portas que seram usuadas para
os containers e as variáveis de ambiente necessaria para estabelecerem comunicação entre si a partir de um arquivo .env

````
##Env example

# PgAdmin
PGADMIN_EMAIL= postgres@email.com
PGADMIN_PASSWORD=postgres

# Database
DB_CONTAINER=postgres_container
PG_USER=postgres
PG_DATABASE=estoque
PG_PASSWORD=postgres
PG_PORT=5432

# Backend
BACKEND_PORT=5000

# Frontend
FRONTEND_PORT=9000
NEXT_PUBLIC_PY_BACKEND=http://localhost:${BACKEND_PORT}

# Frontend e Backend
DATABASE_URL=postgresql://${PG_USER}:${PG_PASSWORD}@${DB_CONTAINER}:${PG_PORT}/${PG_DATABASE}
````