import nodemailer from 'nodemailer'
import path from 'path'
const { host, port, user, pass } = require('../config/mail.json')

import hbs from 'nodemailer-express-handlebars'

const transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  }
})

transport.use('compile', hbs({
  viewEngine: 'handlebars',
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html'
} as any))

export default transport