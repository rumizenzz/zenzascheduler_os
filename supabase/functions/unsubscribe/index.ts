import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const table = Deno.env.get('SUPABASE_TABLE') || 'mailing_list'
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the email exists before updating
    const { data: existing, error: selectError } = await supabase
      .from(table)
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (selectError) {
      throw selectError
    }

    if (!existing) {
      return new Response(JSON.stringify({ error: 'not-found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { error } = await supabase
      .from(table)
      .update({ unsubscribed: true })
      .eq('email', email)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from(table)
        .insert({ email, unsubscribed: true })

      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return new Response(JSON.stringify({ error: 'Failed to unsubscribe' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
