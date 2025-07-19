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
    const { userId, addressId, location } = await req.json()
    if (!userId) {
      throw new Error('userId is required')
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Determine schedule for Whitehouse Station / Republic Services
    if (!location || !location.toLowerCase().includes('whitehouse')) {
      return new Response(JSON.stringify({ error: 'Unsupported location' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const schedules = [
      { waste_type: 'trash', collection_day: 'monday', frequency: 'weekly' },
      { waste_type: 'recycling', collection_day: 'thursday', frequency: 'bi-weekly' }
    ]

    for (const sched of schedules) {
      const nextCollection = getNextCollectionDate(sched.collection_day)
      const { error } = await supabase.from('garbage_schedule').upsert({
        user_id: userId,
        address_id: addressId || null,
        waste_type: sched.waste_type,
        collection_day: sched.collection_day,
        frequency: sched.frequency,
        next_collection: nextCollection,
        auto_reminder: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,waste_type' })
      if (error) throw error
    }

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

function getNextCollectionDate(day: string) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = new Date()
  const target = days.indexOf(day.toLowerCase())
  const next = new Date(today)
  if (target === -1) return today.toISOString().split('T')[0]
  while (next.getDay() !== target) {
    next.setDate(next.getDate() + 1)
  }
  return next.toISOString().split('T')[0]
}
