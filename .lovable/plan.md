

## Add Password Reset Flow

### What Changes

Add a "Forgot password?" link to the login page and a dedicated reset password page so users can recover their accounts via email.

### Implementation

**1. Add "Forgot Password" link to Login page (`src/pages/LoginPage.tsx`)**
- Add a "Forgot your password?" link below the password field, linking to `/forgot-password`

**2. Create Forgot Password page (`src/pages/ForgotPasswordPage.tsx`)**
- Simple form with email input
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Shows success toast telling user to check their email

**3. Create Reset Password page (`src/pages/ResetPasswordPage.tsx`)**
- Checks for `type=recovery` in URL hash on mount
- Shows new password + confirm password form
- Calls `supabase.auth.updateUser({ password })` to set the new password
- Redirects to `/login` on success

**4. Add routes (`src/App.tsx`)**
- `/forgot-password` → ForgotPasswordPage
- `/reset-password` → ResetPasswordPage

Both pages will match the existing dark theme and branding style used on the login/register pages.

### Files to Create
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`

### Files to Edit
- `src/pages/LoginPage.tsx` -- add forgot password link
- `src/App.tsx` -- add two new routes

