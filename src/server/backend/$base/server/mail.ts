import m, { type Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

import { config } from '../env'

export namespace MailProvider {
  export interface Mail {
    subject: string
    to: string
    content: string
  }
}

export class MailProvider {
  transport: Transporter<SMTPTransport.SentMessageInfo>
  config = config()
  constructor() {
    this.transport = m.createTransport(this.config.mail.auth)
    this.transport.verify()
  }

  async send(mail: MailProvider.Mail) {
    await this.transport.sendMail({
      from: this.config.mail.sender,
      to: mail.to,
      subject: mail.subject,
      text: mail.content,
    })
  }
}
