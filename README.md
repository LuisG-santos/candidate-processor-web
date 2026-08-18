# Candidate Processor — Web

Frontend da aplicação **Candidate Processor**, desenvolvida com React, TypeScript e Vite.

A aplicação permite selecionar um arquivo CSV com dados e notas de candidatos, iniciar um processamento assíncrono e visualizar os candidatos aprovados após a conclusão do processamento.

O frontend é responsável pela interface, criação do Job através da API, upload direto do arquivo para o Amazon S3 utilizando uma Presigned URL, acompanhamento do processamento e apresentação dos resultados.

## Arquitetura

O frontend participa do fluxo da aplicação da seguinte forma:

```text
┌──────────────────────┐
│      React / Vite    │
│                      │
│  Upload + Interface  │
└──────────┬───────────┘
           │
           │ POST /job
           ▼
┌──────────────────────┐
│     FastAPI API      │
│                      │
│ Cria Job + Presigned │
│       URL            │
└──────────┬───────────┘
           │
           │ upload_url
           ▼
┌──────────────────────┐
│      Amazon S3       │
│                      │
│ Upload direto do     │
│      frontend        │
└──────────┬───────────┘
           │
           │ processamento assíncrono
           ▼
      SQS → Lambda → RDS
           │
           │
           ▼
┌──────────────────────┐
│     FastAPI API      │
│                      │
│ GET /job/{id}        │
│ GET /job/{id}/       │
│ candidates            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      React UI        │
│                      │
│ Tabela de candidatos │
└──────────────────────┘
```

O frontend não envia o arquivo para a API. A API apenas cria o Job e fornece uma **Presigned URL**, permitindo que o navegador faça o upload diretamente para o S3.

---

# Fluxo da aplicação

## 1. Seleção do arquivo

O usuário pode selecionar um arquivo CSV ou arrastá-lo para a área de upload.

O componente `UploadArea` mantém o arquivo selecionado em estado local.

A aplicação aceita arquivos com extensão:

```text
.csv
```

## 2. Criação do Job

Ao clicar em **Processar arquivo**, o frontend envia o nome do arquivo para:

```http
POST /job
```

Request:

```json
{
  "filename": "candidatos.csv"
}
```

A API cria o Job e retorna:

```json
{
  "id": "uuid",
  "filename": "candidatos.csv",
  "upload_url": "https://..."
}
```

O frontend utiliza o `id` para acompanhar o processamento e a `upload_url` para realizar o upload.

A comunicação com a API é centralizada através de uma instância Axios:

```ts
import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})
```

## 3. Upload direto para o S3

Depois de receber a Presigned URL, o frontend realiza um `PUT` diretamente para o Amazon S3:

```text
React
  │
  │ PUT + arquivo CSV
  ▼
Presigned URL
  │
  ▼
Amazon S3
```

O upload é realizado com Axios e o `Content-Type` é definido como:

```text
text/csv
```

A API não precisa receber ou transportar o arquivo.

Essa abordagem reduz o tráfego através do backend e separa a responsabilidade de armazenamento da API.

## 4. Acompanhamento do processamento

Depois que o upload termina, o frontend inicia o polling do Job.

A aplicação consulta:

```http
GET /job/{job_id}
```

A cada 3 segundos, o status é consultado novamente até que o processamento termine.

Estados considerados pelo frontend:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

Quando o status é `COMPLETED`, o polling termina.

Quando o status é `FAILED`, o frontend interrompe o processo e exibe uma mensagem de erro.

## 5. Busca dos candidatos

Depois que o Job é concluído, o frontend busca os candidatos através de:

```http
GET /job/{job_id}/candidates
```

Os dados retornados são armazenados no estado do componente `App`:

```text
App
 ├── candidates
 └── setCandidates
       │
       ├── UploadArea
       │
       └── CandidatesTable
```

A `CandidatesTable` recebe os candidatos e renderiza os resultados.

---

# Experiência de processamento

Para evitar que o usuário fique sem feedback enquanto o backend processa o arquivo, a interface possui um modal de processamento.

O estado do processamento é dividido em etapas:

```text
idle
  │
  ▼
creating-job
  │
  ▼
uploading
  │
  ▼
processing
  │
  ▼
idle
```

A interface apresenta mensagens diferentes para cada etapa:

- **Criando processamento...**
- **Enviando arquivo...**
- **Processando candidatos...**

Enquanto o processamento está em andamento, o modal permanece aberto e apresenta um indicador de carregamento.

Erros são apresentados utilizando **Sonner**.

---

# Estrutura do projeto

```text
candidate-processor-web/
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── header.tsx
│   │   ├── uploadArea.tsx
│   │   └── candidatesTable.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── job.ts
│   │   ├── jobPolling.ts
│   │   ├── upload.ts
│   │   └── candidates.ts
│   │
│   ├── types/
│   │   └── candidates.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
│
├── public/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── ...
```

### Componentes

**`UploadArea`**

Responsável por:

- seleção do arquivo;
- drag and drop;
- criação do Job;
- upload para o S3;
- polling do processamento;
- busca dos candidatos;
- feedback visual durante o processamento;
- tratamento de erros.

