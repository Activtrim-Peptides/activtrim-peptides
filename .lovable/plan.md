

## Fix: Add Missing Slack Scopes for Private Channel Access

### Root Cause

The `conversations.list` API call with `types=private_channel` requires the `groups:read` scope to discover private channels. The current bot connection only has `channels:read` (public channels).

### Step 1: Reconnect Slack with additional scopes

You'll be prompted to update the Slack connection to add the `groups:read` scope. This allows the bot to see the private `#activ-peptides-orders` channel.

### Step 2: Add debug logging to the edge function

Update `supabase/functions/send-card-to-slack/index.ts` to log the response from `conversations.list` so we can diagnose any future issues. Specifically:

- Log the number of channels returned from the API
- Log the HTTP status of the conversations.list response
- This will help quickly identify if the issue is scope-related, pagination-related, or something else

### Technical Details

**File changed:** `supabase/functions/send-card-to-slack/index.ts`
- Add `console.log` after the `conversations.list` call to log channel count and whether the target channel was found
- No other logic changes needed -- the existing channel lookup and message posting code is correct

