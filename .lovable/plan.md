## Meta Ads ↔ Mia AI Integration

End-to-end: pull leads (webhook + polling), read campaign performance, manage campaigns (create/pause/budget), and let Mia score, auto-reply, and optimize spend.

### 1. Secrets to request
- `META_APP_ID` — public app ID
- `META_APP_SECRET` — for webhook signature verification + token exchange
- `META_ACCESS_TOKEN` — long-lived system-user or page token (with `ads_management`, `ads_read`, `leads_retrieval`, `pages_messaging`, `pages_show_list`, `business_management`)
- `META_AD_ACCOUNT_ID` — e.g. `act_123…`
- `META_PAGE_ID` — page that owns the lead forms / Messenger
- `META_VERIFY_TOKEN` — random string we generate; user pastes into Meta webhook config
- `META_PAGE_ACCESS_TOKEN` — needed for Messenger handoff (separate from user token)

### 2. Database (migration)
New tables:
- **`meta_campaigns`** — id (Meta campaign id), name, objective, status, daily_budget, lifetime_budget, spend, impressions, clicks, ctr, cpl, leads_count, last_synced_at
- **`meta_ads`** — id, campaign_id, adset_id, name, status, creative_summary, spend, impressions, clicks, leads_count, last_synced_at
- **`meta_lead_forms`** — id, page_id, name, questions (jsonb), is_active
- **`meta_webhook_log`** — raw payloads for audit/replay
- **`mia_optimizer_actions`** — campaign_id/ad_id, action_type (pause/budget_increase/budget_decrease/duplicate), reasoning, status (suggested/approved/applied/rejected), applied_at, admin_id
- Extend **`mia_leads`**: add `meta_lead_id`, `meta_form_id`, `meta_campaign_id`, `meta_ad_id`, `messenger_psid`, `quality_score` (hot/warm/cold), `mia_first_reply` text, `mia_handoff_state` (engaging/qualified/handed_off)

All admin-only RLS + service-role insert.

### 3. Edge functions
- **`meta-webhook`** (`verify_jwt = false`)
  - GET: handles Meta verification challenge (`hub.verify_token`)
  - POST: validates `X-Hub-Signature-256` against `META_APP_SECRET`, parses leadgen events, fetches full lead via Graph API `/{leadgen_id}?fields=field_data,campaign_id,ad_id,form_id,created_time`, normalizes into `mia_leads`, then invokes `mia-process-lead`
- **`meta-sync`** (cron, every 10 min)
  - Polling backup: fetches leads created in last 30 min for each active form, dedupes by `meta_lead_id`
  - Pulls insights for campaigns/ads (spend, impressions, clicks, CTR, CPL) into `meta_campaigns`/`meta_ads`
- **`meta-ads-manager`** (admin only, JWT verified)
  - Actions: `list_campaigns`, `list_ads`, `pause_campaign`, `resume_campaign`, `update_budget`, `create_campaign`, `create_adset`, `create_ad`
  - All routed through `https://graph.facebook.com/v21.0/...`
- **`mia-process-lead`** (called from webhook)
  - Calls Lovable AI (`google/gemini-3-flash-preview`) with lead data + ad context → returns JSON `{quality_score, summary, first_reply, recommended_next_action}`
  - Updates `mia_leads`; if Messenger PSID present, sends Mia's first reply via `/{page-id}/messages` (Messenger Send API)
  - Inserts admin notification + escalation email if `quality_score=hot`
- **`mia-ad-optimizer`** (cron, daily)
  - Reads last 7 days of campaign performance from `meta_campaigns`
  - Calls Lovable AI with structured tool-call schema → returns array of recommended actions (pause underperformers, raise budget on winners, flag creative fatigue)
  - Inserts into `mia_optimizer_actions` as `suggested`; admin approves/rejects in UI
  - Daily digest email to admin

### 4. Admin UI
New `/admin/meta-ads` page with three tabs:
- **Campaigns** — table with spend/CTR/CPL, pause/resume/budget controls, sync button
- **Ads** — per-ad performance, creative thumbnails
- **Mia Recommendations** — list of `mia_optimizer_actions` with Approve / Reject; approved → calls `meta-ads-manager` to apply

Mia Leads section already exists — Meta-sourced leads will appear there with a new "Meta · Campaign Name" badge and quality_score chip.

### 5. Cron
- `meta-sync` every 10 min
- `mia-ad-optimizer` daily at 09:00 UTC

### 6. Setup steps shown to user
1. In Meta App Dashboard → Webhooks → Page → subscribe to `leadgen` field, paste callback URL `https://ejnzkmzsinepbxrniuvj.supabase.co/functions/v1/meta-webhook` and verify token
2. Subscribe page to app via Graph API call (we'll provide a one-click button in admin UI)

### Approval needed
Meta requires app review for `ads_management` and `pages_messaging` in Live mode. Dev mode works for testing with admin/dev users immediately.

---

Confirm and I'll request the 7 secrets, run the migration, then build all 4 edge functions + admin UI.
