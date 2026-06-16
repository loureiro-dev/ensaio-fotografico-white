# Ensaio.AI - Sistema de Retratos com Inteligência Artificial

Este repositório contém a infraestrutura completa do MVP do **Ensaio.AI**, um funil de vendas focado em conversão via WhatsApp para a entrega automatizada de retratos profissionais e ensaios fotográficos gerados por Inteligência Artificial.

## 🎨 1. Frontend (Landing Pages)
Foram desenvolvidos dois temas de alta conversão (A/B Testing), localizados nas pastas `lp-whatsapp/` (Tema Claro) e `lp-whatsapp-dark/` (Tema Escuro).

**Principais Features do Frontend:**
*   **Carrossel Infinito:** Efeito Marquee puramente em CSS para performance máxima exibindo provas sociais.
*   **Sticky CTA:** Botão inferior flutuante "Fazer Meu Ensaio Agora" com exibição ativada via JavaScript apenas após o usuário rolar além da dobra principal (Hero).
*   **Meta Pixel CAPI:** Integrado e disparando eventos nativos de `PageView` no carregamento e `Lead` no clique de qualquer botão de conversão.

### 🔀 Rota de Botões (Parametrização)
O redirecionamento para o WhatsApp ocorre com parâmetros predefinidos que alimentam a lógica do Chatbot (Typebot):

1. **Botões Genéricos:** (Cabeçalho, Topo, Botão Flutuante e Rodapé).
   * **Mensagem:** *"Olá, vim pelo site e quero fazer meus ensaios com IA!"*
   * **Ação do Bot:** Reconhece que o usuário não escolheu um plano e exibe o "Menu de Opções" dentro do WhatsApp.
2. **Botões de Preço/Pacotes:** (Essencial, Profissional, Premium).
   * **Mensagem:** *"Quero o Pacote [X] por R$[Y]"*
   * **Ação do Bot:** Reconhece o intento de compra direto através da variável de texto, pula o menu de opções e direciona o cliente direto para o checkout (Pix).

---

## ⚙️ 2. Automação e Infraestrutura (Backend)
O motor operacional do negócio é desenhado para não ter intervenção humana.

### A. VPS Docker (`docker-infra/docker-compose.yml`)
*   **Typebot Builder & Viewer:** Orquestração do fluxo conversacional e geração de cobranças Pix via Mercado Pago.
*   **Evolution API & Manager:** Gateway não oficial do WhatsApp para envio e recebimento de mensagens sem custo por sessão.
*   **Redis & PostgreSQL:** Bancos de dados de suporte para o Typebot e mensageria.

### B. Cérebro de Automação (n8n)
O workflow `lp-whatsapp-delivery.workflow.ts` processa a entrega após a confirmação do pagamento:
1.  Recebe o **Webhook** de confirmação de pagamento do Mercado Pago/Typebot.
2.  Aciona a API do **Gemini 1.5 Flash** para construir um prompt hiper-detalhado de engenharia reversa (baseado no estilo que o cliente escolheu). *Possui lógica de Retry de 3 tentativas para mitigar erros 429 de sobrecarga da API do Google.*
3.  Aciona a API da **Fal.ai** para gerar as imagens fotorealistas em milissegundos. *(Lógica desenhada em Loop para múltiplas fotos dependendo do pacote).*
4.  Faz o upload do resultado em uma pasta única do **Google Drive**.
5.  Envia o Link do Drive e uma mensagem de agradecimento ao cliente via **Evolution API**. *(Possui nó de Fallback (Continue On Fail) para disparar o WhatsApp através de uma instância Backup caso o chip principal seja banido ou desconectado).*
6.  **Recuperação de Carrinho:** Um nó paralelo de `Wait` de 20 minutos re-aborda o cliente caso o status do Pix permaneça como `PENDING`.

---

## 🚀 3. Roteiro de Validação (O que Fazer Amanhã)

Para darmos vida a este repositório e testar o fluxo de ponta a ponta na próxima sessão, os seguintes passos devem ser executados:

- [ ] **Configuração de Chaves (n8n):** Inserir as Credenciais de Produção das APIs do Gemini, Fal.ai e Google Drive (OAuth2) na instância n8n.
- [ ] **Deploy na VPS:** Acessar a VPS via SSH e rodar `docker-compose up -d` para subir todos os containers do Typebot e Evolution.
- [ ] **Desenho Conversacional:** Construir o fluxo "Nó a Nó" dentro do painel do Typebot (Receber mensagem paramétrica -> Validar plano -> Gerar Pix Dinâmico -> Aguardar Pagamento).
- [ ] **Teste de Fogo E2E (End-to-End):** O cliente (nós) clica no botão Premium do site -> Typebot gera Pix -> Pagamos o Pix -> n8n recebe o Webhook -> IA gera foto -> Recebemos no nosso WhatsApp real a pasta do Drive pronta.
