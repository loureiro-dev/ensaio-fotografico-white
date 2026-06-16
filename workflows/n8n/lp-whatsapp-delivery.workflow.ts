import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LensAI - Master Flow (Typebot + N8N + Evolution)
// Nodes   : 11  |  Connections: 10
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookGatewayTypebot              webhook
// CheckPaymentStatus                 if
// DiscordVendaRealizada              httpRequest
// MetaCapiPurchase                   httpRequest
// GeminiEngenheiroDePrompt           googleGemini
// FalAiLoopDeGeracao                 httpRequest
// CriarPastaGoogleDrive              googleDrive
// EvolutionApiEntregaVip             httpRequest
// DiscordCarrinhoAbandonado          httpRequest
// Aguardar15Minutos                  wait
// EvolutionApiRecuperacao            httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookGatewayTypebot
//    → CheckPaymentStatus
//      → DiscordVendaRealizada
//        → MetaCapiPurchase
//          → GeminiEngenheiroDePrompt
//            → FalAiLoopDeGeracao
//              → CriarPastaGoogleDrive
//                → EvolutionApiEntregaVip
//     .out(1) → DiscordCarrinhoAbandonado
//        → Aguardar15Minutos
//          → EvolutionApiRecuperacao
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'CzETZKj5pU9O1To6',
    name: 'LensAI - Master Flow (Typebot + N8N + Evolution)',
    active: false,
    isArchived: false,
    settings: { executionOrder: 'v1' },
})
export class LensaiMasterFlowTypebotN8nEvolutionWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'webhook-checkout',
        webhookId: 'lensai-master-webhook',
        name: 'Webhook Gateway/Typebot',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [100, 300],
    })
    WebhookGatewayTypebot = {
        responseBinaryPropertyName: 'data',
        multipleMethods: false,
        httpMethod: 'POST',
        path: 'checkout-lensai',
        authentication: 'none',
        responseMode: 'onReceived',
        responseCode: 200,
    };

    @node({
        id: 'if-payment',
        name: 'Check Payment Status',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [350, 300],
    })
    CheckPaymentStatus = {
        conditions: {
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
        id: 'discord-paid',
        name: 'Discord: Venda Realizada',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [600, 100],
    })
    DiscordVendaRealizada = {
        url: 'https://discord.com/api/webhooks/SEU_WEBHOOK_AQUI',
        method: 'POST',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            content: `💰 **NOVA VENDA LENS.AI!** 🎉
**Cliente:** {{ $node['Webhook Gateway/Typebot'].json.body.clientName }}
**Tema Escolhido:** {{ $node['Webhook Gateway/Typebot'].json.body.theme }}
**Valor:** R$ {{ $node['Webhook Gateway/Typebot'].json.body.amount }}`,
        },
    };

    @node({
        id: 'meta-capi',
        name: 'Meta CAPI (Purchase)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [850, 100],
    })
    MetaCapiPurchase = {
        url: 'https://graph.facebook.com/v19.0/SEU_PIXEL_ID/events',
        method: 'POST',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: '={{ Math.floor(Date.now() / 1000) }}',
                    action_source: 'website',
                    custom_data: {
                        currency: 'BRL',
                        value: "={{ $node['Webhook Gateway/Typebot'].json.body.amount }}",
                    },
                },
            ],
            access_token: 'SEU_TOKEN_CAPI',
        },
    };

    @node({
        id: 'gemini-prompt',
        name: 'Gemini (Engenheiro de Prompt)',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.2,
        position: [1100, 100],
    })
    GeminiEngenheiroDePrompt = {
        resource: 'text',
        operation: 'generate',
        modelId: {
            mode: 'list',
            value: 'gemini-1.5-flash',
        },
        text: "Atue como um diretor de arte de IA. O cliente solicitou um ensaio com o tema: '{{ $node['Webhook Gateway/Typebot'].json.body.theme }}'. Traduza este tema para um prompt altamente detalhado e hiper-realista em inglês para o motor FLUX. Retorne APENAS o prompt.",
    };

    @node({
        id: 'fal-ai-loop',
        name: 'Fal.ai (Loop de Geração)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1350, 100],
    })
    FalAiLoopDeGeracao = {
        url: 'https://fal.run/fal-ai/flux-pro',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            prompt: "={{ $node['Gemini (Engenheiro de Prompt)'].json.text }}",
            image_url: "={{ $node['Webhook Gateway/Typebot'].json.body.clientPhotoUrls[0] }}",
        },
    };

    @node({
        id: 'drive-folder',
        name: 'Criar Pasta Google Drive',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [1600, 100],
    })
    CriarPastaGoogleDrive = {
        resource: 'folder',
        operation: 'create',
        name: "={{ $node['Webhook Gateway/Typebot'].json.body.clientName }} - {{ $node['Webhook Gateway/Typebot'].json.body.theme }}",
    };

    @node({
        id: 'evolution-delivery',
        name: 'Evolution API (Entrega VIP)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1850, 100],
    })
    EvolutionApiEntregaVip = {
        url: 'http://evolution-api:8080/message/sendText/Instancia_Oficial',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            number: "={{ $node['Webhook Gateway/Typebot'].json.body.clientNumber }}",
            text: "Obrigado por aguardar, {{ $node['Webhook Gateway/Typebot'].json.body.clientName }}! 🎉 Suas fotos incríveis no tema *{{ $node['Webhook Gateway/Typebot'].json.body.theme }}* ficaram prontas. Acesse seu Drive VIP exclusivo para baixar em altíssima qualidade: https://drive.google.com/drive/folders/{{ $node['Criar Pasta Google Drive'].json.id }}?usp=sharing",
        },
    };

    @node({
        id: 'discord-pending',
        name: 'Discord: Carrinho Abandonado',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [600, 450],
    })
    DiscordCarrinhoAbandonado = {
        url: 'https://discord.com/api/webhooks/SEU_WEBHOOK_AQUI',
        method: 'POST',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            content:
                "🟡 **CARRINHO PENDENTE!** O lead {{ $node['Webhook Gateway/Typebot'].json.body.clientName }} gerou o Pix mas não pagou ainda. Monitorando...",
        },
    };

    @node({
        id: 'wait-15-mins',
        webhookId: 'b6d2088b-445a-42a3-8349-18a93828e108',
        name: 'Aguardar 15 Minutos',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [850, 450],
    })
    Aguardar15Minutos = {
        amount: 15,
        unit: 'minutes',
    };

    @node({
        id: 'evolution-abandoned',
        name: 'Evolution API (Recuperação)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1100, 450],
    })
    EvolutionApiRecuperacao = {
        url: 'http://evolution-api:8080/message/sendText/Instancia_Oficial',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: {
            number: "={{ $node['Webhook Gateway/Typebot'].json.body.clientNumber }}",
            text: "Opa {{ $node['Webhook Gateway/Typebot'].json.body.clientName }}, tudo bem? Vi que você iniciou o processo do seu ensaio mas o Pix não compensou aqui nos servidores. Teve alguma dificuldade com o app do banco? Me avise se precisar de ajuda!",
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookGatewayTypebot.out(0).to(this.CheckPaymentStatus.in(0));
        this.CheckPaymentStatus.out(0).to(this.DiscordVendaRealizada.in(0));
        this.CheckPaymentStatus.out(1).to(this.DiscordCarrinhoAbandonado.in(0));
        this.DiscordVendaRealizada.out(0).to(this.MetaCapiPurchase.in(0));
        this.MetaCapiPurchase.out(0).to(this.GeminiEngenheiroDePrompt.in(0));
        this.GeminiEngenheiroDePrompt.out(0).to(this.FalAiLoopDeGeracao.in(0));
        this.FalAiLoopDeGeracao.out(0).to(this.CriarPastaGoogleDrive.in(0));
        this.CriarPastaGoogleDrive.out(0).to(this.EvolutionApiEntregaVip.in(0));
        this.DiscordCarrinhoAbandonado.out(0).to(this.Aguardar15Minutos.in(0));
        this.Aguardar15Minutos.out(0).to(this.EvolutionApiRecuperacao.in(0));
    }
}
