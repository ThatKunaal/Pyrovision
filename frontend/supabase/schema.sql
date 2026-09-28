-- ==============================================================================
-- PYROVISION TACTICAL COMMAND DASHBOARD // SUPABASE SCHEMA SETUP
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create the thermal_anomalies table
CREATE TABLE IF NOT EXISTS public.thermal_anomalies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category TEXT NOT NULL DEFAULT 'Industrial Process',
    frp_radiance NUMERIC NOT NULL DEFAULT 100,
    confidence NUMERIC DEFAULT 95.0,
    threat_summary TEXT,
    severity_status TEXT DEFAULT 'NOMINAL',
    region TEXT,
    sensor TEXT DEFAULT 'VIIRS 375M H20',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & allow anonymous reads
ALTER TABLE public.thermal_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to thermal_anomalies"
ON public.thermal_anomalies
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert/update for real-time telemetry testing"
ON public.thermal_anomalies
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Enable Supabase Realtime replication on this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.thermal_anomalies;

-- 4. Seed initial NASA FIRMS telemetry data matching reference dashboard
INSERT INTO public.thermal_anomalies (id, name, latitude, longitude, category, frp_radiance, confidence, threat_summary, severity_status, region, sensor)
VALUES
    ('TH-2580', 'Nagarnar Steel Plant', 19.0853, 82.0244, 'Industrial Process', 4898, 99.4, '48h continuous cycle (94% duty cycle - Blast Furnace)', 'P-93 CRITICAL', 'Bastar, Chhattisgarh', 'VIIRS 375M H20'),
    ('WF-04', 'Similipal Forest Reserve', 21.9372, 86.3389, 'Wildfire Front', 1420, 94.2, 'Canopy breach SEV-1 detected. Active fire front expanding NE at 2.3 km/h.', 'SEV-1 HIGH', 'Mayurbhanj, Odisha', 'MODIS TERRA 1KM'),
    ('GF-102', 'KG-Basin Offshore Flare', 16.5167, 82.3194, 'Gas Flare', 860, 97.8, 'Continuous flare stack operation. KG-D6 offshore platform nominal.', 'NOMINAL', 'Bay of Bengal, Offshore', 'Sentinel-2 L2A'),
    ('TH-1184', 'Singrauli Super Thermal Basin', 24.1969, 82.6611, 'Industrial Process', 3200, 98.1, 'Coal-fired thermal plant cluster. 6 active stacks detected.', 'P-87 ELEVATED', 'Singrauli, Madhya Pradesh', 'VIIRS 375M H20'),
    ('CB-742', 'Sangrur Agri-Belt Transient Cluster', 30.2408, 75.8412, 'Crop Residue Burning', 120, 76.3, 'Seasonal crop residue burning pattern. Multiple transient hotspots.', 'LOW', 'Sangrur, Punjab', 'VIIRS 375M H20'),
    ('TH-3901', 'Korba Industrial Metallurgical Corridor', 22.3595, 82.7501, 'Industrial Process', 2750, 96.5, 'Aluminium smelter + thermal power plant co-located radiative cluster.', 'P-78 ELEVATED', 'Korba, Chhattisgarh', 'MODIS TERRA 1KM'),
    ('WF-11', 'Bandipur Tiger Reserve Edge Fire', 11.6689, 76.6315, 'Wildfire Front', 680, 88.9, 'Forest buffer zone fire front. 800m from reserve boundary.', 'SEV-2 MODERATE', 'Chamarajanagar, Karnataka', 'Sentinel-2 L2A'),
    ('GF-207', 'Mumbai High Offshore Platform', 19.3897, 71.3614, 'Gas Flare', 540, 95.2, 'Routine gas flare. Bombay High field production platform.', 'NOMINAL', 'Arabian Sea, Offshore', 'VIIRS 375M H20'),
    ('CB-819', 'Fatehabad Stubble Burn Zone', 29.5177, 75.4548, 'Crop Residue Burning', 95, 72.1, 'Post-harvest stubble burning. Transient thermal signatures.', 'LOW', 'Fatehabad, Haryana', 'MODIS TERRA 1KM'),
    ('TH-4102', 'Jharsuguda Thermal Power Hub', 21.8554, 84.0063, 'Industrial Process', 3650, 97.9, 'IB Valley thermal power station + coal mine fire cluster.', 'P-91 CRITICAL', 'Jharsuguda, Odisha', 'VIIRS 375M H20'),
    ('WF-18', 'Amarkantak Biosphere Fringe', 22.6742, 81.7570, 'Wildfire Front', 950, 91.4, 'Dry deciduous forest fire spreading. SAL buffer zone proximity alert.', 'SEV-1 HIGH', 'Anuppur, Madhya Pradesh', 'Sentinel-2 L2A'),
    ('TH-5500', 'Bokaro Steel City Complex', 23.6693, 86.1511, 'Industrial Process', 4200, 98.7, 'Integrated steel plant. Coke oven + blast furnace multi-source thermal.', 'P-90 CRITICAL', 'Bokaro, Jharkhand', 'VIIRS 375M H20')
ON CONFLICT (id) DO UPDATE SET
    frp_radiance = EXCLUDED.frp_radiance,
    confidence = EXCLUDED.confidence,
    threat_summary = EXCLUDED.threat_summary;

