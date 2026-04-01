import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, full_name, role, country, city } = await req.json()

    if (!email || !full_name || !role) {
      return new Response(JSON.stringify({ error: 'email, full_name, and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use Supabase Admin API to invite user by email
    // This sends a magic link / password setup email
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
      },
      redirectTo: 'https://platinumcircle-vip.lovable.app/auth?type=recovery',
    })

    if (inviteError) {
      // If user already exists, just ensure profile and role
      if (inviteError.message?.includes('already been registered') || inviteError.message?.includes('already exists')) {
        // Find existing user
        const { data: { users } } = await adminClient.auth.admin.listUsers()
        const existingUser = users?.find(u => u.email === email)

        if (existingUser) {
          // Ensure profile exists
          await adminClient.from('profiles').upsert({
            id: existingUser.id,
            full_name,
            email,
            country: country || null,
            city: city || null,
          }, { onConflict: 'id' })

          // Add role
          await adminClient.from('user_roles').upsert({
            user_id: existingUser.id,
            role,
          }, { onConflict: 'user_id,role' })

          return new Response(JSON.stringify({
            success: true,
            userId: existingUser.id,
            message: 'User already exists. Role and profile updated.',
            alreadyExists: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = inviteData.user.id

    // Update profile with additional details
    await adminClient.from('profiles').upsert({
      id: userId,
      full_name,
      email,
      country: country || null,
      city: city || null,
    }, { onConflict: 'id' })

    // Assign role
    await adminClient.from('user_roles').upsert({
      user_id: userId,
      role,
    }, { onConflict: 'user_id,role' })

    // Send welcome email via transactional email system
    await adminClient.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'welcome-invitation',
        recipientEmail: email,
        idempotencyKey: `welcome-invite-${userId}`,
        templateData: {
          memberName: full_name,
          role,
          loginUrl: 'https://platinumcircle-vip.lovable.app/auth',
        },
      },
    })

    return new Response(JSON.stringify({
      success: true,
      userId,
      message: 'User invited and welcome email sent.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('invite-user error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
