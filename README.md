# Sistema de Projeção de Itens em Estoque

Este sistema é uma aplicação full-stack projetada para gerenciar produtos e realizar previsões de demanda futura utilizando Machine Learning (Regressão Linear). A aplicação permite visualizar dados em um dashboard, gerenciar o inventário e importar dados históricos via CSV para alimentar o modelo de predição.

## 🚀 Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web de alta performance para a construção da API.
- **SQLAlchemy & SQLModel**: ORM para interação com o banco de dados PostgreSQL.
- **Scikit-learn**: Utilizado para o treinamento do modelo de Regressão Linear e escalonamento de dados.
- **Pandas & NumPy**: Manipulação e processamento de dados.
- **PostgreSQL**: Banco de dados relacional para persistência de itens e predições.

### Frontend
- **React 19**: Biblioteca para construção da interface de usuário.
- **Vite**: Ferramenta de build e servidor de desenvolvimento rápido.
- **Tailwind CSS**: Framework utilitário para estilização responsiva.
- **Lucide React**: Biblioteca de ícones.
- **React Router Dom**: Gerenciamento de rotas da aplicação.

### Infraestrutura
- **Docker & Docker Compose**: Orquestração de containers para banco de dados, backend e frontend.

## 🧠 Como Funciona a Previsão (Machine Learning)

O sistema utiliza um serviço de Machine Learning (`MLService`) que processa o histórico de quantidades dos produtos:
1. **Engenharia de Atributos**: Cria "lags" (atrasos) temporais (padrão de 3 meses) para identificar tendências.
2. **Treinamento**: Treina um modelo de **Regressão Linear** com os dados históricos escalonados.
3. **Predição Iterativa**: Projeta o consumo para os **próximos 6 meses**, utilizando cada nova predição como entrada para a seguinte.
4. **Persistência**: Os resultados são salvos no banco de dados para consulta imediata no frontend.

## 🛠️ Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados.
