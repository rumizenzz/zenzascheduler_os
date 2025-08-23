const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_KEY')!

    const bucketConfig = { id: 'zen-transfer', name: 'zen-transfer', public: false }

    const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bucketConfig),
    })

    if (!createRes.ok && createRes.status !== 409) {
      const errText = await createRes.text()
      throw new Error(`Bucket creation failed: ${errText}`)
    }

    const policyQueries = [
      `CREATE POLICY "Zen Transfer Read" ON storage.objects FOR SELECT USING (bucket_id = 'zen-transfer');`,
      `CREATE POLICY "Zen Transfer Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'zen-transfer');`,
      `CREATE POLICY "Zen Transfer Update" ON storage.objects FOR UPDATE USING (bucket_id = 'zen-transfer');`,
      `CREATE POLICY "Zen Transfer Delete" ON storage.objects FOR DELETE USING (bucket_id = 'zen-transfer');`,
    ]

    for (const query of policyQueries) {
      await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('ensure-zen-transfer-bucket error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
