# Candidate Processor — Web

Frontend do **Candidate Processor** (BTG): interface para enviar uma planilha CSV com dados e notas de candidatos, acompanhar o processamento e visualizar os candidatos aprovados.

Este repositório contém **apenas o front-end**. O back-end (API de jobs, processamento e S3) tem seu próprio README/repositório.

## Como funciona

1. O usuário arrasta (ou seleciona) um arquivo `.csv` na tela inicial.
2. Ao clicar em "Processar arquivo", o front:
   1. cria um job na API (`POST /job`) e recebe uma URL pré-assinada do S3;
   2. envia o arquivo diretamente para o S3 usando essa URL;
   3. faz *polling* do status do job (`GET /job/:id`) até ele ficar `COMPLETED` ou `FAILED`;
   4. busca os candidatos do job concluído (`GET /job/:id/candidates`);
3. A tabela de candidatos é atualizada com o resultado.

Enquanto isso acontece, um diálogo modal mostra o passo atual ("Criando processamento...", "Enviando arquivo...", "Processando candidatos...") e erros são exibidos como toast (Sonner).

## Stack

- **[Vite](https://vite.dev/)** — build tool e dev server
- **React 19 + TypeScript**
- **Tailwind CSS v4** — via plugin `@tailwindcss/vite`
- **[shadcn/ui](https://ui.shadcn.com/)** — componentes de UI (base Radix UI, ícones Lucide)
- **Axios** — chamadas HTTP e upload para o S3
- **Sonner** — notificações (toasts)

Tema atualmente fixado em **dark** (classe `dark` no `<html>` de `index.html`).

## Estrutura

```
src/
├── components/
│   ├── ui/              # componentes gerados pelo shadcn (button, table, dialog, sonner...)
│   ├── header.tsx        # cabeçalho da aplicação
│   ├── uploadArea.tsx     # upload de arquivo + fluxo de criação/acompanhamento do job
│   └── candidatesTable.tsx  # tabela com os candidatos retornados
├── services/
│   ├── api.ts             # instância do Axios (baseURL da API)
│   ├── job.ts              # criação e consulta de jobs
│   ├── jobPolling.ts        # polling até o job concluir
│   ├── upload.ts            # upload do arquivo para o S3
│   └── candidates.ts         # busca dos candidatos de um job
├── types/
│   └── candidates.ts          # tipo `Candidate`
└── App.tsx                     # composição da página (Header + UploadArea + CandidatesTable)
```

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build      # build de produção (tsc + vite build) em dist/
npm run preview     # serve o build de produção localmente
npm run lint          # eslint
```

## Configuração da API

A URL base da API está definida diretamente em [`src/services/api.ts`](src/services/api.ts) (`https://api.lgnunes.com`). Se o back-end mudar de endereço por ambiente (dev/staging/prod), vale extrair isso para uma variável de ambiente do Vite (`import.meta.env.VITE_API_URL`), configurada via `.env`.

## Backend

A API consumida por este front (criação de jobs, processamento das planilhas e geração das URLs do S3) fica em um repositório/README separado.
