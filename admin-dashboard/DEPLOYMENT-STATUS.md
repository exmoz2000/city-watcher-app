# CityWatcher Admin Dashboard - Deployment Status

## Current Setup

### Frontend (Netlify)
- **Live URL:** https://citywatchers.netlify.app
- **Location:** `CityWatcher/city-watcher-app/admin-dashboard/frontend`
- **Framework:** React + Vite + Material-UI
- **Environment Variable:** `VITE_API_URL=https://studiously-sphereless-concetta.ngrok-free.dev/api`
- **Config:** `netlify.toml` with base directory set to `admin-dashboard/frontend`
- **CI/CD:** Auto-deploys from GitHub `master` branch

### Backend (Local + ngrok tunnel)
- **Local URL:** `http://localhost:5000`
- **Public URL (ngrok):** `https://studiously-sphereless-concetta.ngrok-free.dev`
- **Location:** `CityWatcher/city-watcher-app/admin-dashboard/backend`
- **Framework:** Flask + SQLAlchemy + Flask-JWT-Extended
- **Database:** SQLite (local file at `instance/citywatcher.db`)
- **Seeded Data:**
  - 3 municipalities (Cape Town, Durban, Johannesburg)
  - 11 users (various roles)
  - 150 reports
  - 18 SLA configs
  - 15 SLA tracking records
  - 6 community alerts

### Credentials
- **Email:** `admin@citywatcher.co.za`
- **Password:** `admin123`

## Running Processes

| Process ID | Command | Description |
|------------|---------|-------------|
| 30 | `python run.py` | Flask backend server |
| 27 | `ngrok http 5000` | ngrok tunnel to expose local backend |

## Configuration Files Created

### Backend
- **`.env`** - Contains fixed JWT secrets for consistent authentication
  ```
  SECRET_KEY=dev-secret-key-citywatcher-2026
  JWT_SECRET_KEY=jwt-secret-key-citywatcher-2026
  DATABASE_URL=sqlite:///citywatcher.db
  ```

### Frontend
- **`netlify.toml`** - Netlify build configuration
  ```toml
  [build]
    base = "admin-dashboard/frontend"
    command = "npm run build"
    publish = "dist"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

## Current Issue - RESOLVED ✅

### Issue Summary
- ❌ Dashboard was loading but showing NO data (all metrics showed "undefined")
- ❌ Navigation to other pages showed content for 1 second then WHITE SCREEN
- ❌ API requests were hitting ngrok but not reaching Flask backend

### Root Cause
**ngrok free tier interstitial warning page** was blocking all non-OPTIONS requests from reaching the Flask backend.

### Solution Implemented ✅
1. **Backend Fix**: Updated Flask CORS configuration to allow `ngrok-skip-browser-warning` header
2. **Backend Fix**: Added `after_request` middleware to ensure header is in Access-Control-Allow-Headers
3. **Frontend Fix**: Added `ngrok-skip-browser-warning: true` header to all axios API requests
4. **Deployed**: Rebuilt and redeployed frontend to Netlify
5. **Restarted**: Flask backend to apply CORS changes

### Current Status
- ✅ Dashboard loads with all data populating correctly
- ✅ All metrics display proper values
- ✅ Navigation between pages works without white screens
- ✅ API requests successfully reach Flask backend through ngrok
- ✅ Flask logs now show all incoming requests
- ✅ System fully operational

### Files Modified
- `backend/app/__init__.py` - Updated CORS config and added after_request middleware
- `frontend/src/services/api.js` - Added ngrok bypass header to axios config

---

## Previous Issue - CRITICAL (NOW RESOLVED)

### Symptoms
- ✅ Netlify build passes successfully
- ✅ Login works successfully (200 OK)
- ❌ Dashboard loads but shows NO data (all metrics show "undefined")
- ❌ Navigation to other pages (Maps, Users, Reports) shows content for 1 second then WHITE SCREEN
- ❌ No data populates anywhere in the application

### Root Cause Analysis

**API requests are NOT reaching the Flask backend despite going through ngrok**

### Evidence
1. ✅ ngrok logs show OPTIONS (CORS preflight) requests arriving - 200 OK
2. ❌ Flask backend logs show ZERO requests (not even login attempts)
3. ❌ This means requests hit ngrok but don't forward to Flask on localhost:5000
4. ❌ Browser Network tab shows requests completing but Flask never logs them

### Critical Discovery
**The ngrok tunnel and Flask backend are disconnected or requests are being blocked/dropped between ngrok and Flask.**

### White Screen Issue
The white screen on navigation suggests:
1. React Router is working (URL changes)
2. Components try to load
3. API calls fail silently
4. Error boundaries or failed data fetching causes blank render
5. No error messages in console (errors are being swallowed)

### Technical Details
- **ngrok URL:** `https://studiously-sphereless-concetta.ngrok-free.dev`
- **Flask running on:** `http://127.0.0.1:5000` and `http://192.168.101.108:5000`
- **ngrok forwarding to:** `http://localhost:5000`
- **Process IDs:** Flask=31, ngrok=32
- **Database:** Seeded with 150 reports, 11 users, 3 municipalities

