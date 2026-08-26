# Bolão Brasileirão — guia de deploy (tudo grátis)

Este site usa 3 serviços gratuitos:
- **Supabase** → banco de dados (jogadores, rodadas, palpites)
- **API-Football** (api-sports.io) → busca automática dos resultados reais
- **Vercel** → hospeda o site e o "buscador de resultado" (100% grátis)

Nenhum dos três pede cartão de crédito no plano gratuito.

---

## 1. Criar o banco de dados (Supabase)

1. Crie uma conta em https://supabase.com e crie um novo projeto (escolha uma senha de banco, pode ser qualquer uma).
2. No menu lateral, vá em **SQL Editor** → **New query**.
3. Cole o conteúdo do arquivo `supabase_schema.sql` (está nesta pasta) e clique em **Run**.
4. Vá em **Project Settings > API**. Copie:
   - **Project URL**
   - **anon public key**
5. Abra o arquivo `index.html` e encontre estas duas linhas perto do topo do `<script>`:
   ```js
   var SUPABASE_URL = 'COLE_AQUI_A_URL_DO_SEU_PROJETO_SUPABASE';
   var SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_ANON_PUBLIC_DO_SEU_PROJETO';
   ```
   Substitua pelos valores que você copiou.

---

## 2. Criar a chave da API-Football

1. Crie uma conta grátis em https://dashboard.api-football.com (sem cartão de crédito).
2. No painel, copie sua **API-KEY**.
3. Guarde essa chave — você vai colar na Vercel no passo 4, e **não** no código (ela fica só no servidor, escondida).

> Plano grátis: 100 buscas por dia — mais que suficiente para 1 busca por rodada.

---

## 3. Colocar o projeto no GitHub usando o VS Code

1. Instale o [VS Code](https://code.visualstudio.com) e o [Git](https://git-scm.com/downloads), se ainda não tiver.
2. Crie uma conta em https://github.com.
3. No GitHub, clique em **New repository**, dê um nome (ex: `bolao-brasileirao`) e crie (pode ser privado). Não adicione README pelo GitHub — já tem um aqui.
4. No VS Code, vá em **File > Open Folder** e abra a pasta com estes arquivos.

**Opção A — pelo terminal do VS Code** (Terminal > New Terminal):
```bash
git init
git add .
git commit -m "Primeira versão do bolão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/bolao-brasileirao.git
git push -u origin main
```
Troque a URL pela do seu repositório (o GitHub mostra no botão verde "Code" da página do repositório).

**Opção B — sem terminal, só clicando:**
1. Clique no ícone de **Source Control** na barra lateral esquerda do VS Code.
2. Clique no **+** ao lado de "Changes" para adicionar todos os arquivos (ou clique direito > "Stage All Changes").
3. Digite uma mensagem (ex: "Primeira versão do bolão") na caixa de texto e clique no ✓ para confirmar (commit).
4. Clique no botão **Publish Branch** (ou "Publish to GitHub") que aparece em seguida, escolha sua conta e o nome do repositório.

---

## 4. Publicar na Vercel

1. Crie uma conta em https://vercel.com usando login do GitHub.
2. Clique em **Add New > Project** e escolha o repositório que você acabou de criar.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `API_FOOTBALL_KEY` → cole a chave que você pegou no passo 2.
4. Clique em **Deploy**. Em menos de 1 minuto a Vercel te dá um link público (algo como `https://bolao-brasileirao.vercel.app`).

Pronto — esse link já é o site funcionando, com salvamento real e busca automática de resultado. Envie esse link para seu amigo.

---

## Se algo não funcionar

- **Site abre mas não salva nada** → confira se colou certinho a URL e a chave do Supabase no `index.html`, e se rodou o `supabase_schema.sql`.
- **"Finalizar rodada" dá erro** → confira se a `API_FOOTBALL_KEY` foi mesmo adicionada nas variáveis de ambiente da Vercel (e clique em "Redeploy" depois de adicionar).
- **Time não é encontrado / resultado não aparece** → nomes de time muito diferentes do nome oficial podem não bater automaticamente. Use o botão "Preencher/corrigir manualmente" na rodada para completar à mão.
