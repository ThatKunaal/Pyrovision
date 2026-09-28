# 🔥 PYROVISION // SEC-OPS

**A security-operations (SEC-OPS) map dashboard for monitoring industrial and wildfire risk across India.**

🔗 **Live:** [pyrovision-y5hm.vercel.app](https://pyrovision-y5hm.vercel.app/)

---

## Overview

Pyrovision is a map-centric dashboard that visualizes and distinguishes multiple data layers — starting with Indian industrial facilities — to support situational awareness for security and monitoring use cases. It's built to be extensible: the current facility layer is a stepping stone toward broader fire/hazard-monitoring layers.

## ✨ Features

- 🗺️ Interactive map view with marker clustering for dense facility regions
- 🏭 ~95 Indian industrial facilities plotted across categories: refineries, steel plants, thermal/nuclear/hydro power plants, aluminium plants, cement plants, fertilizer plants, petrochemical complexes, automobile hubs, textile mills, and pharmaceutical clusters
- 📊 Facility metadata: name, category, state, and precise coordinates
- ⚡ Fast, modern build pipeline with Vite and Tailwind CSS
- 🗄️ Supabase-backed data layer for facility records

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|--------------------------|
| Frontend   | React 19 + Vite 8        |
| Styling    | Tailwind CSS 4           |
| Map        | Leaflet / react-leaflet (marker clustering) |
| Backend    | Supabase                 |
| Hosting    | Vercel                   |

## 📁 Data

The facility dataset is available in two formats:
- **GeoJSON** — a ready-to-use `FeatureCollection` for direct rendering with react-leaflet
- **CSV** — formatted for import into a Supabase table

Sources considered/used for facility data include Wikipedia infoboxes, the Central Electricity Authority (cea.nic.in), ISRO/NITI Aayog VEDAS Energy Map, the WRI Global Power Plant Database, OpenStreetMap (via Overpass API), and data.gov.in.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A [Supabase](https://supabase.com) project (URL + anon/public key)

### Installation

```bash
# Clone the repo
git clone https://github.com/Harshgoyal001/pyrovision.git
cd pyrovision

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> ⚠️ Never commit your `.env` file — it's already covered by `.gitignore`.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Build for production

```bash
npm run build
```

## ☁️ Deployment

This project is deployed on **Vercel**, connected directly to this GitHub repository. Every push to `main` triggers an automatic redeploy.

To deploy your own instance:
1. Push this repo to your GitHub account
2. Import it into [Vercel](https://vercel.com)
3. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy 🚀

## 🗺️ Roadmap

- [ ] Automate facility data collection via the OpenStreetMap Overpass API and load directly into Supabase
- [ ] Expand data sourcing for more comprehensive, authoritative facility coverage
- [ ] Add live wildfire/hazard monitoring layers alongside the existing facility layer

## 👤 Author

**Harsh Goyal**
- GitHub: [@Harshgoyal001](https://github.com/Harshgoyal001)
- LinkedIn: [harsh-goyal-063438348](https://linkedin.com/in/harsh-goyal-063438348)
- Email: harshgoyal89200@gmail.com

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