### What's Working
- ✅ Netlify deployment and build
- ✅ Frontend loads and renders
- ✅ Login form appears
- ✅ ngrok tunnel is active
- ✅ Flask backend is running
- ✅ Database has data
- ✅ CORS preflight requests succeed

### What's NOT Working
- ❌ Actual API data requests (GET /api/dashboard/metrics, etc.)
- ❌ Flask never receives any HTTP requests
- ❌ Data doesn't populate in UI
- ❌ Navigation causes white screens
- ❌ No error messages visible to debug

### Possible Root Causes
1. **ngrok free tier interstitial page** blocking actual requests (only OPTIONS pass through)
2. **Port mismatch** - ngrok forwarding to wrong port or Flask not listening correctly
3. **Firewall/antivirus** blocking localhost connections
4. **JWT token issues** - tokens invalid but errors not surfacing
5. **CORS configuration** - preflight passes but actual requests blocked
6. **Flask debug mode** auto-reloading and breaking connections
7. **Request timeout** - requests timing out before reaching Flask
8. **ngrok session** expired or needs re-authentication

### Possible Causes
- JWT token validation failing on backend
- ngrok free tier interstitial page blocking requests
- CORS configuration issue preventing actual data requests
- Frontend not sending Authorization header correctly

## Files Modified During Deployment

1. **`frontend/src/pages/Dashboard.jsx`**
   - Added array safety checks: `Array.isArray(r.data) ? r.data : []`
   - Added error handling with `.catch(console.error)`

2. **`frontend/src/pages/Login.jsx`**
   - Removed demo credentials display for security

3. **`backend/.env`** (created)
   - Added fixed JWT secrets to prevent token invalidation on restart

4. **`frontend/netlify.toml`** (created)
   - Added base directory configuration
   - Added SPA redirect rules

## Next Steps for Deep Debugging

### Immediate Checks

1. **Verify ngrok is actually forwarding:**
   - Visit http://127.0.0.1:4040 (ngrok web interface)
   - Check if requests are showing up there
   - Verify forwarding URL matches Flask port

2. **Test Flask directly (bypass ngrok):**
   ```bash
   curl http://localhost:5000/api/dashboard/metrics
   ```
   - If this works, ngrok is the problem
   - If this fails, Flask isn't responding

3. **Check ngrok interstitial page:**
   - Open ngrok URL directly in browser
   - Click through any warning pages
   - Check if this enables subsequent requests

4. **Verify JWT token in browser:**
   - Open DevTools → Application → Local Storage
   - Check if `token` exists after login
   - Copy token and test with curl:
   ```bash
   curl http://localhost:5000/api/dashboard/metrics -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Check actual HTTP requests in Network tab:**
   - Filter by "Fetch/XHR"
   - Look for GET requests (not just OPTIONS)
   - Check if they're being sent at all
   - Check response status and body

### Deep Investigation

1. **Enable verbose Flask logging:**
   - Add logging to every route
   - Log all incoming requests
   - Check if Flask is even receiving connections

2. **Test ngrok tunnel health:**
   ```bash
   curl https://studiously-sphereless-concetta.ngrok-free.dev/api/dashboard/metrics
   ```
   - Should return 401 (unauthorized) if working
   - If returns ngrok error page, tunnel is broken

3. **Check Windows Firewall:**
   - Verify localhost connections allowed
   - Check if antivirus blocking Flask

4. **Verify CORS headers on actual requests:**
   - Check if Authorization header is being sent
   - Verify CORS allows credentials
   - Check if preflight and actual request headers match

5. **Test with Postman/Insomnia:**
   - Bypass browser entirely
   - Test ngrok URL directly
   - Verify backend is actually accessible

### Alternative Solutions

1. **Deploy backend to Render/Railway:**
   - Eliminate ngrok complexity
   - Get stable public URL
   - Proper production setup

2. **Use Netlify Dev locally:**
   - Run frontend locally
   - Connect to local backend directly
   - Eliminate deployment variables

3. **Check if it works locally:**
   - Run frontend locally: `npm run dev`
   - Point to `http://localhost:5000/api`
   - If this works, issue is with Netlify/ngrok setup

## Important Notes

- **ngrok URL changes** on every restart (free tier limitation)
- **JWT tokens invalidate** when backend restarts (now fixed with .env)
- **Database is local** - data persists in SQLite file
- **Netlify auto-deploys** from GitHub on every push to master
- **Backend must be running** for frontend to work (local + ngrok)

## Commands Reference

### Start Backend
```bash
cd CityWatcher/city-watcher-app/admin-dashboard/backend
python run.py
```

### Start ngrok
```bash
ngrok http 5000
```

### Seed Database
```bash
cd CityWatcher/city-watcher-app/admin-dashboard/backend
python seed.py
```

### Deploy Frontend
```bash
cd CityWatcher/city-watcher-app/admin-dashboard/frontend
netlify deploy --prod
```

### Update Netlify Environment Variable
```bash
netlify env:set VITE_API_URL "https://your-ngrok-url.ngrok-free.dev/api"
```
