Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { userId, dateFrom, dateTo } = await req.json();

        if (!userId) {
            throw new Error('User ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Build date filter
        let dateFilter = '';
        if (dateFrom && dateTo) {
            dateFilter = `&start_time=gte.${dateFrom}&start_time=lte.${dateTo}`;
        } else if (dateFrom) {
            dateFilter = `&start_time=gte.${dateFrom}`;
        } else if (dateTo) {
            dateFilter = `&start_time=lte.${dateTo}`;
        }

        // Get tasks data
        const tasksResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?user_id=eq.${userId}${dateFilter}&order=start_time.desc`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!tasksResponse.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await tasksResponse.json();

        // Calculate analytics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Category breakdown
        const categoryStats = {};
        tasks.forEach(task => {
            const category = task.category || 'uncategorized';
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, completed: 0 };
            }
            categoryStats[category].total++;
            if (task.completed) {
                categoryStats[category].completed++;
            }
        });

        // Daily completion trend (last 7 days)
        const dailyStats = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyStats[dateStr] = { total: 0, completed: 0 };
        }

        tasks.forEach(task => {
            if (task.start_time) {
                const taskDate = new Date(task.start_time).toISOString().split('T')[0];
                if (dailyStats[taskDate]) {
                    dailyStats[taskDate].total++;
                    if (task.completed) {
                        dailyStats[taskDate].completed++;
                    }
                }
            }
        });

        // Get growth logs for 1% better calculation
        const growthResponse = await fetch(`${supabaseUrl}/rest/v1/growth_logs?user_id=eq.${userId}&order=date.desc&limit=30`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let averageGrowthScore = 0;
        if (growthResponse.ok) {
            const growthLogs = await growthResponse.json();
            if (growthLogs.length > 0) {
                const totalScore = growthLogs.reduce((sum, log) => sum + (parseFloat(log.score_1percent) || 0), 0);
                averageGrowthScore = totalScore / growthLogs.length;
            }
        }

        const analytics = {
            totalTasks,
            completedTasks,
            completionRate: Math.round(completionRate * 100) / 100,
            categoryStats,
            dailyStats,
            averageGrowthScore: Math.round(averageGrowthScore * 100) / 100,
            streakDays: calculateStreak(Object.values(dailyStats))
        };

        return new Response(JSON.stringify({ data: analytics }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to calculate streak
function calculateStreak(dailyData) {
    let streak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
        const day = dailyData[i];
        if (day.total > 0 && day.completed / day.total >= 0.8) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}