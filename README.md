Instruções para iniciar o projeto

Inicie o Backend

Abra um terminal e execute os comandos:
cd backend
npm install
npm run dev

Abra o Prisma Studio (interface do banco de dados)

Em um novo terminal, execute:
npx prisma studio
npx prisma migrate dev --name init

Inicie o Frontend

Abra mais um novo terminal e execute os comandos:
cd frontend
npm install
npm run dev

Neste projeto, utilizei a stack solicitada juntamente com algumas bibliotecas adicionais. Busquei demonstrar parte do meu conhecimento, mesmo com o tempo limitado. Em uma aplicação mais robusta, implementaria autenticação utilizando cookies, tokens JWT, rate limiting e outras práticas de segurança, com apoio de middlewares para proteger rotas, validar sessões e garantir uma estrutura segura de ponta a ponta.

Além da segurança, middlewares também seriam utilizados para tarefas como logging, tratamento de erros, controle de acesso e pré-processamento de requisições — algo essencial em projetos escaláveis.

Vale destacar que, para facilitar o desenvolvimento e a manutenção, uma boa prática é separar o frontend do backend. Essa separação permite desenvolvimento independente das equipes, escalabilidade individual, reutilização do backend para diferentes plataformas (web, mobile), além de facilitar a manutenção, aumentar a segurança, oferecer flexibilidade tecnológica e permitir implantações separadas.

Optei por entregar um sistema funcional com um design mais básico, focando em mostrar minhas habilidades de forma objetiva, respeitando o tempo disponível para o desafio.

Agradeço sinceramente pela oportunidade de participar do processo e espero que possamos, em breve, colaborar juntos profissionalmente.
