const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom ? lastDisconnect.error.output.statusCode : 0) !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('Bot Vinaa Connected!')
    }
  })

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0]
    if (!msg.message) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    const from = msg.key.remoteJid

    if (text.toLowerCase() === 'p') {
      await sock.sendMessage(from, { text: 'pa pe pa pe 😜' })
    }
    if (text.toLowerCase() === '.menu') {
      await sock.sendMessage(from, { text: 
`✨ *VINAA BOT* ✨
.p = auto reply
.menu = tampilkan menu
.halo = sapa bot
.sticker = jadi stiker (kirim gambar + caption .sticker)
`})
    }
    if (text.toLowerCase() === '.halo') {
      await sock.sendMessage(from, { text: 'Halo kak! Aku Vinaa Bot siap membantu 🤖✨' })
    }
    if (text.toLowerCase() === '.sticker') {
      const quoted = msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
      if (quoted) {
        await sock.sendMessage(from, { sticker: { url: msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ? msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage.url : '' } })
      } else {
        await sock.sendMessage(from, { text: 'Kirim gambar dengan caption .sticker kak' })
      }
    }
  })
}

startBot()
