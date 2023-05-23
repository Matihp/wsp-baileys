const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

let fechaFinal;

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(
    ['📄 Aquí tenemos el flujo secundario'],
    null,
    (ctx)=>{
        fechaFinal = new Date();
        
    }
    )

const FlowNuevos = addKeyword(['1','Primero']).addAnswer(
    [
        '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
        'https://bot-whatsapp.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowTuto = addKeyword(['4', 'Cuatro']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowPrevios = addKeyword(['2', 'Dos']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowConsultas = addKeyword(['3','Consultas']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(EVENTS.WELCOME) 
    .addAction(async (ctx, { flowDynamic, endFlow }) => {
            let date = new Date()
            
            if (fechaFinal != undefined)
            return endFlow();
        })
    .addAnswer('🙌 Hola bienvenido a la clínica de Leonardo')
    
    .addAnswer(
        [
            '👉 *1* Turnos pacientes nuevos',
            '👉 *2* Turnos pacientes anteriormente atendidos',
            '👉 *3* Consultas',
            '👉 *4* Recetas',
            '\nResponda con el numero de la opcion!',
        ],
        null,
        null,
        [FlowNuevos, flowPrevios, flowTuto, flowConsultas]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
