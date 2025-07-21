import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { providers } from '../garbage-providers/mod.ts'

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
    const { userId, addressId, provider = 'republic', icsUrl } = await req.json()
    if (!userId) {
      throw new Error('userId is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let activeProvider = provider
    let url = icsUrl as string | undefined
    let address: any = null

    if (!url) {
      if (!addressId) {
        throw new Error('addressId or icsUrl is required')
      }
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Address not found')
      address = data
      activeProvider = (data.provider as string) || provider
      url = data.ics_url || undefined
    }

    const prov = providers[activeProvider]
    if (!prov) throw new Error('Unsupported provider')

    const raw = await prov.fetchSchedule(url || { zip: address.zip })
    const events = prov.parseEvents(raw)
    let upserted = 0

    for (const ev of events) {
      const { error } = await supabase
        .from('garbage_schedule')
        .upsert(
          {
            user_id: userId,
            address_id: addressId || null,
            provider: activeProvider,
            waste_type: ev.wasteType,
            collection_day: new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
            frequency: 'once',
            next_collection: ev.date,
            auto_reminder: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,next_collection,waste_type' }
        )
      if (error) throw error
      upserted++
    }

    await supabase.from('garbage_update_logs').insert({
      user_id: userId,
      address_id: addressId || null,
      provider: activeProvider,
      ics_url: url || (address ? `https://www.republicservices.com/schedule/ics/${address.zip}` : ''),
      total_events: events.length,
      upserted_events: upserted,
      created_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Auto schedule error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
