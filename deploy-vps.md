# Como fazer o Deploy na Hostinger VPS

Siga este passo a passo para subir o seu ambiente (Typebot, Evolution, Redis e Postgres) na sua VPS.

### Passo 1: Acessar a VPS
Abra o seu terminal (CMD, PowerShell ou Terminal do Mac) e faça o login via SSH usando o IP da sua máquina Hostinger:
```bash
ssh root@SEU_IP_DA_HOSTINGER
```
*(Ele vai pedir a senha que você configurou no painel da Hostinger)*

### Passo 2: Criar a pasta do projeto
Assim que estiver logado, crie uma pasta para guardar a infraestrutura e entre nela:
```bash
mkdir -p /root/ensaio-infra
cd /root/ensaio-infra
```

### Passo 3: Subir o Docker Compose
Copie o conteúdo do arquivo `docker-infra/docker-compose.yml` que criamos na nossa sessão anterior e crie o arquivo lá dentro da VPS:
```bash
nano docker-compose.yml
```
*(Cole o conteúdo, aperte `CTRL+X`, digite `Y` e depois `Enter` para salvar).*

### Passo 4: Rodar a mágica
Agora, basta pedir para o Docker baixar as imagens e iniciar tudo em background:
```bash
docker-compose up -d
```

### Passo 5: Verificar se está rodando
Execute o comando abaixo para ver todos os serviços online ("Up"):
```bash
docker-compose ps
```

Pronto! A partir desse momento:
- A sua Evolution API estará rodando na porta `8080` (e o Manager na `8081`).
- O seu Typebot Builder estará na porta `8082` e o Viewer na `8083`.
- O Postgres e o Redis estarão rodando de forma invisível dando suporte a tudo isso.
