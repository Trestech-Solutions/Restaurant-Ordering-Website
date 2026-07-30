# Debug Session: mobile-auth-login
## Status: [OPEN]

**Symptoms:**
- Expected: Login/Register button par click karne par AuthModal khule, phone/OTP enter karne par user login ho jaye (user context set ho + localStorage me save ho).
- Actual: Desktop/website par login works, mobile par login nahi hota (kuch bhi nahi hota ya modal khulta hai par verify karne par user logged-in nahi dikhta).

**Reproduction:**
1. Mobile viewport me site kholo (< md breakpoint)
2. User icon (navbar me) ya Menu Drawer → "Sign in / Register" dabao
3. Phone: 03366655786, OTP: 123456 enter karo
4. Verify karo — expected: logged-in state

**Hypotheses:**
1. H1. Mobile sign-in button click → `onLoginClick` call nahi hota (event propagation / touch issue / tap area overlap).
2. H2. AuthModal khulta hai par OTP step me `handleVerifyOtp` me `setUser` call hota hai, lekin mobile me localStorage write ya CartProvider ke state update me issue hai (race condition ya hydration).
3. H3. Menu drawer ke "Sign in / Register" click par `onClose` + `onLoginClick` sequence me issue — drawer close hone ka transition modal open karne se pehle state reset kar deta hai.
4. H4. Mobile-specific UserDropdown ya navbar button rendering issue (display none due to wrong breakpoint / CSS).
5. H5. AuthModal ke phone/OTP inputs mobile me virtual keyboard ke saath sahi work nahi karte (blur, focus timing).

**Instrumentation Plan:**
- Add network-logged debug points at:
  - (A) WebsiteNavbar mobile user button click
  - (B) MenuDrawer signin button click
  - (C) AuthModal handleVerifyOtp → before/after setUser
  - (D) CartProvider setUser callback + localStorage write
  - (E) CartProvider hydration

**Change Log:**
| Step | Time | Action |
|---|---|---|
| 1 | — | Session init + hypotheses listed |
