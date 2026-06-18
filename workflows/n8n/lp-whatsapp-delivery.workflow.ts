import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LensAI - Master Flow (Typebot + N8N + Evolution)
// Nodes   : 21  |  Connections: 19
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookGatewayTypebot              webhook
// MercadoPagoGeraPix                 httpRequest
// RespondPixFrontend                 respondToWebhook
// AguardarPagamentoPix               wait
// VerificaStatusMercadoPago          httpRequest
// CheckPaymentStatus                 if
// DiscordVendaRealizada              httpRequest                [onError→regular]
// MetaCapiPurchase                   httpRequest                [onError→regular]
// GeminiEngenheiroDePrompt           googleGemini
// FalAiLoopDeGeracao                 httpRequest                [creds] [retry]
// CriarPastaGoogleDrive              googleDrive                [creds]
// CompartilharPastaLinkPublico       googleDrive                [creds]
// SplitImages                        itemLists
// DownloadImage                      httpRequest
// UploadToDrive                      googleDrive                [creds] [retry]
// AggregateUploads                   itemLists
// EvolutionApiEntregaVip             httpRequest
// DiscordCarrinhoAbandonado          httpRequest
// EvolutionApiRecuperacao            httpRequest
// ErrorTrigger                       errorTrigger
// DiscordAlertaDeErro                httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookGatewayTypebot
//    → MercadoPagoGeraPix
//      → RespondPixFrontend
//        → AguardarPagamentoPix
//          → VerificaStatusMercadoPago
//            → CheckPaymentStatus
//              → DiscordVendaRealizada
//                → MetaCapiPurchase
//                  → GeminiEngenheiroDePrompt
//                    → FalAiLoopDeGeracao
//                      → CriarPastaGoogleDrive
//                        → CompartilharPastaLinkPublico
//                          → SplitImages
//                            → DownloadImage
//                              → UploadToDrive
//                                → AggregateUploads
//                                  → EvolutionApiEntregaVip
//             .out(1) → DiscordCarrinhoAbandonado
//                → EvolutionApiRecuperacao
// ErrorTrigger
//    → DiscordAlertaDeErro
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'CzETZKj5pU9O1To6',
    name: 'LensAI - Master Flow (Typebot + N8N + Evolution)',
    active: false,
    isArchived: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class LensaiMasterFlowTypebotN8nEvolutionWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'webhook-checkout',
        webhookId: '4f1c79e6-f7cb-402b-a906-7b6c698d921f',
        name: 'Webhook Gateway/Typebot',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [112, 304],
    })
    WebhookGatewayTypebot = {
        httpMethod: 'POST',
        path: 'ensaio-gerar-pix',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        id: 'mercadopago-pix',
        name: 'Mercado Pago - Gera PIX',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [304, 304],
    })
    MercadoPagoGeraPix = {
        method: 'POST',
        url: 'https://api.mercadopago.com/v1/payments',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer APP_USR-SEU-TOKEN-DE-PRODUCAO',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
                {
                    name: 'X-Idempotency-Key',
                    value: '={{ $execution.id }}',
                },
            ],
        },
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'transaction_amount',
                    value: "={{ $json.body.pacote.includes('Sim!') ? 34.80 : 19.90 }}",
                },
                {
                    name: 'description',
                    value: '=Ensaio.AI – Estilo {{ $json.body.tema }}',
                },
                {
                    name: 'payment_method_id',
                    value: 'pix',
                },
                {
                    name: 'payer[email]',
                    value: "={{ $json.body.email && $json.body.email !== '' ? $json.body.email : $json.body.nome.toLowerCase().replace(/\\s+/g, '.') + '@cliente.ensaio.ai' }}",
                },
                {
                    name: 'payer[first_name]',
                    value: "={{ $json.body.nome.split(' ')[0] }}",
                },
                {
                    name: 'payer[last_name]',
                    value: "={{ $json.body.nome.split(' ').slice(1).join(' ') || 'Cliente' }}",
                },
                {
                    name: 'payer[identification][type]',
                    value: 'CPF',
                },
                {
                    name: 'payer[identification][number]',
                    value: "={{ $json.body.cpf.replace(/\\D/g, '') }}",
                },
                {
                    name: 'notification_url',
                    value: '={{ $execution.resumeUrl }}',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'respond-pix',
        name: 'Respond - PIX Frontend',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [512, 304],
    })
    RespondPixFrontend = {
        respondWith: 'json',
        responseBody:
            '={{ JSON.stringify({ success: true, pix_copia_cola: $json.point_of_interaction.transaction_data.qr_code, pix_qr_code: "data:image/png;base64," + $json.point_of_interaction.transaction_data.qr_code_base64, pix_id: String($json.id), status: "pending" }) }}',
        options: {},
    };

    @node({
        id: 'wait-pix-payment',
        webhookId: 'a8a2f584-6715-443f-8eb4-72f237db73a2',
        name: 'Aguardar Pagamento PIX',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [704, 304],
    })
    AguardarPagamentoPix = {
        resume: 'webhook',
        httpMethod: 'POST',
        limitWaitTime: true,
        resumeAmount: 30,
        resumeUnit: 'minutes',
        options: {},
    };

    @node({
        id: 'verify-mp-payment',
        name: 'Verifica Status Mercado Pago',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [912, 304],
    })
    VerificaStatusMercadoPago = {
        url: '=https://api.mercadopago.com/v1/payments/{{ $json.body.data ? $json.body.data.id : ($json.body.resource ? $json.body.resource.split("/").pop() : "") }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer APP_USR-SEU-TOKEN-DE-PRODUCAO',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'if-payment-approved',
        name: 'Check Payment Status',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1104, 304],
    })
    CheckPaymentStatus = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 1,
            },
            string: [
                {
                    value1: '={{ $json.status }}',
                    operation: 'equal',
                    value2: 'approved',
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'discord-paid',
        name: 'Discord: Venda Realizada',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1312, 112],
        onError: 'continueRegularOutput',
    })
    DiscordVendaRealizada = {
        method: 'POST',
        url: 'https://discord.com/api/webhooks/1516654928234287195/sxty3kEkNEPFLXQQmOUbQc3lSrr_pVvfxoSJ6M6wYL3qW2_TpQvh3TIOqWi8nGi1CnB1',
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'content',
                    value: `=💰 **NOVA VENDA!** 🎉
**Cliente:** {{ $('Webhook Gateway/Typebot').item.json.body.nome }}
**Estilo:** {{ $('Webhook Gateway/Typebot').item.json.body.tema }}
**Pacote:** {{ $('Webhook Gateway/Typebot').item.json.body.pacote.includes('Sim!') ? 'Premium – 15 fotos' : 'Básico – 5 fotos' }}
**Valor:** R$ {{ $json.transaction_details.total_paid_amount }}`,
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'meta-capi-purchase',
        name: 'Meta CAPI (Purchase)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1504, 112],
        onError: 'continueRegularOutput',
    })
    MetaCapiPurchase = {
        method: 'POST',
        url: 'https://graph.facebook.com/v19.0/SEU_PIXEL_ID/events?access_token=SEU_TOKEN_CAPI',
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'data',
                    value: '=[{"event_name":"Purchase","event_time":{{ Math.floor(Date.now()/1000) }},"action_source":"website","custom_data":{"currency":"BRL","value":{{ $(\'Verifica Status Mercado Pago\').item.json.transaction_details.total_paid_amount }}}}]',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'gemini-prompt-eng',
        name: 'Gemini (Engenheiro de Prompt)',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.2,
        position: [1712, 112],
    })
    GeminiEngenheiroDePrompt = {
        modelId: {
            mode: 'list',
            value: 'gemini-1.5-flash',
        },
        messages: {
            values: [
                {
                    content:
                        "=You are a professional AI art director. The client requested a photographic essay with the theme: \"{{ $('Webhook Gateway/Typebot').item.json.body.tema.includes('Outro') ? $('Webhook Gateway/Typebot').item.json.body.tema_custom : $('Webhook Gateway/Typebot').item.json.body.tema }}\". Write a detailed, high-quality image generation prompt for the FLUX model in English. Include professional studio lighting, softbox illumination, sharp face focus, fashion magazine quality, ultra realistic skin texture. Return ONLY the prompt text, no quotes, no explanations.",
                },
            ],
        },
        builtInTools: {},
        options: {},
    };

    @node({
        id: 'fal-ai-generation',
        name: 'Fal.ai (Loop de Geração)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1968, 304],
        credentials: { httpHeaderAuth: { id: 'Mv0EBqdyPyu8PlZP', name: 'Header Auth account' } },
        retryOnFail: true,
        waitBetweenTries: 5000,
    })
    FalAiLoopDeGeracao = {
        method: 'POST',
        url: 'https://fal.run/fal-ai/flux/dev',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'prompt',
                    value: '={{ $json.candidates[0].content.parts[0].text }}, portrait photo of the person in the reference image, photorealistic, 8k',
                },
                {
                    name: 'image_url',
                    value: "={{ $('Webhook Gateway/Typebot').item.json.body.fotos.split(',')[0].trim() }}",
                },
                {
                    name: 'num_images',
                    value: "={{ $('Webhook Gateway/Typebot').item.json.body.pacote.includes('Sim!') ? 15 : 5 }}",
                },
                {
                    name: 'image_size',
                    value: 'portrait_4_3',
                },
                {
                    name: 'num_inference_steps',
                    value: '28',
                },
                {
                    name: 'guidance_scale',
                    value: '7.5',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'google-drive-folder',
        name: 'Criar Pasta Google Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [2112, 112],
        credentials: { googleDriveOAuth2Api: { id: 'Vg409cZezqVSBpFc', name: 'Google Drive account' } },
    })
    CriarPastaGoogleDrive = {
        resource: 'folder',
        name: "={{ $('Webhook Gateway/Typebot').item.json.body.nome }} – Ensaio.AI – {{ $('Webhook Gateway/Typebot').item.json.body.tema }}",
        driveId: {
            __rl: true,
            value: 'My Drive',
            mode: 'list',
            cachedResultName: 'My Drive',
            cachedResultUrl: 'https://drive.google.com/drive/my-drive',
        },
        folderId: {
            mode: 'list',
            value: 'root',
        },
        options: {},
    };

    @node({
        id: 'google-drive-share',
        name: 'Compartilhar Pasta (Link Público)',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [2304, 112],
        credentials: { googleDriveOAuth2Api: { id: 'Vg409cZezqVSBpFc', name: 'Google Drive account' } },
    })
    CompartilharPastaLinkPublico = {
        operation: 'share',
        fileId: {
            mode: 'id',
            value: '={{ $json.id }}',
        },
        permissionsUi: {
            permissionsValues: {
                role: 'reader',
                type: 'anyone',
            },
        },
        options: {},
    };

    @node({
        id: 'split-images',
        name: 'Split Images',
        type: 'n8n-nodes-base.itemLists',
        version: 3.1,
        position: [2512, 112],
    })
    SplitImages = {
        fieldToSplitOut: 'images',
        options: {},
    };

    @node({
        id: 'download-image',
        name: 'Download Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [2704, 112],
    })
    DownloadImage = {
        url: '={{ $json.url }}',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        id: 'upload-drive',
        name: 'Upload to Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [2912, 112],
        credentials: { googleDriveOAuth2Api: { id: 'Vg409cZezqVSBpFc', name: 'Google Drive account' } },
        retryOnFail: true,
        waitBetweenTries: 5000,
    })
    UploadToDrive = {
        name: "={{ 'foto_' + ($position + 1) + '.jpg' }}",
        driveId: {
            __rl: true,
            value: 'My Drive',
            mode: 'list',
            cachedResultName: 'My Drive',
            cachedResultUrl: 'https://drive.google.com/drive/my-drive',
        },
        folderId: {
            mode: 'id',
            value: "={{ $('Criar Pasta Google Drive').item.json.id }}",
        },
        options: {},
    };

    @node({
        id: 'aggregate-uploads',
        name: 'Aggregate Uploads',
        type: 'n8n-nodes-base.itemLists',
        version: 3.1,
        position: [3104, 112],
    })
    AggregateUploads = {
        operation: 'concatenateItems',
        fieldsToAggregate: {
            fieldToAggregate: [{}],
        },
        options: {},
    };

    @node({
        id: 'evolution-delivery-vip',
        name: 'Evolution API (Entrega VIP)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [2512, 352],
    })
    EvolutionApiEntregaVip = {
        method: 'POST',
        url: 'https://evolution.meuensaio.digital/message/sendText/Instancia_Oficial',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'SUA_API_KEY_EVOLUTION',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'number',
                    value: "={{ $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '').startsWith('55') ? $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '') : '55' + $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '') }}",
                },
                {
                    name: 'text',
                    value: `=Olá, {{ $('Webhook Gateway/Typebot').item.json.body.nome }}! 🎉 Seu Ensaio.AI está pronto!

Criamos {{ $('Webhook Gateway/Typebot').item.json.body.pacote.includes('Sim!') ? '15 fotos incríveis' : '5 fotos profissionais' }} no estilo *{{ $('Webhook Gateway/Typebot').item.json.body.tema }}* especialmente para você.

Acesse sua pasta VIP exclusiva e baixe em alta resolução:
🔗 https://drive.google.com/drive/folders/{{ $('Criar Pasta Google Drive').item.json.id }}?usp=sharing

Obrigado por escolher a Ensaio.AI! 📸✨`,
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'discord-abandoned',
        name: 'Discord: Carrinho Abandonado',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1312, 512],
    })
    DiscordCarrinhoAbandonado = {
        method: 'POST',
        url: 'https://discord.com/api/webhooks/1516655519165583492/Q1x5MaxYT7Mj4QBy5OojQGVKuGg-HcEnhcUVmsQqHrziHs9eV3yJwoy1tpwXLpHiUqMZ',
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'content',
                    value: `=🟡 **CARRINHO ABANDONADO**
**Cliente:** {{ $('Webhook Gateway/Typebot').item.json.body.nome }}
**WhatsApp:** {{ $('Webhook Gateway/Typebot').item.json.body.whatsapp }}
**Estilo escolhido:** {{ $('Webhook Gateway/Typebot').item.json.body.tema }}
**Status:** Pix não pago após 30 min. Disparando recuperação...`,
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'evolution-recuperacao',
        name: 'Evolution API (Recuperação)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1504, 512],
    })
    EvolutionApiRecuperacao = {
        method: 'POST',
        url: 'https://evolution.meuensaio.digital/message/sendText/Instancia_Oficial',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'SUA_API_KEY_EVOLUTION',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'number',
                    value: "={{ $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '').startsWith('55') ? $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '') : '55' + $('Webhook Gateway/Typebot').item.json.body.whatsapp.replace(/\\D/g, '') }}",
                },
                {
                    name: 'text',
                    value: `=Olá {{ $('Webhook Gateway/Typebot').item.json.body.nome }}! 👋

Vi que você iniciou o seu Ensaio.AI com o estilo *{{ $('Webhook Gateway/Typebot').item.json.body.tema }}*, mas o pagamento do Pix não foi confirmado.

Se ficou alguma dúvida ou teve algum problema, é só me responder aqui que te ajudo! 😊

Seu ensaio ainda pode ser criado, é só finalizar o pagamento.`,
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'error-trigger',
        name: 'Error Trigger',
        type: 'n8n-nodes-base.errorTrigger',
        version: 1,
        position: [112, 704],
    })
    ErrorTrigger = {};

    @node({
        id: 'discord-error-alert',
        name: 'Discord: Alerta de Erro',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [304, 704],
    })
    DiscordAlertaDeErro = {
        method: 'POST',
        url: 'https://discord.com/api/webhooks/1516655874779910338/NGru20v7sN2-wGR4v2-1gI7yNunixeaToKyLhQ_ORlExvbHJc4Bx1WBa67h2iNN9oq-J',
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'content',
                    value: `=🚨 **ERRO DE EXECUÇÃO NO FUNIL LENS.AI** 🚨

**Node com erro:** {{ $json.execution.error.node.name }}
**Mensagem de erro:** {{ $json.execution.error.message }}
**Execution ID:** {{ $json.execution.id }}

Verifique o painel do n8n para debugar e fazer a entrega manual se necessário:
🔗 {{ $json.execution.url }}`,
                },
            ],
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookGatewayTypebot.out(0).to(this.MercadoPagoGeraPix.in(0));
        this.MercadoPagoGeraPix.out(0).to(this.RespondPixFrontend.in(0));
        this.RespondPixFrontend.out(0).to(this.AguardarPagamentoPix.in(0));
        this.AguardarPagamentoPix.out(0).to(this.VerificaStatusMercadoPago.in(0));
        this.VerificaStatusMercadoPago.out(0).to(this.CheckPaymentStatus.in(0));
        this.CheckPaymentStatus.out(0).to(this.DiscordVendaRealizada.in(0));
        this.CheckPaymentStatus.out(1).to(this.DiscordCarrinhoAbandonado.in(0));
        this.DiscordVendaRealizada.out(0).to(this.MetaCapiPurchase.in(0));
        this.MetaCapiPurchase.out(0).to(this.GeminiEngenheiroDePrompt.in(0));
        this.GeminiEngenheiroDePrompt.out(0).to(this.FalAiLoopDeGeracao.in(0));
        this.FalAiLoopDeGeracao.out(0).to(this.CriarPastaGoogleDrive.in(0));
        this.CriarPastaGoogleDrive.out(0).to(this.CompartilharPastaLinkPublico.in(0));
        this.CompartilharPastaLinkPublico.out(0).to(this.SplitImages.in(0));
        this.SplitImages.out(0).to(this.DownloadImage.in(0));
        this.DownloadImage.out(0).to(this.UploadToDrive.in(0));
        this.UploadToDrive.out(0).to(this.AggregateUploads.in(0));
        this.AggregateUploads.out(0).to(this.EvolutionApiEntregaVip.in(0));
        this.DiscordCarrinhoAbandonado.out(0).to(this.EvolutionApiRecuperacao.in(0));
        this.ErrorTrigger.out(0).to(this.DiscordAlertaDeErro.in(0));
    }
}
