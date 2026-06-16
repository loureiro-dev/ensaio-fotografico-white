import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LensAI - Entrega Premium WhatsApp + Drive
// Nodes   : 14  |  Connections: 13
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookPixStatus                   webhook
// VerificarPagamento                 if
// EngenheiroDePromptGemini           googleGemini               [retry]
// GerarImagemFalAi                   httpRequest
// CriarPastaGoogleDrive              googleDrive
// DownloadImagem                     httpRequest
// UploadDrive                        googleDrive
// AlterarPermissaoDrive              googleDrive
// DisparoInstanciaA                  httpRequest
// ChecarFalhaDeEntrega               if
// DisparoBackupInstanciaB            httpRequest
// VerificarPendente                  if
// Aguardar20Minutos                  wait
// DispararRecuperacaoTypebot         httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookPixStatus
//    → VerificarPagamento
//      → EngenheiroDePromptGemini
//        → GerarImagemFalAi
//          → CriarPastaGoogleDrive
//            → DownloadImagem
//              → UploadDrive
//                → AlterarPermissaoDrive
//                  → DisparoInstanciaA
//                    → ChecarFalhaDeEntrega
//                      → DisparoBackupInstanciaB
//     .out(1) → VerificarPendente
//        → Aguardar20Minutos
//          → DispararRecuperacaoTypebot
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'p0d51VcmYpojsIdT',
    name: 'LensAI - Entrega Premium WhatsApp + Drive',
    active: false,
    isArchived: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class LensaiEntregaPremiumWhatsappDriveWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '1a85947c-be23-40e5-9f01-a249cfbe6cee',
        webhookId: '073dde87-2a80-4802-a8e2-feb390ec14d5',
        name: 'Webhook Pix Status',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [100, 300],
    })
    WebhookPixStatus = {
        responseBinaryPropertyName: 'data',
        multipleMethods: false,
        httpMethod: 'POST',
        path: 'pix-status',
        authentication: 'none',
        responseMode: 'onReceived',
        responseCode: 200,
    };

    @node({
        id: '90d86f35-5286-49e6-8ab8-742688315028',
        name: 'Verificar Pagamento',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [350, 300],
    })
    VerificarPagamento = {
        conditions: {
            boolean: [],
            number: [],
            string: [
                {
                    value1: '={{ $json.body.paymentStatus }}',
                    operation: 'equal',
                    value2: 'PAID',
                },
            ],
        },
    };

    @node({
        id: '9955ac9a-38c5-4af8-879a-cd8dc9d6290a',
        name: 'Engenheiro de Prompt (Gemini)',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.2,
        position: [600, 100],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 5000,
    })
    EngenheiroDePromptGemini = {
        resource: 'text',
        operation: 'generate',
        modelId: {
            mode: 'list',
            value: 'gemini-1.5-flash',
        },
        text: "Atue como um fotógrafo profissional e especialista em IA. O cliente pediu o seguinte estilo de foto: {{ $node['Webhook Pix Status'].json.body.style }}. Traduza isso para um prompt em INGLÊS altamente técnico, focado em hiper-realismo e resolução 8k para a ferramenta fal.ai. Retorne APENAS o prompt em inglês.",
    };

    @node({
        id: 'b8cc18f1-c7b8-44e5-92f4-745f36384c8d',
        name: 'Gerar Imagem Fal.ai',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [850, 100],
    })
    GerarImagemFalAi = {
        url: 'https://fal.run/fal-ai/flux-pro',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            prompt: "={{ $node['Engenheiro de Prompt (Gemini)'].json.text }}",
            image_url: "={{ $node['Webhook Pix Status'].json.body.clientPhotoUrl }}",
        },
    };

    @node({
        id: '47e796ad-1460-4a22-a2e4-08ac7ae02779',
        name: 'Criar Pasta Google Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [1100, 100],
    })
    CriarPastaGoogleDrive = {
        resource: 'folder',
        operation: 'create',
        name: "={{ $node['Webhook Pix Status'].json.body.clientName }} - {{ $node['Webhook Pix Status'].json.body.style }} - {{ $now.format('dd-MM') }}",
        options: {},
    };

    @node({
        id: 'b7750338-6850-40d3-99cb-7e2611fe74d5',
        name: 'Download Imagem',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1350, 100],
    })
    DownloadImagem = {
        url: '={{ $json.images[0].url }}',
        method: 'GET',
        authentication: 'none',
    };

    @node({
        id: '3225c793-3a66-4458-913d-54b7d2954083',
        name: 'Upload Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [1600, 100],
    })
    UploadDrive = {
        resource: 'file',
        operation: 'upload',
        driveId: {
            mode: 'list',
            value: '',
        },
        folderId: {
            mode: 'id',
            value: "={{ $node['Criar Pasta Google Drive'].json.id }}",
        },
        inputDataFieldName: 'data',
    };

    @node({
        id: 'be98e92f-a3d2-46eb-ba27-3d1fbc85736a',
        name: 'Alterar Permissao Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [1850, 100],
    })
    AlterarPermissaoDrive = {
        resource: 'file',
        operation: 'update',
        fileId: {
            mode: 'id',
            value: "={{ $node['Criar Pasta Google Drive'].json.id }}",
        },
        permissionsUi: {
            permissionsValues: [
                {
                    role: 'reader',
                    type: 'anyone',
                },
            ],
        },
    };

    @node({
        id: '72c7a735-09fd-4b34-971b-608338d0eab5',
        name: 'Disparo Instancia A',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [2100, 100],
    })
    DisparoInstanciaA = {
        url: 'http://sua-evolution-api/message/sendText/Instancia_A',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            number: "={{ $node['Webhook Pix Status'].json.body.clientNumber }}",
            text: "Suas fotos ficaram prontas! 🎉 Preparamos um link exclusivo na nuvem para você baixar em alta resolução: https://drive.google.com/drive/folders/{{ $node['Criar Pasta Google Drive'].json.id }}?usp=sharing",
        },
    };

    @node({
        id: '1bd3e862-ce01-4ad8-a04c-5bff7c79769a',
        name: 'Checar Falha de Entrega',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [2350, 100],
    })
    ChecarFalhaDeEntrega = {
        conditions: {
            boolean: [],
            number: [],
            string: [
                {
                    value1: '={{ $json.error }}',
                    operation: 'notEmpty',
                },
            ],
        },
    };

    @node({
        id: '0cc5f8ea-b84a-45dc-a4c1-7394bad7df1f',
        name: 'Disparo Backup (Instancia B)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [2600, -50],
    })
    DisparoBackupInstanciaB = {
        url: 'http://sua-evolution-api/message/sendText/Instancia_B',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            number: "={{ $node['Webhook Pix Status'].json.body.clientNumber }}",
            text: "Nosso sistema principal teve uma instabilidade de rede, mas fizemos questão de entregar agora! 🎉 Segue o link exclusivo na nuvem com suas fotos em alta resolução: https://drive.google.com/drive/folders/{{ $node['Criar Pasta Google Drive'].json.id }}?usp=sharing",
        },
    };

    @node({
        id: 'd654f960-6981-4618-89f9-f31ee8df676a',
        name: 'Verificar Pendente',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [600, 450],
    })
    VerificarPendente = {
        conditions: {
            string: [
                {
                    value1: "={{ $node['Webhook Pix Status'].json.body.paymentStatus }}",
                    operation: 'equal',
                    value2: 'PENDING',
                },
            ],
        },
    };

    @node({
        id: 'cc1f2dac-ef18-4bcf-8aa8-2f9e86f0785a',
        webhookId: 'fa6138ac-9ba2-405a-93a6-fb99c8fb6b2b',
        name: 'Aguardar 20 Minutos',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [850, 400],
    })
    Aguardar20Minutos = {
        amount: 20,
        unit: 'minutes',
    };

    @node({
        id: '60abadf3-b0f4-47aa-92ad-59e1269ddbd6',
        name: 'Disparar Recuperacao Typebot',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1100, 400],
    })
    DispararRecuperacaoTypebot = {
        url: 'http://sua-evolution-api/message/sendText/Instancia_A',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            number: "={{ $node['Webhook Pix Status'].json.body.clientNumber }}",
            text: "Opa {{ $node['Webhook Pix Status'].json.body.clientName }}, vi que você gerou o pedido do ensaio mas o Pix não compensou. Teve algum erro? Se precisar de ajuda ou quiser trocar de pacote, pode me responder aqui!",
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookPixStatus.out(0).to(this.VerificarPagamento.in(0));
        this.VerificarPagamento.out(0).to(this.EngenheiroDePromptGemini.in(0));
        this.VerificarPagamento.out(1).to(this.VerificarPendente.in(0));
        this.EngenheiroDePromptGemini.out(0).to(this.GerarImagemFalAi.in(0));
        this.GerarImagemFalAi.out(0).to(this.CriarPastaGoogleDrive.in(0));
        this.CriarPastaGoogleDrive.out(0).to(this.DownloadImagem.in(0));
        this.DownloadImagem.out(0).to(this.UploadDrive.in(0));
        this.UploadDrive.out(0).to(this.AlterarPermissaoDrive.in(0));
        this.AlterarPermissaoDrive.out(0).to(this.DisparoInstanciaA.in(0));
        this.DisparoInstanciaA.out(0).to(this.ChecarFalhaDeEntrega.in(0));
        this.ChecarFalhaDeEntrega.out(0).to(this.DisparoBackupInstanciaB.in(0));
        this.VerificarPendente.out(0).to(this.Aguardar20Minutos.in(0));
        this.Aguardar20Minutos.out(0).to(this.DispararRecuperacaoTypebot.in(0));
    }
}
