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
        const { imageData, fileName, userId } = await req.json();

        if (!imageData || !fileName || !userId) {
            throw new Error('Image data, filename, and user ID are required');
        }

        // Get the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Create unique filename with user folder
        const uniqueFileName = `${userId}/${Date.now()}-${fileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/zenzalife-assets/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/zenzalife-assets/${uniqueFileName}`;

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                fileName: uniqueFileName,
                size: binaryData.length,
                mimeType
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);

        const errorResponse = {
            error: {
                code: 'IMAGE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});