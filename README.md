# Candidate Processor — Web

Frontend do **Candidate Processor**: uma interface para enviar uma planilha CSV com dados e notas de candidatos, acompanhar o processamento e visualizar os candidatos aprovados.

Este repositório contém **apenas o front-end**. O back-end (API de jobs, processamento e S3) está disponível em [`LuisG-santos/candidate-processor-api`](https://github.com/LuisG-santos/candidate-processor-api).

## Visão geral

O fluxo da aplicação funciona assim:

1. O usuário arrasta ou seleciona um arquivo `.csv` na tela inicial.
2. Ao clicar em **Processar arquivo**, o front-end:
   1. cria um job na API (`POST /job`) e recebe uma URL pré-assinada do S3;
   2. envia o arquivo diretamente para o S3 usando essa URL;
   3. faz *polling* do status do job (`GET /job/:id`) até ele ficar `COMPLETED` ou `FAILED`;
   4. busca os candidatos do job concluído (`GET /job/:id/candidates`).
3. A tabela de candidatos é atualizada com o resultado.

Enquanto isso, um modal exibe o passo atual do processamento, como:

- "Criando processamento..."
- "Enviando arquivo..."
- "Processando candidatos..."

Erros são exibidos com toast usando **Sonner**.

## Tecnologias

- [Vite](https://vite.dev/) — build tool e dev server
- React 19 + TypeScript
- Tailwind CSS v4 — via plugin `@tailwindcss/vite`
- [shadcn/ui](https://ui.shadcn.com/) — componentes de interface baseados em Radix UI e Lucide
- Axios — chamadas HTTP e upload para o S3
- Sonner — notificações toast

O tema atual está fixado em **dark** pela classe `dark` no `<html>` de `index.html`.

## Estrutura do projeto

```text
src/
├── components/
│   ├── ui/                 # componentes gerados pelo shadcn (button, table, dialog, sonner...)
│   ├── header.tsx          # cabeçalho da aplicação
│   ├── uploadArea.tsx      # upload do arquivo + fluxo de criação/acompanhamento do job
│   └── candidatesTable.tsx # tabela com os candidatos retornados
├── services/
│   ├── api.ts              # instância do Axios (baseURL da API)
│   ├── job.ts              # criação e consulta de jobs
│   ├── jobPolling.ts       # polling até o job concluir
│   ├── upload.ts           # upload do arquivo para o S3
│   └── candidates.ts       # busca dos candidatos de um job
├── types/
│   └── candidates.ts       # tipo Candidate
└── App.tsx                 # composição da página (Header + UploadArea + CandidatesTable)
```

## Requisitos

- Node.js instalado
- npm ou outro gerenciador compatível

## Como rodar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Outros comandos úteis

```bash
npm run build    # build de produção (tsc + vite build) em dist/
npm run preview  # serve o build de produção localmente
npm run lint     # executa o ESLint
```

## Configuração da API

A URL base da API está definida diretamente em [`src/services/api.ts`](src/services/api.ts), atualmente como:

```ts
https://api.lgnunes.com
```

Se o back-end mudar de endereço por ambiente (dev, staging, produção), é recomendável extrair essa configuração para variáveis de ambiente, por exemplo usando `VITE_API_BASE_URL`.

## Melhorias futuras

- Tornar a URL da API configurável por ambiente
- Adicionar validação mais robusta do arquivo CSV
- Incluir testes automatizados
- Melhorar a experiência de erro e retry no upload/processamento
- Suportar modo claro/escuro dinamicamente

## Licença

Defina aqui a licença do projeto, se aplicável.
