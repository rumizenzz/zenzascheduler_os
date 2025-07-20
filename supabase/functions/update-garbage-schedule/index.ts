import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GarbageSchedule {
  waste_type: string
  collection_day: string
  collection_time?: string
  frequency?: string
  next_collection: string
}

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
    const { addressId, userId } = await req.json()
    if (!addressId && !userId) {
      throw new Error('addressId or userId required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const apiUrl = Deno.env.get('GARBAGE_API_URL')
    if (!apiUrl) {
      throw new Error('GARBAGE_API_URL not configured')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq(addressId ? 'id' : 'user_id', addressId || userId)

    if (error) throw error
    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses found')
    }

    for (const addr of addresses) {
      const query = encodeURIComponent(`${addr.address_line1}, ${addr.city}, ${addr.state} ${addr.zip}`)
      const res = await fetch(`${apiUrl}?address=${query}`)
      if (!res.ok) {
        throw new Error(`Schedule fetch failed: ${await res.text()}`)
      }
      const schedules: GarbageSchedule[] = await res.json()

      for (const s of schedules) {
        const upsertData = {
          user_id: addr.user_id,
          address_id: addr.id,
          waste_type: s.waste_type,
          collection_day: s.collection_day,
          collection_time: s.collection_time || null,
          frequency: s.frequency || 'weekly',
          next_collection: s.next_collection,
          updated_at: new Date().toISOString()
        }
        const { error: upsertError } = await supabase
          .from('garbage_schedule')
          .upsert(upsertData, { onConflict: 'user_id,address_id,waste_type' })
        if (upsertError) throw upsertError
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Update garbage schedule error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
