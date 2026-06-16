# Blueprint: Fluxo Web do Typebot (Ensaio.AI)

Este documento mapeia exatamente o que precisa ser configurado no painel do Typebot para um funil de **Alta Conversão no Site (Web)**. 
O objetivo é isolar a inteligência, garantir o pagamento antecipado e usar o WhatsApp apenas para entrega, blindando o seu sistema contra banimentos e curiosos.

## 🧠 Lógica Global do Fluxo

O fluxo é acionado assim que o cliente clica no botão "Quero este pacote" na Landing Page. O Typebot abre em uma janela no próprio site (modal) ou em tela cheia.

### Variáveis Necessárias
Crie estas variáveis no Typebot (aba "Variables"):
- `NomeCliente`
- `WhatsAppCliente`
- `PacoteEscolhido` (Pode ser puxado automaticamente se você passar na URL do botão)
- `FotosCliente` (Lista de URLs das fotos enviadas)
- `StatusPagamento`

---

## 🏗️ Estrutura dos Blocos (Nodes)

### Grupo 1: Captura de Lead (A Garantia)
*Este é o passo mais importante. Capturamos o contato ANTES de pedir fotos ou cobrar, para caso ele fuja.*

**Texto 1:** "Que excelente escolha! Vou adorar criar o seu Ensaio com Inteligência Artificial. ✨"
**Texto 2:** "Para eu não perder o seu processo e poder te enviar as fotos prontas, me diga o seu nome completo:"
**Input de Texto:** Salvar na variável `NomeCliente`.

**Texto 3:** "Prazer, {{NomeCliente}}! E qual é o seu WhatsApp com DDD?"
**Input de Telefone/Texto:** Salvar na variável `WhatsAppCliente`.

*(Dica Ninja: Aqui você pode colocar um Webhook silencioso pro n8n avisando "Lead Iniciou Checkout", para fazer remarketing caso ele não pague).*

---

### Grupo 2: Coleta de Matéria Prima (O Upload)
**Texto 1:** "Tudo certo! Agora vem a parte principal. Preciso que você envie de 3 a 5 fotos suas (de preferência selfies com o rosto bem visível e iluminação natural)."
**Bloco de Upload de Arquivo (File Upload):** 
- Configurar para aceitar Imagens.
- Salvar na variável `FotosCliente`.

---

### Grupo 3: Checkout Direto (O Pix)
**Texto 1:** "Fotos recebidas com sucesso! Elas estão ótimas."
**Texto 2:** "O valor do seu pacote é R$ 149,00. Assim que o pagamento for reconhecido, nossos servidores de IA iniciam a mágica."

**Ação (HTTP Request ou Bloco de Pagamento Nativo):**
- *Opção A:* Usar o bloco nativo da Stripe no Typebot.
- *Opção B:* Fazer um Webhook para o n8n gerar um PIX no Mercado Pago/Asaas e devolver o Código Copia e Cola.

**Texto 3:** "Aqui está a sua chave Pix Copia e Cola:"
**Texto 4 (Código):** `[Chave Dinâmica do PIX]`

---

### Grupo 4: Despedida e Entrega de Bastão (Handover)
*(Este grupo só é mostrado após a confirmação do pagamento no webhook)*

**Texto 1:** "Pagamento aprovado, {{NomeCliente}}! 🎉"
**Texto 2:** "O seu Ensaio.AI já entrou na fila de renderização dos nossos servidores superpotentes."
**Texto 3:** "Dentro de alguns minutos, **nós te enviaremos uma mensagem automática no seu WhatsApp** ({{WhatsAppCliente}}) com o link VIP do Google Drive contendo todas as suas fotos em alta resolução."
**Texto 4:** "Pode fechar esta página e ficar de olho no seu celular. Até já!"

---

## 🤖 A Integração n8n + Evolution API (Pós-Venda)

A partir daqui, o Typebot morre e a máquina de backend assume:
1. O n8n percebe que o PIX foi pago.
2. O n8n pega as `FotosCliente` e envia para a IA (Midjourney/Fal.ai).
3. O n8n pega o resultado, sobe no Google Drive.
4. O n8n manda o comando para a **Evolution API**.
5. A Evolution API dispara uma mensagem do seu número oficial direto pro WhatsApp da pessoa: *"Oi {{NomeCliente}}! Seu ensaio ficou pronto. Baixe aqui: [Link]"*.
