import { useState, useMemo } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const repairData = {

  // ── MAINTENANCE ──────────────────────────────────────────────────────────
  "Oil Change": {
    icon: "🛢️", category: "Maintenance",
    costs: {
      "Conventional": { low: 50, high: 100 },
      "Synthetic Blend": { low: 75, high: 130 },
      "Full Synthetic": { low: 100, high: 175 },
    },
    labor: "0.5–1 hr",
    notes: "Prices have risen significantly since 2022. Full synthetic is now standard on most modern engines.",
  },
  "Tire Rotation": {
    icon: "⚙️", category: "Maintenance",
    costs: {
      "Standard": { low: 25, high: 60 },
      "With Balance": { low: 80, high: 150 },
    },
    labor: "0.5 hr",
    notes: "Often free or discounted with tire purchase. Recommended every 5–7k miles.",
  },
  "Cabin Air Filter": {
    icon: "🌬️", category: "Maintenance",
    costs: {
      "Basic": { low: 30, high: 70 },
      "HEPA/Premium": { low: 50, high: 100 },
    },
    labor: "0.25 hr",
    notes: "Very DIY-friendly. YouTube your specific model — often under 5 minutes.",
  },
  "Engine Air Filter": {
    icon: "💨", category: "Maintenance",
    costs: { "Standard": { low: 25, high: 60 }, "Performance": { low: 50, high: 90 } },
    labor: "0.25 hr",
    notes: "DIY-friendly on most vehicles. Replace every 15–30k miles or annually.",
  },
  "Wiper Blades": {
    icon: "🌧️", category: "Maintenance",
    costs: {
      "Economy (pair)": { low: 30, high: 60 },
      "Premium Beam (pair)": { low: 60, high: 110 },
    },
    labor: "0.25 hr",
    notes: "Easy DIY. Most auto parts stores will install for free with purchase.",
  },
  "Fuel Filter": {
    icon: "⛽", category: "Maintenance",
    costs: {
      "External (inline)": { low: 70, high: 130 },
      "In-tank (with pump)": { low: 200, high: 400 },
    },
    labor: "1–3 hrs",
    notes: "Many modern cars have in-tank filters changed with the fuel pump. Check your service manual.",
  },
  "Tire Replacement (each)": {
    icon: "🔄", category: "Maintenance",
    costs: {
      "Economy": { low: 80, high: 140 },
      "Mid-range": { low: 120, high: 200 },
      "Performance/SUV": { low: 180, high: 350 },
    },
    labor: "0.5 hr per tire",
    notes: "Price per tire including mounting and balancing. Buy 4 for better pricing.",
  },
  "Multi-Point Inspection": {
    icon: "🔍", category: "Maintenance",
    costs: { "Standard": { low: 0, high: 75 } },
    labor: "0.5–1 hr",
    notes: "Often free at dealerships with any service. Standalone inspections average $50–$75 in 2026.",
  },

  // ── BRAKES ───────────────────────────────────────────────────────────────
  "Brake Pads (Front)": {
    icon: "🔧", category: "Brakes",
    costs: {
      "Economy": { low: 150, high: 250 },
      "OEM": { low: 220, high: 380 },
      "Performance": { low: 300, high: 500 },
    },
    labor: "1–2 hrs",
    notes: "Prices are per axle including labor. Rotors may add $150–$300 more if worn.",
  },
  "Brake Pads (Rear)": {
    icon: "🔧", category: "Brakes",
    costs: {
      "Economy": { low: 130, high: 220 },
      "OEM": { low: 200, high: 350 },
      "Performance": { low: 280, high: 460 },
    },
    labor: "1–2 hrs",
    notes: "Electric parking brakes require a special tool to retract the caliper — adds labor cost.",
  },
  "Brake Rotors (pair)": {
    icon: "⭕", category: "Brakes",
    costs: {
      "Economy": { low: 100, high: 200 },
      "OEM": { low: 180, high: 320 },
      "Slotted/Drilled": { low: 250, high: 450 },
    },
    labor: "1–2 hrs",
    notes: "Usually replaced in pairs per axle. Often done with pads for best results.",
  },
  "Brake Fluid Flush": {
    icon: "💧", category: "Brakes",
    costs: { "Standard": { low: 80, high: 150 } },
    labor: "0.5–1 hr",
    notes: "Recommended every 2 years or 30k miles. Moisture in old fluid lowers boiling point.",
  },
  "Brake Caliper": {
    icon: "🗜️", category: "Brakes",
    costs: {
      "Remanufactured (each)": { low: 150, high: 300 },
      "OEM New (each)": { low: 250, high: 500 },
    },
    labor: "1–2 hrs",
    notes: "Seized calipers can cause uneven wear or pulling. Often diagnosed during pad inspection.",
  },

  // ── ENGINE ────────────────────────────────────────────────────────────────
  "Spark Plugs": {
    icon: "🔥", category: "Engine",
    costs: {
      "Copper (4-cyl)": { low: 80, high: 150 },
      "Iridium (4-cyl)": { low: 150, high: 250 },
      "V6/V8 Upcharge": { low: 200, high: 400 },
    },
    labor: "1–3 hrs",
    notes: "Cylinder count and accessibility drive cost dramatically.",
  },
  "Timing Belt": {
    icon: "⏱️", category: "Engine",
    costs: {
      "Belt Only": { low: 300, high: 500 },
      "With Water Pump": { low: 500, high: 900 },
    },
    labor: "4–8 hrs",
    notes: "Many modern vehicles use timing chains (no replacement needed). Critical safety service.",
  },
  "Timing Chain": {
    icon: "⛓️", category: "Engine",
    costs: { "Standard": { low: 800, high: 1800 } },
    labor: "6–12 hrs",
    notes: "More expensive than belt replacement. Rattling on startup is a warning sign — don't ignore it.",
  },
  "Coolant Flush": {
    icon: "🌡️", category: "Engine",
    costs: { "Standard": { low: 100, high: 200 } },
    labor: "1 hr",
    notes: "Recommended every 30k–50k miles or 2–5 years depending on coolant type.",
  },
  "Thermostat Replacement": {
    icon: "🌡️", category: "Engine",
    costs: { "Standard": { low: 150, high: 300 } },
    labor: "1–2 hrs",
    notes: "Often replaced with coolant flush. Symptoms include overheating or no heat in cabin.",
  },
  "Water Pump": {
    icon: "💦", category: "Engine",
    costs: {
      "Standard": { low: 300, high: 600 },
      "With Timing Belt": { low: 500, high: 900 },
    },
    labor: "2–5 hrs",
    notes: "Often replaced simultaneously with timing belt since access requires similar disassembly.",
  },
  "Head Gasket": {
    icon: "🔩", category: "Engine",
    costs: { "Standard": { low: 1200, high: 2800 } },
    labor: "8–16 hrs",
    notes: "One of the more expensive repairs. Signs include white exhaust smoke or milky oil.",
  },
  "Valve Cover Gasket": {
    icon: "🔩", category: "Engine",
    costs: {
      "4-cylinder": { low: 150, high: 300 },
      "V6/V8": { low: 250, high: 500 },
    },
    labor: "1–3 hrs",
    notes: "Oil leaks near the top of the engine are a common symptom. Often causes burning oil smell.",
  },
  "Intake Manifold Gasket": {
    icon: "🔩", category: "Engine",
    costs: { "Standard": { low: 300, high: 600 } },
    labor: "2–4 hrs",
    notes: "Coolant or vacuum leaks often indicate this gasket is failing.",
  },
  "PCV Valve": {
    icon: "🔧", category: "Engine",
    costs: { "Standard": { low: 40, high: 90 } },
    labor: "0.25–0.5 hr",
    notes: "Cheap and often overlooked. A clogged PCV can cause rough idle and oil leaks.",
  },

  // ── ELECTRICAL ────────────────────────────────────────────────────────────
  "Battery Replacement": {
    icon: "🔋", category: "Electrical",
    costs: {
      "Standard": { low: 200, high: 350 },
      "AGM/Premium": { low: 300, high: 500 },
    },
    labor: "0.5 hr",
    notes: "Battery prices have risen sharply. Some vehicles require computer reset after replacement.",
  },
  "Alternator": {
    icon: "⚡", category: "Electrical",
    costs: {
      "Remanufactured": { low: 400, high: 650 },
      "OEM New": { low: 600, high: 1000 },
    },
    labor: "2–4 hrs",
    notes: "Labor varies by vehicle. Some require engine removal — add $200–$400.",
  },
  "Starter Motor": {
    icon: "🔑", category: "Electrical",
    costs: {
      "Remanufactured": { low: 250, high: 450 },
      "OEM New": { low: 350, high: 650 },
    },
    labor: "1–3 hrs",
    notes: "Clicking sounds when turning the key are a common symptom of a failing starter.",
  },
  "Fuse Replacement": {
    icon: "⚡", category: "Electrical",
    costs: { "Standard": { low: 20, high: 60 } },
    labor: "0.25 hr",
    notes: "Often DIY-friendly. Fuse box locations vary — check your owner's manual.",
  },
  "Oxygen Sensor": {
    icon: "📡", category: "Electrical",
    costs: {
      "Single sensor": { low: 150, high: 300 },
      "All sensors (4-cyl)": { low: 300, high: 600 },
    },
    labor: "0.5–1 hr each",
    notes: "Check engine light (P0130–P0167 codes) is the most common trigger. Affects fuel economy.",
  },
  "Mass Air Flow Sensor": {
    icon: "💨", category: "Electrical",
    costs: { "Standard": { low: 150, high: 350 } },
    labor: "0.5–1 hr",
    notes: "Often cleanable with MAF cleaner spray before replacing. Try that first.",
  },
  "Ignition Coil": {
    icon: "⚡", category: "Electrical",
    costs: {
      "Single coil": { low: 100, high: 250 },
      "Full set (4-cyl)": { low: 300, high: 600 },
    },
    labor: "0.5–1.5 hrs",
    notes: "Misfires and rough idle are the main symptoms. Often replaced with spark plugs.",
  },

  // ── SUSPENSION & STEERING ─────────────────────────────────────────────────
  "Wheel Alignment": {
    icon: "🎯", category: "Suspension",
    costs: {
      "2-Wheel": { low: 100, high: 150 },
      "4-Wheel": { low: 175, high: 275 },
    },
    labor: "1 hr",
    notes: "Recommended after new tires, hitting a curb, or if car pulls to one side.",
  },
  "Shock Absorbers (pair)": {
    icon: "🏎️", category: "Suspension",
    costs: {
      "Economy": { low: 200, high: 400 },
      "OEM/Performance": { low: 350, high: 700 },
    },
    labor: "1–3 hrs",
    notes: "Replaced in pairs per axle. Bounce test: if car bounces more than once, shocks may be worn.",
  },
  "Strut Assembly (pair)": {
    icon: "🏎️", category: "Suspension",
    costs: {
      "Economy": { low: 300, high: 600 },
      "OEM": { low: 500, high: 1000 },
    },
    labor: "2–4 hrs",
    notes: "Quick-strut assemblies cost more but save labor. Alignment required after replacement.",
  },
  "Sway Bar Links": {
    icon: "🔗", category: "Suspension",
    costs: { "Per side": { low: 80, high: 160 } },
    labor: "0.5–1 hr",
    notes: "Clunking over bumps is the main symptom. Usually replaced in pairs.",
  },
  "Ball Joint": {
    icon: "⚙️", category: "Suspension",
    costs: {
      "Per joint": { low: 150, high: 350 },
      "Both sides": { low: 280, high: 650 },
    },
    labor: "1–3 hrs",
    notes: "Worn ball joints cause wandering steering and clunking. Alignment required after.",
  },
  "Power Steering Fluid Flush": {
    icon: "🔄", category: "Suspension",
    costs: { "Standard": { low: 80, high: 150 } },
    labor: "0.5 hr",
    notes: "Not all vehicles have hydraulic power steering — electric systems don't need this service.",
  },
  "Tie Rod End": {
    icon: "🔩", category: "Suspension",
    costs: {
      "Inner or outer (each)": { low: 100, high: 250 },
      "Both sides": { low: 200, high: 450 },
    },
    labor: "1–2 hrs",
    notes: "Alignment is required after any tie rod replacement. Loose steering is a key symptom.",
  },

  // ── DRIVETRAIN ────────────────────────────────────────────────────────────
  "Transmission Fluid": {
    icon: "🔩", category: "Drivetrain",
    costs: {
      "Drain & Fill": { low: 80, high: 150 },
      "Full Flush": { low: 150, high: 250 },
    },
    labor: "0.5–1 hr",
    notes: "CVT fluid services typically run 20–30% higher.",
  },
  "CV Axle/Halfshaft": {
    icon: "🔗", category: "Drivetrain",
    costs: {
      "Remanufactured (each)": { low: 200, high: 400 },
      "OEM New (each)": { low: 350, high: 650 },
    },
    labor: "1–3 hrs",
    notes: "Clicking sounds during turns or vibration under acceleration are key symptoms.",
  },
  "Differential Fluid": {
    icon: "⚙️", category: "Drivetrain",
    costs: {
      "Front or rear": { low: 80, high: 150 },
      "Front + rear": { low: 150, high: 280 },
    },
    labor: "0.5–1 hr",
    notes: "AWD and 4WD vehicles often have multiple differentials. Check your service schedule.",
  },
  "Transfer Case Service": {
    icon: "🔩", category: "Drivetrain",
    costs: { "Standard": { low: 100, high: 200 } },
    labor: "0.5–1 hr",
    notes: "Applies to 4WD and AWD vehicles only. Often overlooked in routine maintenance.",
  },
  "Clutch Replacement": {
    icon: "🦶", category: "Drivetrain",
    costs: {
      "Economy": { low: 600, high: 1000 },
      "OEM/Performance": { low: 900, high: 1800 },
    },
    labor: "4–8 hrs",
    notes: "Manual transmission only. Slipping, burning smell, or difficulty shifting are symptoms.",
  },

  // ── HVAC ─────────────────────────────────────────────────────────────────
  "AC Recharge": {
    icon: "❄️", category: "HVAC",
    costs: {
      "Standard R-134a": { low: 150, high: 300 },
      "R-1234yf (newer cars)": { low: 250, high: 500 },
    },
    labor: "1 hr",
    notes: "If a leak is present, expect additional $200–$800+ for repair. Leak test recommended.",
  },
  "AC Compressor": {
    icon: "❄️", category: "HVAC",
    costs: {
      "Remanufactured": { low: 500, high: 900 },
      "OEM New": { low: 800, high: 1500 },
    },
    labor: "2–4 hrs",
    notes: "System must be evacuated and recharged after replacement. Often includes receiver/dryer.",
  },
  "Heater Core": {
    icon: "🔥", category: "HVAC",
    costs: { "Standard": { low: 600, high: 1200 } },
    labor: "5–10 hrs",
    notes: "Labor-intensive — requires dashboard removal on most vehicles. Foggy windshield or sweet smell are signs.",
  },
  "Blend Door Actuator": {
    icon: "🌡️", category: "HVAC",
    costs: { "Standard": { low: 150, high: 350 } },
    labor: "1–3 hrs",
    notes: "Clicking from the dash or stuck temperature control are the main symptoms.",
  },
};

