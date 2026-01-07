import mailgun from 'mailgun-js'
import { domain, from, to } from './mailgun.json'
import { RequestBody } from './parseBody.js'

let mg: mailgun.Mailgun

export const initMailgun = () => {
  const apiKey = process.env.MAILGUN_API_KEY || ''
  mg = mailgun({ apiKey, domain })
}

export const sendMail = ({ email, name, message }: RequestBody): Promise<mailgun.messages.SendResponse> => {
  return mg.messages().send({
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
