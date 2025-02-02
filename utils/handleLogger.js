const { IncomingWebhook } = require("@slack/webhook")
const webHook = new IncomingWebhook(process.env.SLACK_LOG)

const loggerStream = {
    write: message => {
        console.log(message)
        webHook.send({text: message})
    }
}

module.exports = loggerStream