// Regional labor cost index by ZIP prefix
const regionData = {
  "100": { name: "New York City, NY", multiplier: 1.42, label: "High Cost" },
  "101": { name: "New York City, NY", multiplier: 1.42, label: "High Cost" },
  "902": { name: "Los Angeles, CA",   multiplier: 1.38, label: "High Cost" },
  "900": { name: "Los Angeles, CA",   multiplier: 1.38, label: "High Cost" },
  "941": { name: "San Francisco, CA", multiplier: 1.55, label: "Very High Cost" },
  "940": { name: "San Francisco, CA", multiplier: 1.55, label: "Very High Cost" },
  "606": { name: "Chicago, IL",       multiplier: 1.18, label: "Above Average" },
  "770": { name: "Houston, TX",       multiplier: 0.92, label: "Below Average" },
  "733": { name: "Dallas, TX",        multiplier: 0.95, label: "Below Average" },
  "852": { name: "Phoenix, AZ",       multiplier: 0.97, label: "Average" },
  "980": { name: "Seattle, WA",       multiplier: 1.28, label: "Above Average" },
  "303": { name: "Denver, CO",        multiplier: 1.08, label: "Average" },
  "021": { name: "Boston, MA",        multiplier: 1.35, label: "High Cost" },
  "191": { name: "Philadelphia, PA",  multiplier: 1.15, label: "Above Average" },
  "192": { name: "Philadelphia, PA",  multiplier: 1.15, label: "Above Average" },
  "193": { name: "Chester County, PA",multiplier: 1.12, label: "Above Average" },
  "198": { name: "Wilmington, DE",    multiplier: 1.05, label: "Average" },
  "197": { name: "Newark, DE",        multiplier: 1.03, label: "Average" },
  "300": { name: "Atlanta, GA",       multiplier: 0.98, label: "Average" },
  "331": { name: "Miami, FL",         multiplier: 1.12, label: "Above Average" },
  "481": { name: "Detroit, MI",       multiplier: 1.02, label: "Average" },
  "972": { name: "Portland, OR",      multiplier: 1.20, label: "Above Average" },
  "891": { name: "Las Vegas, NV",     multiplier: 1.00, label: "Average" },
};

