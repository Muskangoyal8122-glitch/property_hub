# Property Hub — Fresh Setup (Sirf 3 Steps)

Ye version pehle se ready hai:
- ✅ `.env` files already fill ki hui hain (Google Client ID daala hua hai)
- ✅ Database automatically seed ho jayega (6 sample Jaipur listings, photos ke saath) jab pehli baar server chalega
- ✅ Sirf **ek command** se frontend + backend dono ek saath chalte hain

## Zaroori: MongoDB local mein chalu hona chahiye
MongoDB Compass khol ke check kar lo `localhost:27017` connect ho raha hai (agar Compass already MongoDB service ke saath install hai, to ye already chalu hoga).

## Step 1 — Purana project delete karo, ye naya use karo
Is zip ko ek **naye/khaali folder** mein extract karo (purane `property_hub` folder ko VS Code mein band karke, chaho to delete kar do ya rename kar do taaki confusion na ho).

## Step 2 — Ek hi baar: sab kuch install karo
VS Code mein is naye folder ko kholo (`File → Open Folder`), naya terminal kholo (`Terminal → New Terminal`), aur chalao:

```bash
npm run install-all
```

Ye root aur `server` — dono jagah ki dependencies install kar dega. Thoda time lagega, wait karo.

## Step 3 — Sirf ek command se sab chalao
```bash
npm run dev
```

Isse **ek hi terminal mein** dono cheezein chalengi:
- 🔵 SERVER (backend, port 5000, MongoDB se connect + auto-seed)
- 🟢 CLIENT (frontend, port 5173)

Terminal mein kuch aisa dikhega:
```
[SERVER] ✅ MongoDB connected
[SERVER] 🌱 Auto-seeded 6 sample properties (database was empty).
[SERVER] 🚀 Server running on http://localhost:5000
[CLIENT] ➜  Local: http://localhost:5173/
```

Ab browser mein **http://localhost:5173** kholo, Google se Sign in karo, aur properties dikhni chahiye — real photos ke saath, Rent/Buy filter ke saath.

## Rokna ho to
Terminal mein click karke **Ctrl + C** dabao — dono (frontend + backend) ek saath band ho jayenge.

## Agar dubara demo data refresh karna ho
```bash
cd server
npm run seed
```
(Ye purana data clear karke naya daal dega — sirf agar zaroorat pade.)

## Kuch na chale to
1. Confirm karo MongoDB Compass `localhost:27017` se connect ho pa raha hai
2. `npm run dev` chalate waqt agar koi RED error aaye, uska screenshot bhejo
3. Browser mein `localhost:5173` refresh karne se pehle terminal mein `[CLIENT] Local: http://localhost:5173/` line zaroor aani chahiye
