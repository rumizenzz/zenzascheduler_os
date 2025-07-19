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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${req.headers.get('origin') || supabaseUrl}/confirmed` }
    })

    if (linkError || !linkData) {
      throw new Error(linkError?.message || 'Failed to generate link')
    }

    const actionLink = (linkData as any).action_link || (linkData as any).properties?.action_link

    const host = Deno.env.get('IONOS_HOST')!
    const port = Number(Deno.env.get('IONOS_PORT') || 465)
    const username = Deno.env.get('IONOS_USERNAME')!
    const password = Deno.env.get('IONOS_PASSWORD')!
    const from = Deno.env.get('EMAIL_FROM')!

    await sendMail({
      hostname: host,
      port,
      username,
      password,
      from,
      to: email,
      subject: 'Confirm your ZenzaLife account',
      content: `Hello ${displayName || ''},\n\nPlease confirm your email by visiting: ${actionLink}\n\nThank you!`
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