**`CandidatesTable`**

Responsável pela apresentação dos candidatos retornados pela API.

**`Header`**

Responsável pelo cabeçalho da aplicação.

**`components/ui`**

Contém componentes de interface utilizados pela aplicação, incluindo componentes baseados em shadcn/ui.

---

# Camada de serviços

A comunicação externa foi separada dos componentes React através da pasta `services`.

## API

`services/api.ts`

Centraliza a configuração do Axios utilizado para comunicação com a API:

```ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})
```

## Jobs

`services/job.ts`

Responsável por:

- criar Jobs;
- consultar o status de um Job.

Endpoints utilizados:

```http
POST /job
GET /job/{job_id}
```

## Polling

`services/jobPolling.ts`

Responsável por consultar periodicamente o status do Job até que ele seja concluído ou falhe.

O intervalo atual entre consultas é de:

```text
3 segundos
```

## Upload

`services/upload.ts`

Responsável pelo upload direto do arquivo para o S3 utilizando a Presigned URL recebida da API.

```ts
await axios.put(uploadUrl, file, {
  headers: {
    "Content-Type": "text/csv"
  }
})
```

## Candidatos

`services/candidates.ts`

Responsável por buscar os candidatos associados ao Job:

```http
GET /job/{job_id}/candidates
```

---

# Integração com AWS

O frontend não acessa os serviços AWS através de credenciais próprias.

O fluxo utiliza uma **Presigned URL** criada pelo backend.

```text
Frontend
   │
   │ POST /job
   ▼
FastAPI
   │
   │ gera Presigned URL
   ▼
Frontend
   │
   │ PUT arquivo
   ▼
Amazon S3
```

Isso permite que o navegador envie o arquivo diretamente ao bucket sem precisar receber credenciais AWS.

Após o upload, o restante do processamento ocorre no backend e nos serviços AWS:

```text
S3
 ↓
SQS
 ↓
Lambda
 ↓
RDS
```

O frontend apenas acompanha o Job e consulta o resultado através da API.

> A configuração do bucket S3, SQS, Lambda, RDS e IAM pertence ao backend/infraestrutura e está documentada no repositório da API.

---

# Tecnologias

## Frontend

- React 19
- TypeScript
- Vite
- Axios

## Interface

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React
- Sonner

## AWS / Backend

Integração com:

- Amazon S3
- Presigned URLs
- FastAPI
- Amazon SQS
- AWS Lambda
- Amazon RDS

---

# Configuração

## Requisitos

- Node.js
- npm

## Instalação

Clone o repositório:

```bash
git clone https://github.com/LuisG-santos/candidate-processor-web.git

cd candidate-processor-web
```

Instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000
```

Em produção, configure `VITE_API_URL` com a URL pública da API.

A variável é utilizada pelo Axios para definir a URL base das requisições.

## Desenvolvimento

Execute:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## Build

Para gerar o build de produção:

```bash
npm run build
```

O resultado será gerado no diretório:

```text
dist/
```

Para visualizar o build localmente:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

---

# Fluxo completo

Considerando frontend, API e infraestrutura AWS, o processamento completo acontece da seguinte maneira:

```text
┌──────────┐
│  Usuário │
└────┬─────┘
     │
     │ seleciona CSV
     ▼
┌───────────────┐
│ React / Vite  │
└───────┬───────┘
        │
        │ POST /job
        ▼
┌───────────────┐
│    FastAPI    │
└───────┬───────┘
        │
        ├──────────────► PostgreSQL / RDS
        │
        │ Presigned URL
        ▼
┌───────────────┐
│ React / Vite  │
└───────┬───────┘
        │
        │ PUT CSV
        ▼
┌───────────────┐
│   Amazon S3   │
└───────┬───────┘
        │
        │ ObjectCreated
        ▼
┌───────────────┐
│   Amazon SQS  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ AWS Lambda    │
└───────┬───────┘
        │
        │ processa CSV
        ▼
┌───────────────┐
│ RDS/PostgreSQL│
└───────────────┘
        ▲
        │
        │ GET /job/{id}
        │ GET /job/{id}/candidates
        │
┌───────┴───────┐
│ React / Vite  │
└───────┬───────┘
        │
        ▼
┌────────────────────┐
│ CandidatesTable    │
└────────────────────┘
```

---

# Objetivo do projeto

O frontend foi desenvolvido como parte de um projeto de aprendizado voltado à integração entre aplicações web e serviços de cloud.

Os principais conceitos explorados foram:

- Desenvolvimento de interfaces com React e TypeScript;
- Componentização;
- Comunicação com APIs REST;
- Upload direto para S3 utilizando Presigned URLs;
- Processamento assíncrono;
- Polling de Jobs;
- Tratamento de estados de carregamento;
- Feedback de erros para o usuário;
- Integração entre frontend, backend e AWS;
- Organização de código por componentes, serviços e tipos.

O objetivo principal não é representar uma aplicação de produção completa, mas demonstrar na prática como um frontend pode participar de uma arquitetura distribuída utilizando uma API e serviços gerenciados da AWS.