const getRegion = (zip) => {
  if (!zip || zip.length < 3) return null;
  return regionData[zip.slice(0, 3)] || regionData[zip.slice(0, 2) + "0"] || null;
};

// Mock shop data — mirrors Google Places API shape exactly.
// TO GO LIVE: Replace getMockShops() with a call to your backend:
//   const res = await fetch(`/api/shops?zip=${zip}&repair=${encodeURIComponent(repairName)}`);
//   return await res.json();
const getMockShops = (zip, repairName) => {
  const region = getRegion(zip);
  const city = region ? region.name.split(",")[0] : `${zip} area`;
  const keyword = repairName.split(" ")[0];
  return [
    { place_id: "m1", name: `${city} Auto Care`, vicinity: `1420 Main St, ${city}`, rating: 4.7, user_ratings_total: 312, open_now: true,  affiliate_url: "#" },
    { place_id: "m2", name: `Precision ${keyword} Specialists`, vicinity: `887 Industrial Blvd, ${city}`, rating: 4.4, user_ratings_total: 189, open_now: false, affiliate_url: "#" },
    { place_id: "m3", name: `Honest Wrench Auto`, vicinity: `203 Oak Ave, ${city}`, rating: 4.9, user_ratings_total: 541, open_now: true,  affiliate_url: "#" },
    { place_id: "m4", name: `QuickLane Service Center`, vicinity: `55 Commerce Dr, ${city}`, rating: 4.2, user_ratings_total: 98,  open_now: true,  affiliate_url: "#" },
  ];
};

