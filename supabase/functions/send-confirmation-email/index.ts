import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendMail } from 'https://deno.land/x/mail@v0.11.1/mod.ts'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { email, displayName } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Basic disposable domain check
    const disposableDomains = ['mailinator.com', 'temp-mail.org', '10minutemail.com']
    const domain = email.split('@').pop()
    if (domain && disposableDomains.includes(domain)) {
      return new Response(JSON.stringify({ error: 'Disposable email not allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    const mailingTable = Deno.env.get('SUPABASE_TABLE') || 'mailing_list'

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${req.headers.get('origin') || supabaseUrl}/confirmed` }
    })

    if (linkError || !linkData) {
      throw new Error(linkError?.message || 'Failed to generate link')
    }

    const actionLink = (linkData as any).action_link || (linkData as any).properties?.action_link

    // Ensure the user is on the mailing list
    await supabase
      .from(mailingTable)
      .upsert({ email, unsubscribed: false }, { onConflict: 'email' })

    const host = Deno.env.get('SMTP_HOST') || Deno.env.get('IONOS_HOST')!
    const port = Number(Deno.env.get('SMTP_PORT') || Deno.env.get('IONOS_PORT') || 465)
    const username = Deno.env.get('SMTP_USER') || Deno.env.get('IONOS_USER') || Deno.env.get('IONOS_USERNAME')!
    const password = Deno.env.get('SMTP_PASS') || Deno.env.get('IONOS_PASS') || Deno.env.get('IONOS_PASSWORD')!
    const fromEmail = Deno.env.get('MAIL_FROM_EMAIL') || Deno.env.get('EMAIL_FROM')!
    const fromName = Deno.env.get('MAIL_FROM_NAME') || ''
    const replyTo = Deno.env.get('MAIL_REPLY_TO') || fromEmail
    const listUnsubEmail = Deno.env.get('LIST_UNSUBSCRIBE_EMAIL')
    const listUnsubUrl = Deno.env.get('LIST_UNSUBSCRIBE_URL')
    const companyAddress = Deno.env.get('COMPANY_ADDRESS') || ''
    const companyContact = Deno.env.get('COMPANY_CONTACT_EMAIL') || ''

    const html = `<!doctype html>
    <html>
      <body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">
        <table style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:40px;text-align:center;">
              <h1 style="font-weight:normal;color:#333;">Confirm your email</h1>
              <p style="color:#555;">Hi ${displayName || ''}, welcome to ZenzaLife Scheduler! Please confirm your email address to start your dreamlike journey.</p>
              <p><a href="${actionLink}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;">Confirm Email</a></p>
              <p style="color:#555;font-size:14px;">If the button doesn't work, copy and paste this link: <br/><a href="${actionLink}">${actionLink}</a></p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;padding:20px;text-align:center;font-size:12px;color:#666;">
              ${companyAddress ? `<p style=\"margin:0;\">${companyAddress}</p>` : ''}
              ${companyContact ? `<p style=\"margin:0;\">${companyContact}</p>` : ''}
              ${listUnsubUrl ? `<p style=\"margin-top:8px;\"><a href=\"${listUnsubUrl}\" style=\"color:#7c3aed;text-decoration:underline;\">Unsubscribe</a></p>` : ''}
            </td>
          </tr>
        </table>
      </body>
    </html>`

    await sendMail({
      hostname: host,
      port,
      username,
      password,
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      replyTo,
      headers: listUnsubEmail || listUnsubUrl ? {
        'List-Unsubscribe': [listUnsubEmail, listUnsubUrl].filter(Boolean).join(', ')
      } : undefined,
      to: email,
      subject: 'Confirm your ZenzaLife account',
      content: `Hello ${displayName || ''},\n\nPlease confirm your email by visiting: ${actionLink}\n\nThank you!`,
      html
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Send confirmation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
