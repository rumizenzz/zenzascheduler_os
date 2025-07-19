import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as ICAL from 'https://esm.sh/ical.js@2.2.0'

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
    const { userId, addressId, icsUrl } = await req.json()
    if (!userId || !icsUrl) {
      throw new Error('userId and icsUrl are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const icsRes = await fetch(icsUrl)
    if (!icsRes.ok) {
      throw new Error('Failed to fetch schedule')
    }
    const text = await icsRes.text()
    const comp = new ICAL.Component(ICAL.parse(text))
    const events = comp.getAllSubcomponents('vevent')
    let upserted = 0

    for (const ev of events) {
      const event = new ICAL.Event(ev)
      const summary: string = event.summary || ''
      const dt = event.startDate.toJSDate()
      const wasteType = summary.toLowerCase().includes('recycle') ? 'recycling' : 'trash'
      const data = {
        user_id: userId,
        address_id: addressId || null,
        waste_type: wasteType,
        collection_day: dt.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        frequency: 'once',
        next_collection: dt.toISOString().split('T')[0],
        auto_reminder: true,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase
        .from('garbage_schedule')
        .upsert(data, { onConflict: 'user_id,next_collection,waste_type' })
      if (error) throw error
      upserted++
    }

    await supabase.from('garbage_update_logs').insert({
      user_id: userId,
      address_id: addressId || null,
      ics_url: icsUrl,
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
