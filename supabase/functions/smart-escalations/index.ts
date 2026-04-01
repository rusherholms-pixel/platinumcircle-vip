import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'slusere@yahoo.com'
const ESCALATION_THRESHOLD_MS = 2 * 60 * 60 * 1000 // 2 hours

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - ESCALATION_THRESHOLD_MS).toISOString()
    const results = { messages: 0, bookings: 0, leads: 0 }

    // --- 1. Unanswered member messages (2h+) ---
    // Find open/in_progress conversations where the latest message is from a member
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, member_id, status')
      .in('status', ['open', 'in_progress'])

    if (conversations) {
      for (const conv of conversations) {
        // Get the latest message in this conversation
        const { data: latestMessages } = await supabase
          .from('messages')
          .select('sender_id, created_at, is_internal_note')
          .eq('conversation_id', conv.id)
          .eq('is_internal_note', false)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!latestMessages || latestMessages.length === 0) continue

        const latest = latestMessages[0]
        // Only escalate if the latest message is FROM the member (not admin)
        if (latest.sender_id !== conv.member_id) continue
        // Only if it's older than 2 hours
        if (new Date(latest.created_at).getTime() > new Date(twoHoursAgo).getTime()) continue

        // Count unanswered messages (consecutive from member)
        let unansweredCount = 0
        for (const msg of latestMessages) {
          if (msg.sender_id === conv.member_id) unansweredCount++
          else break
        }

        // Get member profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', conv.member_id)
          .single()

        const memberName = profile?.full_name || 'Member'
        const hoursWaiting = Math.round((now.getTime() - new Date(latest.created_at).getTime()) / 3600000)

        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'smart-escalation',
            recipientEmail: ADMIN_EMAIL,
            idempotencyKey: `escalation-msg-${conv.id}-${new Date().toISOString().slice(0, 13)}`,
            templateData: {
              escalationType: 'UNANSWERED MESSAGE',
              headline: `Awaiting Reply — ${memberName} — ${unansweredCount} message${unansweredCount > 1 ? 's' : ''} unanswered`,
              details: `${memberName} has sent ${unansweredCount} message${unansweredCount > 1 ? 's' : ''} with no concierge reply in the past ${hoursWaiting} hour${hoursWaiting > 1 ? 's' : ''}.`,
              urgencyNote: 'Members expect prompt responses. Delayed replies directly impact satisfaction and retention.',
              ctaLabel: 'Reply Now',
              ctaUrl: 'https://platinumcircle.vip/admin',
              items: [
                { label: 'Member', value: memberName },
                { label: 'Unanswered Messages', value: String(unansweredCount) },
                { label: 'Waiting Since', value: `${hoursWaiting} hour${hoursWaiting > 1 ? 's' : ''} ago` },
              ],
            },
          },
        })
        results.messages++
      }
    }

    // --- 2. Pending booking requests (2h+) ---
    const { data: pendingBookings } = await supabase
      .from('booking_requests')
      .select('id, user_id, service_title, service_type, check_in, created_at')
      .eq('status', 'pending')
      .lt('created_at', twoHoursAgo)

    if (pendingBookings) {
      for (const booking of pendingBookings) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', booking.user_id)
          .single()

        const memberName = profile?.full_name || 'Member'
        const hoursWaiting = Math.round((now.getTime() - new Date(booking.created_at).getTime()) / 3600000)

        const isUrgent = booking.check_in &&
          (new Date(booking.check_in).getTime() - now.getTime()) < 72 * 60 * 60 * 1000

        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'smart-escalation',
            recipientEmail: ADMIN_EMAIL,
            idempotencyKey: `escalation-booking-${booking.id}-${new Date().toISOString().slice(0, 13)}`,
            templateData: {
              escalationType: isUrgent ? 'URGENT BOOKING' : 'PENDING BOOKING',
              headline: `Pending Review — ${booking.service_title} — ${memberName} — ${hoursWaiting}h waiting`,
              details: `A booking request has been waiting for ${hoursWaiting} hours without admin action.${isUrgent ? ' The requested date is within 72 hours — this is time-sensitive.' : ''}`,
              urgencyNote: 'Prompt responses directly impact conversion and member retention.',
              ctaLabel: 'Review Request',
              ctaUrl: 'https://platinumcircle.vip/admin',
              items: [
                { label: 'Member', value: memberName },
                { label: 'Service', value: booking.service_title },
                { label: 'Category', value: booking.service_type },
                ...(booking.check_in ? [{ label: 'Date', value: booking.check_in }] : []),
                { label: 'Submitted', value: `${hoursWaiting} hours ago` },
              ],
            },
          },
        })
        results.bookings++
      }
    }

    // --- 3. Mia leads still "new" after 2h ---
    const { data: coldLeads } = await supabase
      .from('mia_leads')
      .select('id, lead_name, email, phone, interest, timeline, group_size, created_at')
      .eq('status', 'new')
      .lt('created_at', twoHoursAgo)

    if (coldLeads) {
      for (const lead of coldLeads) {
        const hoursWaiting = Math.round((now.getTime() - new Date(lead.created_at).getTime()) / 3600000)

        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'smart-escalation',
            recipientEmail: ADMIN_EMAIL,
            idempotencyKey: `escalation-lead-${lead.id}-${new Date().toISOString().slice(0, 13)}`,
            templateData: {
              escalationType: 'HOT LEAD COOLING',
              headline: `Hot Lead Cooling — ${lead.lead_name} — ${hoursWaiting}h since inquiry`,
              details: `A Mia lead has not been contacted in ${hoursWaiting} hours. High-intent leads go cold quickly.`,
              urgencyNote: 'Speed-to-lead is the single biggest factor in conversion. Act now.',
              ctaLabel: 'View Lead',
              ctaUrl: 'https://platinumcircle.vip/admin',
              items: [
                { label: 'Name', value: lead.lead_name },
                ...(lead.email ? [{ label: 'Email', value: lead.email }] : []),
                ...(lead.phone ? [{ label: 'Phone', value: lead.phone }] : []),
                ...(lead.interest ? [{ label: 'Interest', value: lead.interest }] : []),
                ...(lead.group_size ? [{ label: 'Group Size', value: lead.group_size }] : []),
                ...(lead.timeline ? [{ label: 'Timeline', value: lead.timeline }] : []),
                { label: 'Waiting', value: `${hoursWaiting} hours` },
              ],
            },
          },
        })
        results.leads++
      }
    }

    return new Response(JSON.stringify({ ok: true, escalations: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Smart escalations error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
