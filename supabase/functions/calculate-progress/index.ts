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
    const { userId, date } = await req.json()
    if (!userId) throw new Error('userId required')
    const targetDate = date || new Date().toISOString().split('T')[0]

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('completed, start_time')
      .eq('user_id', userId)
      .gte('start_time', targetDate)
      .lt('start_time', `${targetDate}T23:59:59+00`)

    if (error) throw error

    const completed = tasks?.filter(t => t.completed).length || 0
    const total = tasks?.length || 0
    const score = total > 0 ? completed / total : 0

    const { data: existing } = await supabase
      .from('growth_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .maybeSingle()

    const logData = {
      user_id: userId,
      date: targetDate,
      score_1percent: score,
      completed_tasks: completed,
      missed_tasks: total - completed,
      updated_at: new Date().toISOString()
    }

    if (existing) {
      const { error: updateErr } = await supabase
        .from('growth_logs')
        .update(logData)
        .eq('id', existing.id)
      if (updateErr) throw updateErr
    } else {
      const { error: insertErr } = await supabase
        .from('growth_logs')
        .insert({ ...logData, created_at: new Date().toISOString() })
      if (insertErr) throw insertErr
    }

    return new Response(JSON.stringify({ success: true, score }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Calculate progress error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
