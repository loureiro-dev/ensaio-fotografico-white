import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : My workflow 2
// Nodes   : 13  |  Connections: 9
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// _1RecebePedido                     webhook
// _2ContaSimplesGeraPix              httpRequest                [onError→out(1)] [creds]
// _3RespondPixFrontend               respondToWebhook
// _3bRespondErroPix                  respondToWebhook
// _4AguardarPagamentoPix             wait                       [onError→out(1)]
// _4bWhatsappCarrinhoAbandonado      httpRequest
// _5SwitchTema                       switch
// _6aPromptAniversario               set
// _6bPromptGravidez                  set
// _6cPromptProfissional              set
// _6dIaTraduzTemaLivre               httpRequest
// _7FalAiGeraImagens                 httpRequest
// _8EnviarEMail                      emailSend                  [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// _1RecebePedido
//    → _3RespondPixFrontend
//      → _5SwitchTema
//        → _6aPromptAniversario
//          → _7FalAiGeraImagens
//            → _8EnviarEMail
//       .out(1) → _6bPromptGravidez
//          → _7FalAiGeraImagens (↩ loop)
//       .out(2) → _6cPromptProfissional
//          → _7FalAiGeraImagens (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'KV1ZA2PUHQ0M5RyT',
    name: 'My workflow 2',
    active: false,
    isArchived: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: false },
})
export class MyWorkflow2Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '55315816-fecd-4cc2-ba9e-38e19de3d6d2',
        webhookId: 'a0559f40-2fc2-4f12-a721-8699f23ebb2a',
        name: '1. Recebe Pedido',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2944, 160],
    })
    _1RecebePedido = {
        httpMethod: 'POST',
        path: 'comprar-web',
        responseMode: 'responseNode',
        options: {
            rawBody: false,
        },
    };

    @node({
        id: 'fec0118b-53b9-4923-9d3d-e191c2bdecd6',
        name: '2. Conta Simples – Gera PIX',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2704, 160],
        credentials: { oAuth2Api: { id: 'jt2iLsD5Kjw2rNqe', name: 'Unnamed credential' } },
        onError: 'continueErrorOutput',
    })
    _2ContaSimplesGeraPix = {
        curlImport: '',
        method: 'POST',
        url: 'https://api-sandbox.contasimples.com/v1/pix',
        authentication: 'genericCredentialType',
        genericAuthType: 'oAuth2Api',
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
        specifyBody: 'json',
        jsonBody: `={
  "amount": 1990,
  "description": "LensAI – Ensaio {{ $json.body.tema }}",
  "expiration_seconds": 1800
}`,
        options: {
            timeout: 30000,
            ignoreResponseCode: true,
        },
    };

    @node({
        id: '63b40818-9d3f-4bb2-ab9d-25c28b0069f9',
        name: '3. Respond – PIX Frontend',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [-2464, 160],
    })
    _3RespondPixFrontend = {
        respondWith: 'json',
        responseBody: `={
  "success": true,
  "pix_copia_e_cola": "00020101021126580014br.gov.bcb.pix0136mock-pix-para-teste-do-sistema520400005303986540519.905802BR5906LensAI6009Sao Paulo62070503***6304ABCD",
  "pix_qr_code": "",
  "pix_id": "mock-test",
  "expira_em": "2030-01-01"
}`,
        options: {
            responseCode: 200,
        },
    };

    @node({
        id: '7a833caf-5870-4b01-864d-78df42965204',
        name: '3b. Respond – Erro PIX',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [-2464, 368],
    })
    _3bRespondErroPix = {
        respondWith: 'json',
        responseBody: `={
  "success": false,
  "error": "Falha ao gerar PIX",
  "detalhe": "{{ $json.message }}"
}`,
        options: {
            responseCode: 500,
        },
    };

    @node({
        id: '82f3f016-e543-4ca0-a5cd-8011b3f1c589',
        webhookId: '72fe4cc7-3032-494d-858a-8d730479e8bc',
        name: '4. Aguardar Pagamento PIX',
        type: 'n8n-nodes-base.wait',
        version: 1,
        position: [-2224, 160],
        onError: 'continueErrorOutput',
    })
    _4AguardarPagamentoPix = {
        resume: 'webhook',
        options: {},
    };

    @node({
        id: '84b30666-fd0a-4d1e-b4cb-fc4435364021',
        name: '4b. WhatsApp Carrinho Abandonado',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2064, 368],
    })
    _4bWhatsappCarrinhoAbandonado = {
        method: 'POST',
        url: 'http://SUA_VPS:8080/message/sendText/NOME_INSTANCIA',
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
        specifyBody: 'json',
        jsonBody: `={
  "number": "{{ $('1. Recebe Pedido').item.json.body.whatsapp }}",
  "text": "Opa! Vimos que você tentou gerar um Ensaio Profissional com IA mas seu PIX de R$ 19,90 expirou. 😔\\n\\nAinda quer as fotos? Me chama aqui que eu gero um novo código pra você!"
}`,
        options: {},
    };

    @node({
        id: '5d0b1548-2b52-446e-a0fa-f7fe5e526c78',
        name: '5. Switch Tema',
        type: 'n8n-nodes-base.switch',
        version: 3,
        position: [-1984, 160],
    })
    _5SwitchTema = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 1,
                        },
                        conditions: [
                            {
                                leftValue: '',
                                rightValue: '',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                },
            ],
        },
        options: {},
    };

    @node({
        id: '57139bd8-613d-4860-914a-d98230d2823d',
        name: '6a. Prompt Aniversário',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1744, -80],
    })
    _6aPromptAniversario = {
        assignments: {
            assignments: [
                {
                    id: 'a1',
                    name: 'prompt_final',
                    type: 'string',
                    value: 'High-end birthday portrait photography of a person, studio background filled with soft bokeh golden and silver luxury balloons. Subject is smiling beautifully, wearing an elegant celebratory outfit. Cinematic lighting with subtle sparkles in the air, captured on 85mm lens, sharp focus on facial features, photorealistic texture, editorial magazine cover quality, 8k resolution.',
                },
                {
                    id: 'a2',
                    name: 'tema_label',
                    type: 'string',
                    value: 'Aniversário',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'fb6b586b-c72f-40ba-82aa-054ef968b56a',
        name: '6b. Prompt Gravidez',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1744, 80],
    })
    _6bPromptGravidez = {
        assignments: {
            assignments: [
                {
                    id: 'b1',
                    name: 'prompt_final',
                    type: 'string',
                    value: 'Fine art maternity studio portrait of a pregnant woman. Elegant background with soft draped silk fabrics and warm golden hour lighting filtering through. She is wearing a flowing, semi-sheer premium white gown, gently cradling her baby bump. Serene, emotional and intimate atmosphere, soft focus background, dreamy bokeh, photorealistic, cinematic volumetric lighting, 8k.',
                },
                {
                    id: 'b2',
                    name: 'tema_label',
                    type: 'string',
                    value: 'Gravidez',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '40605790-f390-4a53-8c84-5db94fa34a2a',
        name: '6c. Prompt Profissional',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1744, 240],
    })
    _6cPromptProfissional = {
        assignments: {
            assignments: [
                {
                    id: 'c1',
                    name: 'prompt_final',
                    type: 'string',
                    value: 'Professional corporate headshot of a person, neutral textured grey and dark blue studio background. Subject has a confident and welcoming smile, wearing premium professional business attire. Studio softbox lighting, clean shadows, cinematic business portrait, corporate LinkedIn ready, highly detailed skin texture, architectural digest style, captured on professional DSLR.',
                },
                {
                    id: 'c2',
                    name: 'tema_label',
                    type: 'string',
                    value: 'Profissional',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '4d219b23-9616-4ccb-9308-10fe5dd9e03a',
        name: '6d. IA Traduz Tema Livre',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-1744, 400],
    })
    _6dIaTraduzTemaLivre = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyChcNpVKHNWpetBQQjUgYSaVxg8pSOt_1c',
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
        specifyBody: 'json',
        jsonBody: `={
  "contents": [
    {
      "parts": [
        {
          "text": "Você é um Engenheiro de Prompt especialista em fotografia de IA. Receba o tema abaixo em português e transforme em um prompt profissional em inglês para o modelo Flux. Retorne APENAS o prompt em inglês, sem explicações, sem aspas. Adicione termos de fotografia de estúdio, iluminação cinemática e qualidade 8k. Tema: {{ $('1. Recebe Pedido').item.json.body.tema_custom }}"
        }
      ]
    }
  ]
}`,
        options: {
            timeout: 30000,
        },
    };

    @node({
        id: 'c57504fe-c9b7-47cf-b124-d1910171ebf5',
        name: '7. Fal.ai – Gera Imagens',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-1504, 160],
    })
    _7FalAiGeraImagens = {
        method: 'POST',
        url: 'https://fal.run/fal-ai/flux/dev',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Key 4dbc2342-f796-4629-b913-0d6612e59396:d809dd3c767d87857a0d283e6330d156',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "prompt": "{{ $json.candidates ? $json.candidates[0].content.parts[0].text : $json.prompt_final }}, portrait of the person shown in the reference image, ultra photorealistic face swap",
  "image_url": "data:image/jpeg;base64,{{ $('1. Recebe Pedido').item.json.body.foto_base64 }}",
  "num_images": 4,
  "image_size": "portrait_4_3",
  "num_inference_steps": 28,
  "guidance_scale": 7.5,
  "seed": -1
}`,
        options: {
            timeout: 120000,
        },
    };

    @node({
        id: 'fabc48f8-dd17-4223-9c72-89d54ef74a06',
        webhookId: '1bf5a078-6d96-4dae-9041-617166963756',
        name: '8. Enviar E-mail',
        type: 'n8n-nodes-base.emailSend',
        version: 2.1,
        position: [-1264, 160],
        credentials: { smtp: { id: '5dfSxIBzrWHAMPO6', name: 'SMTP account' } },
    })
    _8EnviarEMail = {
        fromEmail: 'gusta.loureiro.dev@gmail.com',
        toEmail: "={{ $('1. Recebe Pedido').item.json.body.email }}",
        subject: '📸 O seu Ensaio com Inteligência Artificial chegou!',
        emailFormat: 'text',
        text: `=Olá {{ $('1. Recebe Pedido').item.json.body.nome }}!

As suas imagens do ensaio de {{ $json.tema_label }} estão prontas.

Abaixo estão os links em alta resolução (clique para baixar):

Imagem 1: {{ $json.images[0].url }}
Imagem 2: {{ $json.images[1].url }}
Imagem 3: {{ $json.images[2].url }}
Imagem 4: {{ $json.images[3].url }}

Obrigado por usar a LensAI!
Se precisar de ajuda, responda este e-mail.
`,
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this._1RecebePedido.out(0).to(this._3RespondPixFrontend.in(0));
        this._3RespondPixFrontend.out(0).to(this._5SwitchTema.in(0));
        this._5SwitchTema.out(0).to(this._6aPromptAniversario.in(0));
        this._5SwitchTema.out(1).to(this._6bPromptGravidez.in(0));
        this._5SwitchTema.out(2).to(this._6cPromptProfissional.in(0));
        this._6aPromptAniversario.out(0).to(this._7FalAiGeraImagens.in(0));
        this._6bPromptGravidez.out(0).to(this._7FalAiGeraImagens.in(0));
        this._6cPromptProfissional.out(0).to(this._7FalAiGeraImagens.in(0));
        this._7FalAiGeraImagens.out(0).to(this._8EnviarEMail.in(0));
    }
}
