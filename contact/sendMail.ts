import Mailgun from 'mailgun.js'
import { domain, from, to } from './mailgun.json'
import { RequestBody } from './parseBody.js'

let mg: ReturnType<Mailgun['client']>

export const initMailgun = () => {
  const apiKey = process.env.MAILGUN_API_KEY || ''
  const mailgun = new Mailgun(FormData)
  mg = mailgun.client({ username: 'api', key: apiKey })
}

export const sendMail = ({ email, name, message }: RequestBody) => {
  return mg.messages.create(domain, {
    to,
    from,
    "h:Reply-To": `${name} <${email}>`,
    subject: 'CrossAngles contact form',
    text: `
${message}

------
Sender name: ${name}
Email address: ${email}
This is an automated message generated from the contact form on https://crossangles.app
`,
  })
}