const makes = ["Any Make","Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","GMC","Honda","Hyundai","Infiniti","Jeep","Kia","Lexus","Lincoln","Mazda","Mercedes-Benz","Mitsubishi","Nissan","RAM","Subaru","Tesla","Toyota","Volkswagen","Volvo"];
const makeMultipliers = {"Any Make":1,"Acura":1.15,"Audi":1.35,"BMW":1.45,"Buick":1.05,"Cadillac":1.2,"Chevrolet":0.95,"Chrysler":0.95,"Dodge":0.95,"Ford":0.95,"GMC":0.95,"Honda":1,"Hyundai":0.95,"Infiniti":1.2,"Jeep":1,"Kia":0.9,"Lexus":1.2,"Lincoln":1.15,"Mazda":1,"Mercedes-Benz":1.55,"Mitsubishi":0.95,"Nissan":1,"RAM":0.95,"Subaru":1.05,"Tesla":1.5,"Toyota":1.05,"Volkswagen":1.2,"Volvo":1.3};
const categories = ["All", ...new Set(Object.values(repairData).map(r => r.category))];
const catColor = c => ({"Maintenance":"#22c55e","Brakes":"#ef4444","Electrical":"#f59e0b","Drivetrain":"#8b5cf6","Engine":"#f97316","HVAC":"#06b6d4","Suspension":"#3b82f6"}[c] || "#6b7280");
const labelColor = l => ({"Very High Cost":"#ef4444","High Cost":"#f97316","Above Average":"#f59e0b","Average":"#22c55e","Below Average":"#06b6d4"}[l] || "#888");

