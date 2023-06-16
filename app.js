const { createBot, createProvider, createFlow, addKeyword, EVENTS, ProviderClass } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const fs = require('fs')
const fsP = require('fs/promises')
const path=require('path')

let fechaFinal,fechaInicial;
const rutaJson = path.join(__dirname, './data.json')

const leerJson=async()=>{
    const data = await fsP.readFile(rutaJson)
    const dataP = JSON.parse(data)
    return dataP;
}

const escribirJson=(data)=>{
    const updatedJsonData = JSON.stringify(data);
    fs.writeFileSync('data.json', updatedJsonData);
    return updatedJsonData;
}

const FlowTerciario = addKeyword([EVENTS.WELCOME]).addAnswer([
    'Se le contestara en breve para asignarle su turno,*no podra ser cambiado*'
],{
    delay:2000, 
})

const FlowAnterior = addKeyword([5,cinco]).addAnswer([
    'Se le contestara en breve para asignarle su turno,*no podra ser cambiado*'
],{
    delay:2000, 
})

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(
    ['📄 Aquí tenemos el flujo secundario'],
    {
        delay:2000,
    },
    async (ctx,{provider})=>{
        fechaFinal = new Date();
        fechaFinal.setMinutes(fechaFinal.getMinutes() + 2);
        const data = await leerJson();

            for (const item of data) {
                if (item.num == ctx.from) {
                    item.dateFinal = fechaFinal;
                    escribirJson(data)
                }    
            }
    })

const FlowNuevos = addKeyword(['1','Primero']).addAnswer(
    [
        '📄 Puede abonar con transferencia:',
        'CVU: 0000000233428352423945',
        '📄 Enlace de mercadopago:',
        'https://mercadopago.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowTuto = addKeyword(['4', 'Cuatro']).addAnswer(
    [
        '📃 Para buscar la receta tendra que ir a tal lugar',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowPrevios = addKeyword(['2', 'Dos']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowConsultas = addKeyword(['3','Consultas']).addAnswer(
    ['🤪 Deje aca la consulta y se le respondera en breve', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(EVENTS.WELCOME) 
    .addAction(async (ctx, { flowDynamic, endFlow , provider }) => {
            fechaInicial = new Date()
            const data = await leerJson()
            
            for (const item of data) {
                if (item.num == ctx.from) {
                    item.dateInicial = fechaInicial;
                    const fecha1 = new Date(item.dateInicial)
                    const fecha2 = new Date(item.dateFinal)

                    if (fechaFinal != undefined && fecha1 < fecha2){     
                        console.log('llego')
                        return endFlow();
                    }
                    return;  
                }
            }
            const a = await provider.getInstance();
            await a.sendPresenceUpdate('composing',ctx.key.remoteJid)

            data.push({ num: ctx.from, dateInicial: fechaInicial, dateFinal: "" });
            escribirJson(data)
        })
    .addAnswer(['🙌 Hola bienvenido a la clínica de Leonardo'],{delay:3200,},null)
    .addAnswer(
        [
            '👉 *1* Turnos pacientes nuevos',
            '👉 *2* Turnos pacientes anteriormente atendidos',
            '👉 *3* Consultas',
            '👉 *4* Recetas',
            '\nResponda con el numero de la opcion!',
        ],
        {delay:5200,},
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
