# 🔥 Pyrovision

**An AI-powered geospatial system that detects, classifies, and verifies thermal anomalies into precise, actionable fire categories using satellite data, land-cover context, and government records.**

Built by **Team Blaze Core** for **Smart India Hackathon 2026**.

## 🚀 Live Demo

🌐 **[Open Pyrovision Live Dashboard](https://pyrovision-y5hm.vercel.app/)**

> Explore the live GIS dashboard, thermal hotspot classifications, statistics, and satellite-based visualization.

| | |
|---|---|
| **Problem Statement ID** | SIH26162 |
| **Problem Statement** | AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data |
| **Organization** | NTRO |
| **Theme** | Disaster Management |
| **Category** | Software |
| **Team Name** | Blaze Core |

---

# 👥 Team Blaze Core

| Member | Role |
|---|---|
| **Kunal Kumar Vishwakarma** | Team Leader |
| **Sanjeet** | Team Member |
| **Harsh Goyal** | Team Member |
| **Anjali Rout** | Team Member |
| **Yash Kumar** | Team Member |
| **Yashika Chandra** | Team Member |

---


## 🚨 The Problem

Satellite systems such as NASA FIRMS can identify **where thermal anomalies are detected**, but the thermal signal alone does not directly tell us **what caused the anomaly**.

A refinery fire, gas flare, crop-residue burning, mining activity, and forest fire can all appear as thermal hotspots.

This creates a major challenge for analysts who need to manually combine satellite observations with geographical, land-cover, infrastructure, and historical information to determine the likely source.

---

## 💡 Our Solution

**Pyrovision** combines satellite thermal observations with geospatial context, temporal behaviour, land-cover information, government records, and machine learning to classify thermal anomalies into five actionable categories:

- 🏭 **Industrial Fire**
- 🔥 **Gas Flare**
- 🌾 **Agriculture Fire**
- ⛏️ **Mining Activity**
- 🌲 **Wild Fire**

The system also provides persistence tracking, severity levels, infrastructure verification, and an interactive GIS dashboard for hotspot investigation.

---

## ✨ Key Features

- 🛰️ **Real-time thermal data ingestion** from NASA FIRMS VIIRS
- 🇮🇳 **India-specific hotspot filtering**
- 📍 **Spatial grouping** of nearby thermal detections into meaningful sites
- 🏭 **Industrial facility matching** using OpenStreetMap
- 🌍 **Land-cover context** using ESA WorldCover
- ⚡ **Power plant verification** using CEA and WRI datasets
- ⛏️ **Coal-mine context** using coal-mine location data
- 📈 **Persistence tracking** using repeated satellite observations
- 🌡️ **Radiometric analysis** using FRP and brightness features
- 🌙 **Night-time detection ratio** for source characterization
- 🤖 **Random Forest machine learning classifier**
- 🔎 **Post-classification contextual verification**
- 🏷️ **Government-verified context badges**
- 🚨 **Severity-based alerts** — Critical / High / Elevated
- 🗺️ **Interactive GIS dashboard** using React + Leaflet
- 🛰️ **High-resolution satellite visualization** for curated hotspots
- 📊 **Statistics and analytical views**
- ⚡ **Lightweight ML model** designed for fast inference

---

# ⚙️ Technical Workflow

Pyrovision follows a multi-stage geospatial AI pipeline combining satellite observations, spatial context, temporal behaviour, machine learning, and verification data.

```text
                    ┌──────────────────────┐
                    │     NASA FIRMS       │
                    │   VIIRS Thermal Data │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Data Ingestion     │
                    │    CSV / FIRMS       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ India Filtering &    │
                    │ Spatial Grouping     │
                    │      965 Sites       │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌──────────────────────────────────┐
              │       Geospatial Enrichment      │
              │                                  │
              │ OSM Facilities   ESA WorldCover  │
              │ CEA / WRI        Coal Mines      │
              └──────────────────┬───────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │ Feature Engineering  │
                    │                      │
                    │ • Days Active        │
                    │ • Total Detections   │
                    │ • Average FRP        │
                    │ • Maximum FRP        │
                    │ • FRP Std. Dev.      │
                    │ • Brightness         │
                    │ • Night Ratio        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Random Forest      │
                    │     Classifier       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Contextual           │
                    │ Verification         │
                    │                      │
                    │ Land Cover           │
                    │ Government Records   │
                    │ Persistence           │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌──────────────────────────────────┐
              │        Final Classification      │
              │                                  │
              │ 🏭 Industrial Fire               │
              │ 🔥 Gas Flare                    │
              │ 🌾 Agriculture Fire              │
              │ ⛏️ Mining Activity               │
              │ 🌲 Wild Fire                     │
              └──────────────────┬───────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │ Supabase / PostgreSQL │
                    │                      │
                    │ Sites                │
                    │ Predictions          │
                    │ Temporal Features    │
                    │ Facility Information │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │       REST API        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React + Leaflet GIS  │
                    │     Dashboard        │
                    └──────────────────────┘
```

### 1. 🛰️ Data Ingestion

NASA FIRMS VIIRS thermal anomaly data is used as the primary source of satellite-based thermal observations.

The raw observations contain information such as:

- Latitude
- Longitude
- Acquisition date/time
- Brightness
- Fire Radiative Power (FRP)
- Day/night information
- Confidence-related attributes

---

### 2. 📍 India Filtering & Spatial Grouping

The raw global dataset is filtered to retain observations within India.

Nearby detections are then grouped into representative hotspot sites so that repeated satellite observations can be analysed as a single thermal source instead of independent points.

**Processed sites:** 965

---

### 3. 🗺️ Geospatial Context Enrichment

Each hotspot is enriched using multiple external datasets.

| Dataset | Purpose |
|---|---|
| **OpenStreetMap** | Industrial facility identification |
| **ESA WorldCover** | Land-cover classification |
| **CEA** | Official power-station context |
| **WRI GPPD** | Power-plant information |
| **Coal Mine Dataset** | Mining activity context |

OpenStreetMap facility matching uses a **KDTree spatial search** with a defined distance threshold.

---

### 4. 📈 Feature Engineering

Repeated thermal observations are converted into meaningful temporal and radiometric features.

| Feature | Purpose |
|---|---|
| Days Active | Measures persistence |
| Total Detections | Measures recurrence |
| Average FRP | Represents typical thermal intensity |
| Maximum FRP | Captures peak thermal intensity |
| FRP Standard Deviation | Measures thermal stability |
| Average Brightness | Represents thermal brightness |
| Night Ratio | Helps characterize persistent thermal sources |

These features allow the model to distinguish between persistent thermal sources and more transient events.

---

### 5. 🤖 Machine Learning Classification

A Random Forest classifier is trained using engineered radiometric and temporal features.

The model was benchmarked against multiple algorithms, with Random Forest selected for the final classification pipeline.

The model produces an initial classification which is subsequently passed through the contextual verification layer.

---

### 6. 🔎 Post-Classification Verification

The initial ML prediction is combined with additional spatial context.

Verification considers:

- Land-cover information
- Industrial facility proximity
- Power-plant records
- Coal-mine locations
- Hotspot persistence
- Thermal behaviour

This additional layer helps refine the final classification.

---

### 7. 🗄️ Database & API Layer

Supabase/PostgreSQL stores:

- Hotspot sites
- Latitude / longitude
- Temporal features
- Thermal statistics
- Predictions
- Facility information
- Verification context

The FastAPI backend provides the processed data and predictions to the frontend.

---

### 8. 🌐 GIS Dashboard

The frontend is built using React, Leaflet, Tailwind CSS, and Recharts.

The dashboard provides:

- Interactive hotspot map
- Category-based markers
- Satellite imagery
- Power-plant overlay
- Hotspot details
- Severity information
- Statistics
- Classification views

---

# 🧠 AI / ML Architecture

Pyrovision uses a lightweight machine-learning pipeline designed for rapid training and inference.

### Input Features

```text
VIIRS Thermal Observations
          │
          ▼
Temporal Aggregation
          │
          ▼
Radiometric Feature Extraction
          │
          ├── Days Active
          ├── Total Detections
          ├── Average FRP
          ├── Maximum FRP
          ├── FRP Standard Deviation
          ├── Average Brightness
          └── Night Ratio
          │
          ▼
Random Forest Classifier
          │
          ▼
Initial Prediction
          │
          ▼
Contextual Verification
          │
          ▼
Final Fire Category
```

### Model Specifications

| Metric | Value |
|---|---|
| Algorithm | Random Forest |
| Training Time | < 1 second |
| Inference Time | 1–5 ms |
| Model Size | ~50–200 KB |
| Accuracy | **80.5%** |
| Evaluation | Leakage-controlled retraining |

### Data Leakage Control

During model development, facility-distance-based features were removed from the training process to reduce spatial/contextual leakage.

The model was then retrained using independent radiometric and temporal features.

---

# 📊 Model Performance

**Accuracy: 80.5%**

The reported accuracy comes from the leakage-controlled version of the model after removing facility-distance-based features.

The final pipeline combines ML predictions with contextual verification rather than relying solely on the classifier output.

---

# 🏷️ Classification Categories

| Category | Typical Context |
|---|---|
| 🏭 **Industrial Fire** | Industrial facilities and infrastructure |
| 🔥 **Gas Flare** | Persistent thermal sources associated with gas/oil infrastructure |
| 🌾 **Agriculture Fire** | Crop-residue and agricultural burning |
| ⛏️ **Mining Activity** | Open-pit mining and mining-related thermal activity |
| 🌲 **Wild Fire** | Vegetation and forest-related fire activity |

---

# 🚨 Severity Classification

Pyrovision uses Fire Radiative Power and thermal behaviour to assign alert severity.

```text
Thermal Hotspot
       │
       ▼
   FRP Analysis
       │
       ├───────────────┐
       │               │
       ▼               ▼
   Critical          High
       │               │
       └───────┬───────┘
               │
               ▼
            Elevated
```

Severity is intended to help prioritize investigation and does not replace emergency-response procedures.

---

# 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS |
| **GIS / Mapping** | Leaflet, MapTiler |
| **Charts** | Recharts |
| **Backend** | Python, FastAPI |
| **Database** | Supabase, PostgreSQL |
| **AI / ML** | Random Forest, scikit-learn |
| **Data Processing** | Pandas, SciPy |
| **Spatial Processing** | KDTree |
| **Deployment** | Vercel, Render |
| **Version Control** | Git, GitHub |

---

# 🌍 Data Sources

### 🛰️ NASA FIRMS

NASA Fire Information for Resource Management System provides satellite-based active-fire and thermal anomaly observations.

https://firms.modaps.eosdis.nasa.gov/

### 🗺️ OpenStreetMap

Used for industrial facility and infrastructure context.

https://www.openstreetmap.org/

### 🌍 ESA WorldCover

Used for land-cover classification and contextual verification.

https://planetarycomputer.microsoft.com/dataset/esa-worldcover

### ⚡ Central Electricity Authority

Used for power-station context and verification.

https://cea.nic.in/

### ⚡ WRI Global Power Plant Database

Used for power-plant information.

https://datasets.wri.org/datasets/global-power-plant-database

### ⛏️ Indian Coal Mine Dataset

Used for coal-mine location context.

https://www.kaggle.com/datasets/shitalgaikwad123/indian-coal-mines-dataset-january-20211

---

# 📁 Project Structure

```text
Pyrovision/
│
├── backend/
│   ├── data/
│   ├── api/
│   ├── models/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── models/
│   └── trained model files
│
├── images/
│   ├── Agricultural_Fire_Detection.png
│   ├── GIS_Dashboard_View.png
│   ├── Gas_Flare_Detection.png
│   ├── Industrial_Fire_Detection.png
│   ├── Mining_Activity_Detection.png
│   ├── Statistics_View.png
│   └── Wild_Fire_Detection.png
│
├── Ind_facility_database.csv
│
└── README.md
```

---

# 🖼️ Screenshots

## 🗺️ GIS Dashboard

![GIS Dashboard](images/GIS_Dashboard_View.png)

---

## 📊 Statistics & Analytics

![Statistics View](images/Statistics_View.png)

---

## 🏭 Industrial Fire Detection

![Industrial Fire Detection](images/Industrial_Fire_Detection.png)

---

## 🔥 Gas Flare Detection

![Gas Flare Detection](images/Gas_Flare_Detection.png)

---

## 🌾 Agricultural Fire Detection

![Agricultural Fire Detection](images/Agricultural_Fire_Detection.png)

---

## ⛏️ Mining Activity Detection

![Mining Activity Detection](images/Mining_Activity_Detection.png)

---

## 🌲 Wild Fire Detection

![Wild Fire Detection](images/Wild_Fire_Detection.png)

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Python 3.x
- Node.js
- npm
- Git

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn api:app --reload
```

The FastAPI backend will start locally using the Uvicorn development server.

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The Vite development server will provide the local frontend URL.

---

# 🔐 Environment Variables

Create a `.env` file inside the `frontend/` directory.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPTILER_API_KEY=your_maptiler_api_key
```

### Security

Never commit actual credentials or API keys to GitHub.

Use `.env.example` for documenting required environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAPTILER_API_KEY=
```

---

# 🎯 Potential Users

### 🛰️ NTRO

Can use the system for monitoring thermal anomalies around mapped infrastructure and industrial facilities.

### 🚨 NDMA

Can use classified hotspot information and severity indicators to support disaster-response coordination and investigation.

### 🌲 FSI

Can use contextual classification to help distinguish vegetation-related fires from industrial, agricultural, mining, and other persistent thermal sources.

> Pyrovision is designed as a decision-support and investigation tool. It does not replace emergency-response systems or on-ground verification.

---

# ⚠️ Limitations

- Initial labels are generated using facility and vegetation context rather than a comprehensive ground-truth dataset.
- There is no universally available official dataset containing confirmed satellite-based fire-type labels for every hotspot.
- OpenStreetMap is community-driven and may contain incomplete or outdated facility information.
- VIIRS observations have finite spatial resolution, meaning a single detection can represent multiple nearby structures or activities.
- Fixed spatial thresholds may produce mismatches in dense industrial areas.
- Satellite observations can be affected by cloud cover, observation timing, and sensor limitations.
- Classification results should therefore be interpreted as decision-support information rather than absolute ground truth.

### Risk Reduction

Pyrovision reduces these limitations through:

- Temporal persistence analysis
- Radiometric feature engineering
- Multi-source geospatial context
- Government dataset verification
- Spatial matching
- Post-classification refinement

---

# 🔗 Links

🌐 **Live Demo:**  
https://pyrovision-y5hm.vercel.app/

🎥 **Demo Video:**  
Coming soon

💻 **GitHub Repository:**  
This repository

---

# 🙏 Credits

### Data

- NASA FIRMS
- OpenStreetMap
- ESA WorldCover
- Central Electricity Authority
- WRI Global Power Plant Database
- Kaggle Indian Coal Mine Dataset

---

# 📚 References

- Vadrevu & Lasko, 2018 — Remote Sensing
- Elvidge et al., 2013 — VIIRS Nightfire / Satellite Pyrometry at Night
- Hu et al., 2023 — Sentinel-2 + VIIRS gas flare detection
- OroraTech Wildfire Solution
- Google FireSat / Earth Fire Alliance
- FSI Fire Alert System (FAST 3.0)

---

# 🔥 Pyrovision

### **From Thermal Anomaly → Context → Classification → Action**

**Team Blaze Core · Smart India Hackathon 2026**
