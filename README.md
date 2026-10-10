<div align="center">

# ⚽ Bolão da Trupe 👻

---

## 📖 Sobre o projeto

Site feito para gerenciar o bolão do Brasileirão do meu grupo de amigos. Utiliza **HTML, CSS e JavaScript**, com **banco de dados** para armazenar palpites e classificação, além de **integração com uma API** para buscar automaticamente os resultados e atualizar a pontuação.

## ✨ Funcionalidades

- 📋 **Classificação ao vivo:** tabela com posição, pontos, rodadas disputadas e placares cravados, com destaque para o pódio 🥇🥈🥉
- 💬 **Palpites direto do WhatsApp:** é só colar a mensagem do jogador (`Time 2 x 1 Time`) e o site monta a rodada e registra os palpites
- 🌐 **Resultados automáticos:** busca os placares reais das partidas e fecha a rodada sozinho
- 🧮 **Pontuação automática:** calcula os pontos de cada jogador assim que os resultados chegam
- 📤 **Classificação pronta para compartilhar:** gera o texto da tabela para colar no grupo
- 👥 **Gestão de jogadores:** cadastro, remoção e ajuste da pontuação inicial
- ✍️ **Correção manual:** dá para preencher ou corrigir um resultado à mão quando precisar

## 🎯 Como pontua

| Palpite | Pontos |
|---|:---:|
| Placar cravado (exato) | **5 pts** |
| Acertou só o resultado (vitória ou empate) | **3 pts** |
| Errou o resultado | **0 pts** |

> Critério de desempate: quem tiver mais placares cravados fica na frente.

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| Back-end | ![Vercel Functions](https://img.shields.io/badge/Vercel_Functions-000000?style=for-the-badge&logo=vercel&logoColor=white) |
| Banco de dados | ![Neon](https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black) |
| Resultados das partidas | ![football-data.org](https://img.shields.io/badge/football--data.org-API-2E7D32?style=for-the-badge) |
| Hospedagem | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) com deploy automático a cada push na `main` |