# Clock Drift: The "Invisible" Authentication Killer

In a distributed web application, small differences between the clocks of different servers (or between a server and a browser) can cause "impossible" authentication failures. This document explains what happened in our project and how to prevent it in the future.

## What is Clock Drift?

**Clock Drift** (also known as **Clock Skew**) is the phenomenon where two different computers (e.g., your Backend server and your Frontend server) have slightly different ideas of the current "exact" time.

In authentication, this is critical because **JWT (JSON Web Tokens)** use precise timestamps (`iat` for "Issued At" and `exp` for "Expiration") to determine if a session is valid.

---

## The Problem in This App

### 1. Where it happened
We observed a consistent **3-minute drift** between your **NestJS Backend** and your **Next.js Frontend**.
- **Backend Time**: 08:00 AM (Issues a 5-minute token expiring at 08:05 AM)
- **Frontend Time**: 08:03 AM (Receives the token and checks it)

### 2. The Result: "The Immediate Expiration"
From the Frontend's perspective, the token was issued "in the past." If the drift is larger than the token's lifetime (e.g., if the backend was 6 minutes behind), the Frontend would see a **brand-new token as already expired** the very second it received it.

### 3. The Recursive Redirect Loop
This caused a "death loop" in our Middleware:
1.  **Browser**: Requests a page.
2.  **Middleware**: Checks the token, sees it's "expired" (due to drift), and redirects to `/auth-refresh`.
3.  **Auth Refresh**: Calls the Backend to get a new token.
4.  **Backend**: Issues another "fresh" token.
5.  **Middleware**: Rejects the *new* token too, because the clock gap still exists.
6.  **Loop**: The browser redirects indefinitely until it eventually hits a limit and kicks the user to sign-in.

---

## Common Cases in Other Apps

Clock Drift is extremely common in the following scenarios:
-   **Local Development**: Different processes (Docker containers, local terminals) occasionally desync if the host machine's hardware clock drifts.
-   **Microservices**: One service in a cluster (e.g., AWS EC2) might have an outdated NTP sync.
-   **Mobile/Client devices**: Users often manually set their phone clocks ahead/behind, which will break all JWT-based APIs if the server is strict.

---

## The Solution: Clock Tolerance (Skew)

We resolved this by implementing **Clock Tolerance** (also called **Grace Period**).

### Our implementation:
We added a **10-minute tolerance (600 seconds)** to the `jose.jwtVerify` function.

> [!TIP]
> Instead of checking: `currentTime >= tokenExpiration`
>
> We now check: `(currentTime - 10_minutes) >= tokenExpiration`

### Why this works:
By being "lenient" with the time, we allow for up to 10 minutes of clock drift between your Frontend and Backend. This ensures that even if one server is "stuck in the past," the other server will still treat the session accurately.

### Best Practices:
1.  **Sync Clocks**: In production, ensure both servers use **NTP (Network Time Protocol)** to sync with an atomic clock.
2.  **Library-Level Tolerance**: Always use the `clockTolerance` option provided by your JWT library (like `jose` or `jsonwebtoken`) rather than doing manual math.
3.  **Buffer for Expiration**: Always give your Access Tokens a slightly longer expiration than the absolute minimum required.
