# About this repository

This repository includes [api-previsoes](https://github.com/Matheus-AMoreira/api-previsoes) and [gerenciador-estoque](https://github.com/Matheus-AMoreira/gerenciador-estoque) as submodules for use of Docker Compose setup to simplify local developiment

### Environment Variables Example
````
# PgAdmin
PGADMIN_EMAIL= postgres@email.com
PGADMIN_PASSWORD=postgres

# Backend
BACKEND_PORT=5000
BACKEND_REPO_URL=https://github.com/Matheus-AMoreira/api-previsoes.git

# Frontend
FRONTEND_PORT=9000
FRONTEND_REPO_URL=https://github.com/Matheus-AMoreira/gerenciador-estoque.git

# Database
PG_CONTAINER=db-postgres
PG_USER=postgres
PG_HOST=db-postgres
PG_DATABASE=estoque
PG_PASSWORD=postgres
PG_PORT=5432
````