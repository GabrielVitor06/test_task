Instruções para iniciar o projeto

Inicie o Backend

Abra um terminal e execute os comandos:
cd backend
npm install
npm run dev

Abra o Prisma Studio (interface do banco de dados)

Em um novo terminal, execute:
cd backend
npx prisma migrate dev --name init
npx prisma studio

Inicie o Frontend

Abra mais um novo terminal e execute os comandos:
cd frontend
npm install
npm run dev
