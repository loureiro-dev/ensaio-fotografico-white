# Guia de Compra e Configuração da sua própria VPS

Como a nossa infraestrutura roda um ecossistema pesado (Typebot, Bancos de Dados Relacionais e APIs de WhatsApp simultâneas), não podemos usar a VPS mais fraca do mercado, mas também não precisamos gastar uma fortuna.

Aqui está o guia exato para você assinar e configurar sua própria máquina sem cometer erros.

## 🛒 1. Qual configuração escolher?

Recomendo a **Hostinger** (por ter ótimo custo-benefício e painel fácil) ou a **Hetzner** (melhor performance do mundo, mas painel mais técnico). Se for de Hostinger, busque os planos "KVM":

*   **O Mínimo Viável (MVP):** Plano com **2 vCPUs e 4GB de RAM** (Geralmente o KVM 1 ou KVM 2 da Hostinger).
    *   *Por que 4GB?* O Postgres (banco de dados) e a Evolution API (motor do WhatsApp) consomem bastante memória. Se você rodar com 1GB ou 2GB de RAM, o servidor vai travar no meio do fluxo e o WhatsApp do seu cliente vai parar de responder.
*   **O Recomendado (Para Escalar):** **2 a 4 vCPUs e 8GB de RAM**. Se você for investir pesado em tráfego pago, esse é o ideal para não ter gargalos.

## 💻 2. Escolhendo o Sistema Operacional
Na hora de finalizar a compra, o painel vai te perguntar qual "Sistema Operacional" ou "Template" você quer instalar.

1.  **Escolha Linux:** (Nunca escolha Windows Server).
2.  **Distribuição:** Escolha **Ubuntu 22.04 LTS** (ou 24.04 LTS). O "LTS" significa suporte de longo prazo. É o sistema mais amigável, estável e com 100% de compatibilidade com o nosso script Docker.
3.  **Atenção:** Alguns painéis oferecem templates tipo "Ubuntu com Docker" já pré-instalado. Você pode escolher esse para economizar tempo, ou apenas o Ubuntu "Liso/Plain" e instalamos o Docker na mão.

## 🔐 3. Configurando a Segurança Inicial
1.  **A Senha Root:** Durante a criação, você será obrigado a criar uma senha para o usuário `root`. **Guarde essa senha a sete chaves**. Ela é a chave-mestra do seu servidor. Crie uma senha com letras maiúsculas, minúsculas, números e caracteres especiais.
2.  **Anotando o IP:** Após cerca de 5 a 10 minutos, a Hostinger vai te dar um **Endereço de IP Público** (ex: `193.168.1.55`). Copie esse IP.

## 🚀 4. Acessando sua máquina nova pela primeira vez
Abra o PowerShell (se estiver no Windows) ou o Terminal (se estiver no Mac) e digite:

```bash
ssh root@COLOQUE_SEU_IP_AQUI
```
Ele vai perguntar *"Are you sure you want to continue connecting?"*. Digite `yes` e dê Enter.
Depois, cole aquela senha forte que você criou. (Nota: No Linux, quando você digita a senha no terminal, ela fica invisível, não aparece nem asteriscos. Confie, cole e dê Enter).

## 🐳 5. Preparando o Terreno (Docker)
Se você escolheu o Ubuntu limpo, precisamos instalar o Docker antes de rodar o nosso projeto. Com você logado na máquina preta, rode este comando mágico (ele faz tudo sozinho):

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
```

Depois que ele terminar, instale o Docker Compose:
```bash
apt install docker-compose -y
```

**Parabéns! Sua VPS está pronta.**
A partir daqui, você pode seguir exatamente os Passos 2, 3 e 4 daquele arquivo `deploy-vps.md` que eu criei para você anteriormente!
