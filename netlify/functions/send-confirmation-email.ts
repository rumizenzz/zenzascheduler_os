import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    }
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'MAIL_FROM_EMAIL'
  ]
  const missing = required.filter((name) => !process.env[name])
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '))
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server configuration error' })
    }
  }

  try {
    const { email, displayName } = JSON.parse(event.body || '{}')
    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Email required' })
      }
    }

    const ip =
      event.headers['client-ip'] ||
      event.headers['x-forwarded-for']?.split(',')[0] ||
      'unknown'

    const supabaseUrl = process.env.SUPABASE_URL as string
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string
    const table = process.env.SUPABASE_TABLE || 'mailing_list'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: attempts } = await supabase
      .from('signup_attempts')
      .select('id')
      .or(`ip.eq.${ip},email.eq.${email}`)
      .gt('created_at', oneHourAgo)

    if (attempts && attempts.length > 5) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Too many signup attempts' })
      }
    }

    await supabase.from('signup_attempts').insert({ email, ip })

    const disposableDomains = ['mailinator.com', 'temp-mail.org', '10minutemail.com']
    const domain = email.split('@').pop()
    if (domain && disposableDomains.includes(domain)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Disposable email not allowed' })
      }
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${event.headers.origin || supabaseUrl}/confirmed` }
    })
    if (linkError || !linkData) {
      throw linkError || new Error('Failed to generate link')
    }
    const actionLink: string = (linkData as any).action_link || (linkData as any).properties?.action_link

    await supabase
      .from(table)
      .upsert({ email, unsubscribed: false, confirmed: false }, { onConflict: 'email' })

    const host = process.env.SMTP_HOST || process.env.IONOS_HOST
    const port = Number(process.env.SMTP_PORT || process.env.IONOS_PORT || 465)
    const user = process.env.SMTP_USER || process.env.IONOS_USER || process.env.IONOS_USERNAME
    const pass = process.env.SMTP_PASS || process.env.IONOS_PASS || process.env.IONOS_PASSWORD
    const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_FROM!
    const fromName = process.env.MAIL_FROM_NAME || ''
    const replyTo = process.env.MAIL_REPLY_TO || fromEmail
    const listUnsubEmail = process.env.LIST_UNSUBSCRIBE_EMAIL
    const listUnsubUrl = process.env.LIST_UNSUBSCRIBE_URL

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user: user as string, pass: pass as string }
    })

    await transporter.sendMail({
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: email,
      replyTo,
      headers: listUnsubEmail || listUnsubUrl ? {
        'List-Unsubscribe': [listUnsubEmail, listUnsubUrl].filter(Boolean).join(', ')
      } : undefined,
      subject: 'Confirm your ZenzaLife account',
      text: `Hello ${displayName || ''},\n\nPlease confirm your email by visiting: ${actionLink}\n\nThank you!`
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    }
  } catch (err) {
    console.error('Send confirmation error:', err)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to send email' })
    }
  }
}

export { handler }
