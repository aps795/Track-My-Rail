# RapidAPI Setup - Get Real IRCTC Data in 5 Minutes

## 🚀 Fast Track to Real Data

### Step 1: Create RapidAPI Account (2 minutes)
1. Go to: https://rapidapi.com/
2. Click "Sign Up"
3. Enter email and password
4. Verify email
5. Done!

### Step 2: Find Railway API (2 minutes)
1. In RapidAPI dashboard, search box at top
2. Type: `Indian Railway API`
3. Look for options with good ratings
4. Popular choices:
   - "Indian Railway API" by mithun-sharma
   - "Train API" by many providers
5. Click on one

### Step 3: Subscribe to Free Plan (1 minute)
1. Click "Subscribe"
2. Select "Free" tier
3. Click "Continue"
4. Confirm

### Step 4: Get Your API Key (1 minute)
1. Go to "My Workspace" or Dashboard
2. Click "API Keys" or "Credentials"
3. Copy the "X-RapidAPI-Key" value
4. It looks like: `1a2b3c4d5e6f7g8h9i0j...`

### Step 5: Add to Your Project (1 minute)
1. Open file: `.env` (create if doesn't exist)
2. Add this line:
   ```
   RAPID_API_KEY=paste_your_key_here
   ```
3. Replace `paste_your_key_here` with your actual key
4. Save file

### Step 6: Restart Backend
```bash
npm start
```

### Step 7: Test Real Data
Open in browser:
```
http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15
```

You should see **real train data**! ✅

---

## ✅ Verification Checklist

- [ ] RapidAPI account created
- [ ] Railway API subscribed
- [ ] API key copied
- [ ] .env file has RAPID_API_KEY
- [ ] Backend restarted (npm start)
- [ ] API endpoint returns data
- [ ] Response shows "dataSource": "RAPID_API"

---

## 🧪 Test Commands

### In Terminal:
```bash
# Check if API key is set
cat .env | grep RAPID_API_KEY

# Should show: RAPID_API_KEY=your_key_here
```

### In Browser Console (F12):
```javascript
// Fetch real trains
fetch('http://localhost:5000/api/trains/search?from=NDLS&to=CSTM&date=2024-01-15')
  .then(r => r.json())
  .then(d => {
    console.log('Data Source:', d.dataSource); // Should show RAPID_API
    console.log('Trains:', d.trains);
    console.table(d.trains); // Pretty table
  });
```

### In API Response:
You should see:
```json
{
  "success": true,
  "dataSource": "RAPID_API",  // ← This confirms real data!
  "trains": [
    {
      "trainNo": "actual_train_number",
      "trainName": "actual_train_name",
      // ...real data
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "Still showing MOCK_DATA"
```
✓ Check: Is .env file in project root?
✓ Check: Did you restart backend after editing .env?
✓ Check: Is there a space before/after the key? (No spaces!)
✓ Check: Is the key correct? Copy-paste again from RapidAPI
```

### Error: "Rate limit exceeded"
```
You've exceeded free tier limits (usually 100 requests/day)

Solutions:
1. Upgrade to Pro tier (paid)
2. Wait until next day (free tier resets)
3. Use mock data in meantime
4. Test with longer intervals between requests
```

### Error: "Invalid API Key"
```
The key doesn't match any active subscription

Solutions:
1. Copy key again from dashboard
2. Make sure no extra spaces
3. Check that API is still subscribed (not canceled)
4. Try creating new API key
```

### Error: "API not found / 404"
```
The endpoint might be different on your chosen API

Solutions:
1. Check RapidAPI documentation for your API
2. Look at "Code Snippets" tab for exact endpoint
3. Different APIs have different structures
4. May need to adjust server.js to match API format
```

---

## 📊 What Real Data Looks Like

When using RapidAPI, you'll see:

### Search Response:
```json
{
  "success": true,
  "dataSource": "RAPID_API",
  "count": 12,
  "trains": [
    {
      "trainNo": "12015",
      "trainName": "Shatabdi Express",
      "source": "Delhi Jn",
      "destination": "Mumbai Central",
      "departure": "06:15",
      "arrival": "16:30",
      "duration": "10h 15m",
      "status": "On Time",
      "availability": {
        "firstClass": 20,
        "secondClass": 45,
        "thirdClass": 120
      }
    },
    // ... more trains
  ]
}
```

---

## 🎯 Next Steps

### After Setup Works:
1. ✅ Test with different stations
2. ✅ Check PNR endpoint
3. ✅ Get live status
4. ✅ Display real data in frontend

### Performance Tips:
1. Cache results (don't call API every page load)
2. Limit search results (top 10 trains)
3. Use smaller date ranges
4. Update every 5-10 minutes, not every second

---

## 💡 Different RapidAPI Providers

There are multiple "Indian Railway API" providers:

| Provider | Good For | Accuracy | Speed |
|----------|----------|----------|-------|
| mithun-sharma | General info | 90% | Fast |
| rkosta-01 | Real-time | 95% | Medium |
| Other options | Specialized | Varies | Varies |

**Tip**: Try the top-rated ones first!

---

## 🔐 API Key Safety

### ✅ DO:
- Keep .env file private
- Don't share your API key
- Add .env to .gitignore (already done)
- Use different keys for dev/prod

### ❌ DON'T:
- Commit .env to GitHub
- Share key in public chat
- Hardcode key in frontend
- Use same key for multiple apps

---

## 📞 Support

### If Stuck:
1. Check GET_REAL_DATA.md
2. Read RapidAPI FAQ: https://rapidapi.com/learn
3. Ask on RapidAPI community
4. Check API documentation page

### Common API Endpoints:
```
/trains/search?source=NDLS&destination=CSTM&date=2024-01-15
/stations/list
/trains/live?trainNo=12015
/pnr/status?pnr=1234567890
```

(May vary by provider - check RapidAPI dashboard)

---

## 🎉 You're Done!

You now have **real IRCTC data** in your application!

Continue with:
1. Testing all features
2. Developing frontend display
3. Planning production deployment

Happy tracking! 🚂

---

**Time to Real Data**: ~5 minutes
**Cost**: Free
**Effort**: Minimal
**Result**: Real Indian railway data! ✅