const Stars = ({ rating }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return <span style={{ color:"#c9a84c", fontSize:"13px" }}>
    {"★".repeat(full)}{half?"½":""}{" "}{"☆".repeat(5-full-(half?1:0))}
    <span style={{ color:"#555", marginLeft:"5px" }}>{rating.toFixed(1)}</span>
  </span>;
};

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function RepairIQ() {
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("All");
  const [make, setMake]                   = useState("Any Make");
  const [zipInput, setZipInput]           = useState("");
  const [zip, setZip]                     = useState("");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [shops, setShops]                 = useState([]);
  const [loadingShops, setLoadingShops]   = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const region    = getRegion(zip);
  const makeMult  = makeMultipliers[make] || 1;
  const regMult   = region ? region.multiplier : 1;
  const totalMult = makeMult * regMult;
  const adj = v => Math.round(v * totalMult);

  const handleZip = e => {
    e.preventDefault();
    if (/^\d{5}$/.test(zipInput)) { setZip(zipInput); setShops([]); setSelectedRepair(null); }
  };

  const handleCard = name => {
    if (selectedRepair === name) { setSelectedRepair(null); setShops([]); return; }
    setSelectedRepair(name);
    if (zip.length === 5) {
      setLoadingShops(true);
      // Swap this setTimeout for a real fetch() once you have a backend
      setTimeout(() => { setShops(getMockShops(zip, name)); setLoadingShops(false); }, 800);
    }
  };

  const filtered = useMemo(() =>
    Object.entries(repairData).filter(([n, d]) =>
      n.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || d.category === category)
    ), [search, category]);

  return (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:"#0f0f0f", minHeight:"100vh", color:"#f0ede6" }}>



      {/* Header */}
      <header style={{ maxWidth:"900px", margin:"0 auto", padding:"40px 24px 28px", borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"6px" }}>Repair Cost Intelligence</div>
        <h1 style={{ fontSize:"clamp(36px,6vw,56px)", fontWeight:"400", margin:"0 0 8px", lineHeight:1, letterSpacing:"-0.02em" }}>
          Repair<span style={{ color:"#c9a84c", fontStyle:"italic" }}>IQ</span>
        </h1>
        <p style={{ color:"#555", fontSize:"14px", margin:0, fontStyle:"italic" }}>Real-world cost ranges — adjusted for your location &amp; vehicle.</p>
      </header>

      {/* Controls */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"24px 24px 0" }}>

        {/* ZIP row */}
        <form onSubmit={handleZip} style={{ display:"flex", gap:"10px", marginBottom:"12px", alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", fontSize:"14px" }}>📍</span>
            <input maxLength={5} placeholder="ZIP code" value={zipInput}
              onChange={e => setZipInput(e.target.value.replace(/\D/g,""))}
              style={{ ...IS, paddingLeft:"32px", width:"140px" }} />
          </div>
          <button type="submit" style={{ background:"#c9a84c", color:"#0f0f0f", border:"none", borderRadius:"6px", padding:"11px 18px", fontSize:"12px", fontWeight:"700", fontFamily:"inherit", cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Set Location
          </button>
          {zip && (
            <button onClick={() => { setZip(""); setZipInput(""); setShops([]); }} style={{ background:"transparent", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"10px 14px", fontSize:"12px", color:"#555", fontFamily:"inherit", cursor:"pointer" }}>
              Clear
            </button>
          )}
        </form>

        {/* Region banner */}
        {zip && (
          <div style={{ background:"#111", border:`1px solid ${region ? labelColor(region.label)+"33" : "#222"}`, borderLeft:`3px solid ${region ? labelColor(region.label) : "#333"}`, borderRadius:"6px", padding:"10px 16px", marginBottom:"12px", display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap" }}>
            {region ? (
              <>
                <span style={{ fontSize:"13px", color:"#bbb" }}>📍 <strong style={{ color:"#f0ede6" }}>{region.name}</strong></span>
                <span style={{ fontSize:"11px", color:labelColor(region.label), background:labelColor(region.label)+"18", padding:"2px 10px", borderRadius:"20px" }}>{region.label}</span>
                <span style={{ fontSize:"12px", color:"#555" }}>Labor index: <span style={{ color:labelColor(region.label) }}>{region.multiplier>1?"+":""}{Math.round((region.multiplier-1)*100)}% vs national avg</span></span>
              </>
            ) : (
              <span style={{ fontSize:"13px", color:"#555", fontStyle:"italic" }}>ZIP {zip} — no regional data yet, showing national averages</span>
            )}
          </div>
        )}

        {/* Search + Make + Category */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"10px" }}>
          <input placeholder="Search repairs…" value={search} onChange={e => setSearch(e.target.value)} style={IS} />
          <select value={make} onChange={e => setMake(e.target.value)} style={IS}>
            {makes.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} style={IS}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Combined modifier callout */}
        {(make !== "Any Make" || zip) && (
          <div style={{ marginTop:"10px", background:"#1a1a0a", border:"1px solid #3a3010", borderRadius:"6px", padding:"9px 14px", fontSize:"12px", color:"#c9a84c" }}>
            📊 Estimates adjusted for{make !== "Any Make" ? ` ${make}` : ""}{zip && region ? ` + ${region.name.split(",")[0]} labor rates` : ""} — total modifier: {totalMult>1?"+":""}{Math.round((totalMult-1)*100)}%
          </div>
        )}
      </div>

      {/* Cards grid */}
      <main style={{ maxWidth:"900px", margin:"20px auto", padding:"0 24px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"14px" }}>
        {filtered.map(([name, data]) => {
          const tiers     = Object.entries(data.costs);
          const loLow     = adj(Math.min(...tiers.map(([,v]) => v.low)));
          const hiHigh    = adj(Math.max(...tiers.map(([,v]) => v.high)));
          const cc        = catColor(data.category);
          const isSel     = selectedRepair === name;

          return (
            <div key={name} onClick={() => handleCard(name)} style={{ background:isSel?"#1a1a12":"#161616", border:`1px solid ${isSel?"#c9a84c44":"#1e1e1e"}`, borderRadius:"10px", padding:"20px", cursor:"pointer", transition:"border-color 0.2s", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:cc, opacity:0.7 }} />

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"20px", marginBottom:"4px" }}>{data.icon}</div>
                  <div style={{ fontWeight:"600", fontSize:"15px", letterSpacing:"-0.01em" }}>{name}</div>
                </div>
                <span style={{ fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cc, background:`${cc}18`, padding:"3px 8px", borderRadius:"20px", whiteSpace:"nowrap" }}>{data.category}</span>
              </div>

              <div style={{ fontSize:"22px", fontWeight:"300", letterSpacing:"-0.02em", marginBottom:"4px" }}>
                ${loLow.toLocaleString()} – ${hiHigh.toLocaleString()}
              </div>
              <div style={{ fontSize:"12px", color:"#444" }}>⏱ {data.labor}</div>

              {isSel && (
                <div style={{ marginTop:"16px", borderTop:"1px solid #1e1e1e", paddingTop:"16px" }}>

                  {/* Tier breakdown */}
                  <div style={{ fontSize:"11px", color:"#555", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.08em" }}>By Service Tier</div>
                  {tiers.map(([tier, vals]) => (
                    <div key={tier} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #1a1a1a", fontSize:"13px" }}>
                      <span style={{ color:"#888" }}>{tier}</span>
                      <span style={{ color:"#c9a84c" }}>${adj(vals.low).toLocaleString()} – ${adj(vals.high).toLocaleString()}</span>
                    </div>
                  ))}

                  <div style={{ marginTop:"12px", background:"#111", borderRadius:"6px", padding:"10px 12px", fontSize:"12px", color:"#555", lineHeight:"1.6", fontStyle:"italic" }}>
                    💡 {data.notes}
                  </div>

                  {/* Nearby shops */}
                  <div style={{ marginTop:"18px" }}>
                    <div style={{ fontSize:"11px", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
                      {zip ? `Shops Near ${zip}` : "Nearby Shops"}
                    </div>

                    {!zip ? (
                      <div style={{ background:"#111", border:"1px dashed #222", borderRadius:"6px", padding:"16px", textAlign:"center", fontSize:"12px", color:"#444" }}>
                        📍 Enter your ZIP above to see nearby shops
                      </div>
                    ) : loadingShops ? (
                      <div style={{ textAlign:"center", padding:"20px", color:"#444", fontSize:"13px" }}>
                        🔍 Finding shops near you…
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {shops.map(shop => (
                          <a key={shop.place_id} href={shop.affiliate_url} onClick={e => e.stopPropagation()}
                            style={{ display:"block", background:"#111", border:"1px solid #1e1e1e", borderRadius:"8px", padding:"12px 14px", textDecoration:"none", color:"inherit" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                              <div>
                                <div style={{ fontSize:"13px", fontWeight:"600", color:"#f0ede6", marginBottom:"2px" }}>{shop.name}</div>
                                <div style={{ fontSize:"11px", color:"#444", marginBottom:"5px" }}>{shop.vicinity}</div>
                                <Stars rating={shop.rating} />
                                <span style={{ fontSize:"11px", color:"#444", marginLeft:"6px" }}>({shop.user_ratings_total})</span>
                              </div>
                              <div style={{ textAlign:"right", flexShrink:0, marginLeft:"12px" }}>
                                <div style={{ fontSize:"10px", padding:"3px 8px", borderRadius:"20px", marginBottom:"6px", background:shop.open_now?"#22c55e18":"#ef444418", color:shop.open_now?"#22c55e":"#ef4444" }}>
                                  {shop.open_now ? "Open Now" : "Closed"}
                                </div>
                                <div style={{ fontSize:"11px", color:"#c9a84c" }}>Get Quote →</div>
                              </div>
                            </div>
                          </a>
                        ))}
                        <p style={{ fontSize:"10px", color:"#2a2a2a", margin:"4px 0 0", fontStyle:"italic" }}>
                          * Mock data — connect to Google Places API via backend to show real shops
                        </p>
                      </div>
                    )}
                  </div>

                  <button style={{ marginTop:"14px", width:"100%", background:"#c9a84c", color:"#0f0f0f", border:"none", borderRadius:"6px", padding:"10px", fontSize:"12px", fontWeight:"700", fontFamily:"inherit", cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    Get Free Quotes →
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"#333", fontStyle:"italic" }}>
            No repairs found for "{search}"
          </div>
        )}
      </main>

      {/* Submit form */}
      <div style={{ maxWidth:"900px", margin:"0 auto 40px", padding:"0 24px" }}>
        <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"28px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"8px" }}>Help the Community</div>
          <h2 style={{ fontSize:"20px", fontWeight:"400", margin:"0 0 8px", letterSpacing:"-0.02em" }}>Submit What You Paid</h2>
          <p style={{ color:"#444", fontSize:"13px", margin:"0 0 20px", fontStyle:"italic" }}>Real submissions keep our data accurate. All entries are anonymized.</p>
          {!submitted ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <input placeholder="Repair type" style={IS} />
              <input placeholder="Your vehicle (e.g. 2020 Subaru Outback)" style={IS} />
              <input placeholder="Total paid ($)" type="number" style={IS} />
              <input placeholder="ZIP code" style={IS} defaultValue={zip} />
              <button onClick={() => setSubmitted(true)} style={{ gridColumn:"1/-1", background:"transparent", border:"1px solid #c9a84c", color:"#c9a84c", borderRadius:"6px", padding:"11px", fontSize:"12px", fontFamily:"inherit", cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Submit My Data →
              </button>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"20px", color:"#22c55e", fontSize:"14px" }}>
              ✓ Thanks! Your submission helps other drivers get fair prices.
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop:"1px solid #1a1a1a", padding:"24px", textAlign:"center", fontSize:"11px", color:"#222", letterSpacing:"0.05em" }}>
        RepairIQ · Prototype v0.2 · Data is illustrative · Not affiliated with any repair facility
      </footer>

      <style>{`select option { background: #1a1a1a; }`}</style>
    </div>
  );
}

// Shared input style
const IS = {
  background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px",
  padding:"10px 14px", color:"#f0ede6", fontSize:"13px", outline:"none",
  fontFamily:"inherit", width:"100%", boxSizing:"border-box",
};
