import mailgun from 'mailgun-js';
import { apiKey, domain, from, to } from './mailgun.json';
const mg = mailgun({ apiKey, domain });

const sendMail = ({
  email,
  name,
  message,
}: {
  email: string,
  name: string,
  message: string,
}) => {
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

export default sendMail;
