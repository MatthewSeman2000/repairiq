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

// Regional labor cost index — full US ZIP prefix coverage
const regionData = {
  // ── NEW ENGLAND ──────────────────────────────────────────────────────────
  "010": { name: "Springfield, MA",       multiplier: 1.10, label: "Above Average" },
  "011": { name: "Springfield, MA",       multiplier: 1.10, label: "Above Average" },
  "012": { name: "Pittsfield, MA",        multiplier: 1.05, label: "Average" },
  "013": { name: "Greenfield, MA",        multiplier: 1.05, label: "Average" },
  "014": { name: "Fitchburg, MA",         multiplier: 1.08, label: "Average" },
  "015": { name: "Worcester, MA",         multiplier: 1.12, label: "Above Average" },
  "016": { name: "Worcester, MA",         multiplier: 1.12, label: "Above Average" },
  "017": { name: "Framingham, MA",        multiplier: 1.20, label: "Above Average" },
  "018": { name: "Lowell, MA",            multiplier: 1.18, label: "Above Average" },
  "019": { name: "Lynn, MA",              multiplier: 1.18, label: "Above Average" },
  "020": { name: "Boston, MA",            multiplier: 1.35, label: "High Cost" },
  "021": { name: "Boston, MA",            multiplier: 1.35, label: "High Cost" },
  "022": { name: "Boston, MA",            multiplier: 1.35, label: "High Cost" },
  "023": { name: "Brockton, MA",          multiplier: 1.15, label: "Above Average" },
  "024": { name: "Boston Suburbs, MA",    multiplier: 1.28, label: "Above Average" },
  "025": { name: "Cape Cod, MA",          multiplier: 1.18, label: "Above Average" },
  "026": { name: "Cape Cod, MA",          multiplier: 1.18, label: "Above Average" },
  "027": { name: "New Bedford, MA",       multiplier: 1.08, label: "Average" },
  "028": { name: "Providence, RI",        multiplier: 1.12, label: "Above Average" },
  "029": { name: "Providence, RI",        multiplier: 1.12, label: "Above Average" },
  "030": { name: "Manchester, NH",        multiplier: 1.08, label: "Average" },
  "031": { name: "Manchester, NH",        multiplier: 1.08, label: "Average" },
  "032": { name: "Concord, NH",           multiplier: 1.05, label: "Average" },
  "033": { name: "Concord, NH",           multiplier: 1.05, label: "Average" },
  "034": { name: "Keene, NH",             multiplier: 1.02, label: "Average" },
  "035": { name: "Littleton, NH",         multiplier: 1.00, label: "Average" },
  "036": { name: "Conway, NH",            multiplier: 1.00, label: "Average" },
  "037": { name: "Portsmouth, NH",        multiplier: 1.08, label: "Average" },
  "038": { name: "Portsmouth, NH",        multiplier: 1.08, label: "Average" },
  "039": { name: "Portsmouth, NH",        multiplier: 1.08, label: "Average" },
  "040": { name: "Portland, ME",          multiplier: 1.05, label: "Average" },
  "041": { name: "Portland, ME",          multiplier: 1.05, label: "Average" },
  "042": { name: "Lewiston, ME",          multiplier: 1.00, label: "Average" },
  "043": { name: "Augusta, ME",           multiplier: 0.98, label: "Average" },
  "044": { name: "Bangor, ME",            multiplier: 0.97, label: "Average" },
  "045": { name: "Bath, ME",              multiplier: 0.97, label: "Average" },
  "046": { name: "Rockland, ME",          multiplier: 0.95, label: "Below Average" },
  "047": { name: "Houlton, ME",           multiplier: 0.93, label: "Below Average" },
  "048": { name: "Rockland, ME",          multiplier: 0.95, label: "Below Average" },
  "049": { name: "Waterville, ME",        multiplier: 0.97, label: "Average" },
  "050": { name: "White River Jct, VT",   multiplier: 1.00, label: "Average" },
  "051": { name: "Bellows Falls, VT",     multiplier: 0.98, label: "Average" },
  "052": { name: "Bennington, VT",        multiplier: 0.98, label: "Average" },
  "053": { name: "Brattleboro, VT",       multiplier: 1.00, label: "Average" },
  "054": { name: "Burlington, VT",        multiplier: 1.05, label: "Average" },
  "056": { name: "Montpelier, VT",        multiplier: 1.02, label: "Average" },
  "057": { name: "Rutland, VT",           multiplier: 1.00, label: "Average" },
  "058": { name: "St. Johnsbury, VT",     multiplier: 0.97, label: "Average" },
  "059": { name: "Burlington, VT",        multiplier: 1.05, label: "Average" },
  "060": { name: "Hartford, CT",          multiplier: 1.18, label: "Above Average" },
  "061": { name: "Hartford, CT",          multiplier: 1.18, label: "Above Average" },
  "062": { name: "Hartford, CT",          multiplier: 1.18, label: "Above Average" },
  "063": { name: "New London, CT",        multiplier: 1.12, label: "Above Average" },
  "064": { name: "Meriden, CT",           multiplier: 1.15, label: "Above Average" },
  "065": { name: "New Haven, CT",         multiplier: 1.20, label: "Above Average" },
  "066": { name: "Bridgeport, CT",        multiplier: 1.25, label: "Above Average" },
  "067": { name: "Waterbury, CT",         multiplier: 1.18, label: "Above Average" },
  "068": { name: "Stamford, CT",          multiplier: 1.35, label: "High Cost" },
  "069": { name: "Stamford, CT",          multiplier: 1.35, label: "High Cost" },
  // ── NEW JERSEY ───────────────────────────────────────────────────────────
  "070": { name: "Newark, NJ",            multiplier: 1.25, label: "Above Average" },
  "071": { name: "Newark, NJ",            multiplier: 1.25, label: "Above Average" },
  "072": { name: "Elizabeth, NJ",         multiplier: 1.22, label: "Above Average" },
  "073": { name: "Jersey City, NJ",       multiplier: 1.28, label: "Above Average" },
  "074": { name: "Paterson, NJ",          multiplier: 1.20, label: "Above Average" },
  "075": { name: "Paterson, NJ",          multiplier: 1.20, label: "Above Average" },
  "076": { name: "Hackensack, NJ",        multiplier: 1.22, label: "Above Average" },
  "077": { name: "Jersey Shore, NJ",      multiplier: 1.18, label: "Above Average" },
  "078": { name: "Dover, NJ",             multiplier: 1.15, label: "Above Average" },
  "079": { name: "Summit, NJ",            multiplier: 1.25, label: "Above Average" },
  "080": { name: "South Jersey, NJ",      multiplier: 1.10, label: "Above Average" },
  "081": { name: "Camden, NJ",            multiplier: 1.10, label: "Above Average" },
  "082": { name: "Atlantic City, NJ",     multiplier: 1.08, label: "Average" },
  "083": { name: "Vineland, NJ",          multiplier: 1.05, label: "Average" },
  "084": { name: "Atlantic City, NJ",     multiplier: 1.08, label: "Average" },
  "085": { name: "Trenton, NJ",           multiplier: 1.15, label: "Above Average" },
  "086": { name: "Trenton, NJ",           multiplier: 1.15, label: "Above Average" },
  "087": { name: "New Brunswick, NJ",     multiplier: 1.18, label: "Above Average" },
  "088": { name: "New Brunswick, NJ",     multiplier: 1.18, label: "Above Average" },
  "089": { name: "New Brunswick, NJ",     multiplier: 1.18, label: "Above Average" },
  // ── NEW YORK ─────────────────────────────────────────────────────────────
  "100": { name: "New York City, NY",     multiplier: 1.42, label: "High Cost" },
  "101": { name: "New York City, NY",     multiplier: 1.42, label: "High Cost" },
  "102": { name: "New York City, NY",     multiplier: 1.42, label: "High Cost" },
  "103": { name: "Staten Island, NY",     multiplier: 1.35, label: "High Cost" },
  "104": { name: "Bronx, NY",             multiplier: 1.38, label: "High Cost" },
  "105": { name: "Yonkers, NY",           multiplier: 1.32, label: "High Cost" },
  "106": { name: "Westchester, NY",       multiplier: 1.32, label: "High Cost" },
  "107": { name: "Westchester, NY",       multiplier: 1.32, label: "High Cost" },
  "108": { name: "Westchester, NY",       multiplier: 1.30, label: "High Cost" },
  "109": { name: "Westchester, NY",       multiplier: 1.30, label: "High Cost" },
  "110": { name: "Queens, NY",            multiplier: 1.38, label: "High Cost" },
  "111": { name: "Queens, NY",            multiplier: 1.38, label: "High Cost" },
  "112": { name: "Brooklyn, NY",          multiplier: 1.38, label: "High Cost" },
  "113": { name: "Queens, NY",            multiplier: 1.38, label: "High Cost" },
  "114": { name: "Long Island, NY",       multiplier: 1.30, label: "High Cost" },
  "115": { name: "Long Island, NY",       multiplier: 1.30, label: "High Cost" },
  "116": { name: "Long Island, NY",       multiplier: 1.30, label: "High Cost" },
  "117": { name: "Long Island, NY",       multiplier: 1.30, label: "High Cost" },
  "118": { name: "Long Island, NY",       multiplier: 1.28, label: "Above Average" },
  "119": { name: "Long Island, NY",       multiplier: 1.28, label: "Above Average" },
  "120": { name: "Albany, NY",            multiplier: 1.08, label: "Average" },
  "121": { name: "Albany, NY",            multiplier: 1.08, label: "Average" },
  "122": { name: "Albany, NY",            multiplier: 1.08, label: "Average" },
  "123": { name: "Schenectady, NY",       multiplier: 1.05, label: "Average" },
  "124": { name: "Kingston, NY",          multiplier: 1.08, label: "Average" },
  "125": { name: "Poughkeepsie, NY",      multiplier: 1.12, label: "Above Average" },
  "126": { name: "Poughkeepsie, NY",      multiplier: 1.12, label: "Above Average" },
  "127": { name: "Poughkeepsie, NY",      multiplier: 1.10, label: "Above Average" },
  "128": { name: "Glens Falls, NY",       multiplier: 1.02, label: "Average" },
  "129": { name: "Plattsburgh, NY",       multiplier: 1.00, label: "Average" },
  "130": { name: "Syracuse, NY",          multiplier: 1.02, label: "Average" },
  "131": { name: "Syracuse, NY",          multiplier: 1.02, label: "Average" },
  "132": { name: "Syracuse, NY",          multiplier: 1.02, label: "Average" },
  "133": { name: "Utica, NY",             multiplier: 0.98, label: "Average" },
  "134": { name: "Utica, NY",             multiplier: 0.98, label: "Average" },
  "135": { name: "Utica, NY",             multiplier: 0.98, label: "Average" },
  "136": { name: "Watertown, NY",         multiplier: 0.97, label: "Average" },
  "137": { name: "Binghamton, NY",        multiplier: 0.97, label: "Average" },
  "138": { name: "Binghamton, NY",        multiplier: 0.97, label: "Average" },
  "139": { name: "Binghamton, NY",        multiplier: 0.97, label: "Average" },
  "140": { name: "Buffalo, NY",           multiplier: 1.02, label: "Average" },
  "141": { name: "Buffalo, NY",           multiplier: 1.02, label: "Average" },
  "142": { name: "Buffalo, NY",           multiplier: 1.02, label: "Average" },
  "143": { name: "Niagara Falls, NY",     multiplier: 0.98, label: "Average" },
  "144": { name: "Rochester, NY",         multiplier: 1.00, label: "Average" },
  "145": { name: "Rochester, NY",         multiplier: 1.00, label: "Average" },
  "146": { name: "Rochester, NY",         multiplier: 1.00, label: "Average" },
  "147": { name: "Jamestown, NY",         multiplier: 0.95, label: "Below Average" },
  "148": { name: "Ithaca, NY",            multiplier: 1.02, label: "Average" },
  "149": { name: "Elmira, NY",            multiplier: 0.97, label: "Average" },
  // ── PENNSYLVANIA ─────────────────────────────────────────────────────────
  "150": { name: "Pittsburgh, PA",        multiplier: 1.08, label: "Average" },
  "151": { name: "Pittsburgh, PA",        multiplier: 1.08, label: "Average" },
  "152": { name: "Pittsburgh, PA",        multiplier: 1.08, label: "Average" },
  "153": { name: "Washington, PA",        multiplier: 1.00, label: "Average" },
  "154": { name: "Uniontown, PA",         multiplier: 0.97, label: "Average" },
  "155": { name: "Johnstown, PA",         multiplier: 0.97, label: "Average" },
  "156": { name: "Greensburg, PA",        multiplier: 1.00, label: "Average" },
  "157": { name: "Indiana, PA",           multiplier: 0.95, label: "Below Average" },
  "158": { name: "DuBois, PA",            multiplier: 0.95, label: "Below Average" },
  "159": { name: "Johnstown, PA",         multiplier: 0.97, label: "Average" },
  "160": { name: "Butler, PA",            multiplier: 1.00, label: "Average" },
  "161": { name: "New Castle, PA",        multiplier: 0.97, label: "Average" },
  "162": { name: "Kittanning, PA",        multiplier: 0.97, label: "Average" },
  "163": { name: "Oil City, PA",          multiplier: 0.95, label: "Below Average" },
  "164": { name: "Erie, PA",              multiplier: 1.00, label: "Average" },
  "165": { name: "Erie, PA",              multiplier: 1.00, label: "Average" },
  "166": { name: "Altoona, PA",           multiplier: 0.97, label: "Average" },
  "167": { name: "Bradford, PA",          multiplier: 0.95, label: "Below Average" },
  "168": { name: "State College, PA",     multiplier: 1.02, label: "Average" },
  "169": { name: "Wellsboro, PA",         multiplier: 0.95, label: "Below Average" },
  "170": { name: "Harrisburg, PA",        multiplier: 1.05, label: "Average" },
  "171": { name: "Harrisburg, PA",        multiplier: 1.05, label: "Average" },
  "172": { name: "Chambersburg, PA",      multiplier: 1.00, label: "Average" },
  "173": { name: "York, PA",              multiplier: 1.00, label: "Average" },
  "174": { name: "York, PA",              multiplier: 1.00, label: "Average" },
  "175": { name: "Lancaster, PA",         multiplier: 1.02, label: "Average" },
  "176": { name: "Lancaster, PA",         multiplier: 1.02, label: "Average" },
  "177": { name: "Williamsport, PA",      multiplier: 0.98, label: "Average" },
  "178": { name: "Sunbury, PA",           multiplier: 0.97, label: "Average" },
  "179": { name: "Pottsville, PA",        multiplier: 0.98, label: "Average" },
  "180": { name: "Lehigh Valley, PA",     multiplier: 1.05, label: "Average" },
  "181": { name: "Allentown, PA",         multiplier: 1.05, label: "Average" },
  "182": { name: "Hazleton, PA",          multiplier: 0.98, label: "Average" },
  "183": { name: "Stroudsburg, PA",       multiplier: 1.05, label: "Average" },
  "184": { name: "Scranton, PA",          multiplier: 1.00, label: "Average" },
  "185": { name: "Scranton, PA",          multiplier: 1.00, label: "Average" },
  "186": { name: "Wilkes-Barre, PA",      multiplier: 0.98, label: "Average" },
  "187": { name: "Wilkes-Barre, PA",      multiplier: 0.98, label: "Average" },
  "188": { name: "Montrose, PA",          multiplier: 0.97, label: "Average" },
  "189": { name: "Doylestown, PA",        multiplier: 1.12, label: "Above Average" },
  "190": { name: "Philadelphia, PA",      multiplier: 1.15, label: "Above Average" },
  "191": { name: "Philadelphia, PA",      multiplier: 1.15, label: "Above Average" },
  "192": { name: "Philadelphia, PA",      multiplier: 1.15, label: "Above Average" },
  "193": { name: "Chester County, PA",    multiplier: 1.12, label: "Above Average" },
  "194": { name: "Montgomery County, PA", multiplier: 1.12, label: "Above Average" },
  "195": { name: "Reading, PA",           multiplier: 1.02, label: "Average" },
  "196": { name: "Reading, PA",           multiplier: 1.02, label: "Average" },
  // ── DELAWARE / MARYLAND / DC ─────────────────────────────────────────────
  "197": { name: "Newark, DE",            multiplier: 1.03, label: "Average" },
  "198": { name: "Wilmington, DE",        multiplier: 1.05, label: "Average" },
  "199": { name: "Dover, DE",             multiplier: 1.00, label: "Average" },
  "200": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "201": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "202": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "203": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "204": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "205": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "206": { name: "Washington, DC",        multiplier: 1.35, label: "High Cost" },
  "207": { name: "College Park, MD",      multiplier: 1.20, label: "Above Average" },
  "208": { name: "Bethesda, MD",          multiplier: 1.28, label: "Above Average" },
  "209": { name: "Silver Spring, MD",     multiplier: 1.22, label: "Above Average" },
  "210": { name: "Baltimore, MD",         multiplier: 1.12, label: "Above Average" },
  "211": { name: "Baltimore, MD",         multiplier: 1.12, label: "Above Average" },
  "212": { name: "Baltimore, MD",         multiplier: 1.12, label: "Above Average" },
  "213": { name: "Cumberland, MD",        multiplier: 0.98, label: "Average" },
  "214": { name: "Annapolis, MD",         multiplier: 1.15, label: "Above Average" },
  "215": { name: "Frederick, MD",         multiplier: 1.08, label: "Average" },
  "216": { name: "Easton, MD",            multiplier: 1.00, label: "Average" },
  "217": { name: "Hagerstown, MD",        multiplier: 1.00, label: "Average" },
  "218": { name: "Salisbury, MD",         multiplier: 0.98, label: "Average" },
  "219": { name: "Baltimore Suburbs, MD", multiplier: 1.10, label: "Above Average" },
  // ── VIRGINIA ─────────────────────────────────────────────────────────────
  "220": { name: "Northern Virginia",     multiplier: 1.28, label: "Above Average" },
  "221": { name: "Northern Virginia",     multiplier: 1.28, label: "Above Average" },
  "222": { name: "Arlington, VA",         multiplier: 1.30, label: "High Cost" },
  "223": { name: "Alexandria, VA",        multiplier: 1.28, label: "Above Average" },
  "224": { name: "Fredericksburg, VA",    multiplier: 1.10, label: "Above Average" },
  "225": { name: "Fredericksburg, VA",    multiplier: 1.10, label: "Above Average" },
  "226": { name: "Winchester, VA",        multiplier: 1.02, label: "Average" },
  "227": { name: "Culpeper, VA",          multiplier: 1.00, label: "Average" },
  "228": { name: "Harrisonburg, VA",      multiplier: 0.98, label: "Average" },
  "229": { name: "Charlottesville, VA",   multiplier: 1.05, label: "Average" },
  "230": { name: "Richmond, VA",          multiplier: 1.02, label: "Average" },
  "231": { name: "Richmond, VA",          multiplier: 1.02, label: "Average" },
  "232": { name: "Richmond, VA",          multiplier: 1.02, label: "Average" },
  "233": { name: "Norfolk, VA",           multiplier: 1.05, label: "Average" },
  "234": { name: "Norfolk, VA",           multiplier: 1.05, label: "Average" },
  "235": { name: "Norfolk, VA",           multiplier: 1.05, label: "Average" },
  "236": { name: "Norfolk, VA",           multiplier: 1.05, label: "Average" },
  "237": { name: "Portsmouth, VA",        multiplier: 1.02, label: "Average" },
  "238": { name: "Petersburg, VA",        multiplier: 0.98, label: "Average" },
  "239": { name: "Farmville, VA",         multiplier: 0.95, label: "Below Average" },
  "240": { name: "Roanoke, VA",           multiplier: 0.97, label: "Average" },
  "241": { name: "Roanoke, VA",           multiplier: 0.97, label: "Average" },
  "242": { name: "Bristol, VA",           multiplier: 0.92, label: "Below Average" },
  "243": { name: "Blacksburg, VA",        multiplier: 0.97, label: "Average" },
  "244": { name: "Staunton, VA",          multiplier: 0.97, label: "Average" },
  "245": { name: "Lynchburg, VA",         multiplier: 0.97, label: "Average" },
  "246": { name: "Bluefield, VA",         multiplier: 0.90, label: "Below Average" },
  // ── WEST VIRGINIA ────────────────────────────────────────────────────────
  "247": { name: "Bluefield, WV",         multiplier: 0.88, label: "Below Average" },
  "248": { name: "Bluefield, WV",         multiplier: 0.88, label: "Below Average" },
  "249": { name: "Lewisburg, WV",         multiplier: 0.88, label: "Below Average" },
  "250": { name: "Charleston, WV",        multiplier: 0.90, label: "Below Average" },
  "251": { name: "Charleston, WV",        multiplier: 0.90, label: "Below Average" },
  "252": { name: "Charleston, WV",        multiplier: 0.90, label: "Below Average" },
  "253": { name: "Charleston, WV",        multiplier: 0.90, label: "Below Average" },
  "254": { name: "Martinsburg, WV",       multiplier: 0.92, label: "Below Average" },
  "255": { name: "Huntington, WV",        multiplier: 0.88, label: "Below Average" },
  "256": { name: "Huntington, WV",        multiplier: 0.88, label: "Below Average" },
  "257": { name: "Huntington, WV",        multiplier: 0.88, label: "Below Average" },
  "258": { name: "Beckley, WV",           multiplier: 0.87, label: "Below Average" },
  "259": { name: "Beckley, WV",           multiplier: 0.87, label: "Below Average" },
  "260": { name: "Wheeling, WV",          multiplier: 0.90, label: "Below Average" },
  "261": { name: "Wheeling, WV",          multiplier: 0.90, label: "Below Average" },
  "262": { name: "Wheeling, WV",          multiplier: 0.90, label: "Below Average" },
  "263": { name: "Clarksburg, WV",        multiplier: 0.88, label: "Below Average" },
  "264": { name: "Clarksburg, WV",        multiplier: 0.88, label: "Below Average" },
  "265": { name: "Clarksburg, WV",        multiplier: 0.88, label: "Below Average" },
  "266": { name: "Gassaway, WV",          multiplier: 0.87, label: "Below Average" },
  "267": { name: "Romney, WV",            multiplier: 0.87, label: "Below Average" },
  "268": { name: "Petersburg, WV",        multiplier: 0.87, label: "Below Average" },
  // ── NORTH CAROLINA ───────────────────────────────────────────────────────
  "270": { name: "Greensboro, NC",        multiplier: 0.97, label: "Average" },
  "271": { name: "Greensboro, NC",        multiplier: 0.97, label: "Average" },
  "272": { name: "Raleigh, NC",           multiplier: 0.97, label: "Average" },
  "273": { name: "Durham, NC",            multiplier: 0.97, label: "Average" },
  "274": { name: "Durham, NC",            multiplier: 0.97, label: "Average" },
  "275": { name: "Raleigh, NC",           multiplier: 0.98, label: "Average" },
  "276": { name: "Raleigh, NC",           multiplier: 0.98, label: "Average" },
  "277": { name: "Durham, NC",            multiplier: 0.97, label: "Average" },
  "278": { name: "Rocky Mount, NC",       multiplier: 0.93, label: "Below Average" },
  "279": { name: "Elizabeth City, NC",    multiplier: 0.92, label: "Below Average" },
  "280": { name: "Winston-Salem, NC",     multiplier: 0.97, label: "Average" },
  "281": { name: "Winston-Salem, NC",     multiplier: 0.97, label: "Average" },
  "282": { name: "Charlotte, NC",         multiplier: 1.00, label: "Average" },
  "283": { name: "Fayetteville, NC",      multiplier: 0.93, label: "Below Average" },
  "284": { name: "Fayetteville, NC",      multiplier: 0.93, label: "Below Average" },
  "285": { name: "Kinston, NC",           multiplier: 0.92, label: "Below Average" },
  "286": { name: "Hickory, NC",           multiplier: 0.95, label: "Below Average" },
  "287": { name: "Asheville, NC",         multiplier: 0.98, label: "Average" },
  "288": { name: "Gastonia, NC",          multiplier: 0.97, label: "Average" },
  "289": { name: "Wilmington, NC",        multiplier: 0.97, label: "Average" },
  // ── SOUTH CAROLINA ───────────────────────────────────────────────────────
  "290": { name: "Columbia, SC",          multiplier: 0.93, label: "Below Average" },
  "291": { name: "Columbia, SC",          multiplier: 0.93, label: "Below Average" },
  "292": { name: "Columbia, SC",          multiplier: 0.93, label: "Below Average" },
  "293": { name: "Spartanburg, SC",       multiplier: 0.92, label: "Below Average" },
  "294": { name: "Charleston, SC",        multiplier: 0.97, label: "Average" },
  "295": { name: "Florence, SC",          multiplier: 0.90, label: "Below Average" },
  "296": { name: "Greenville, SC",        multiplier: 0.93, label: "Below Average" },
  "297": { name: "Rock Hill, SC",         multiplier: 0.93, label: "Below Average" },
  "298": { name: "Aiken, SC",             multiplier: 0.92, label: "Below Average" },
  "299": { name: "Beaufort, SC",          multiplier: 0.95, label: "Below Average" },
  // ── GEORGIA ──────────────────────────────────────────────────────────────
  "300": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "301": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "302": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "303": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "304": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "305": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "306": { name: "Atlanta, GA",           multiplier: 0.98, label: "Average" },
  "307": { name: "Chattanooga area, GA",  multiplier: 0.92, label: "Below Average" },
  "308": { name: "Augusta, GA",           multiplier: 0.93, label: "Below Average" },
  "309": { name: "Augusta, GA",           multiplier: 0.93, label: "Below Average" },
  "310": { name: "Macon, GA",             multiplier: 0.92, label: "Below Average" },
  "311": { name: "Macon, GA",             multiplier: 0.92, label: "Below Average" },
  "312": { name: "Macon, GA",             multiplier: 0.92, label: "Below Average" },
  "313": { name: "Savannah, GA",          multiplier: 0.95, label: "Below Average" },
  "314": { name: "Savannah, GA",          multiplier: 0.95, label: "Below Average" },
  "315": { name: "Waycross, GA",          multiplier: 0.88, label: "Below Average" },
  "316": { name: "Valdosta, GA",          multiplier: 0.88, label: "Below Average" },
  "317": { name: "Albany, GA",            multiplier: 0.88, label: "Below Average" },
  "318": { name: "Columbus, GA",          multiplier: 0.90, label: "Below Average" },
  "319": { name: "Columbus, GA",          multiplier: 0.90, label: "Below Average" },
  // ── FLORIDA ──────────────────────────────────────────────────────────────
  "320": { name: "Jacksonville, FL",      multiplier: 0.98, label: "Average" },
  "321": { name: "Daytona Beach, FL",     multiplier: 1.00, label: "Average" },
  "322": { name: "Jacksonville, FL",      multiplier: 0.98, label: "Average" },
  "323": { name: "Tallahassee, FL",       multiplier: 0.95, label: "Below Average" },
  "324": { name: "Pensacola, FL",         multiplier: 0.93, label: "Below Average" },
  "325": { name: "Pensacola, FL",         multiplier: 0.93, label: "Below Average" },
  "326": { name: "Gainesville, FL",       multiplier: 0.97, label: "Average" },
  "327": { name: "Orlando, FL",           multiplier: 1.05, label: "Average" },
  "328": { name: "Orlando, FL",           multiplier: 1.05, label: "Average" },
  "329": { name: "Orlando, FL",           multiplier: 1.05, label: "Average" },
  "330": { name: "Miami, FL",             multiplier: 1.12, label: "Above Average" },
  "331": { name: "Miami, FL",             multiplier: 1.12, label: "Above Average" },
  "332": { name: "Miami, FL",             multiplier: 1.12, label: "Above Average" },
  "333": { name: "Fort Lauderdale, FL",   multiplier: 1.08, label: "Average" },
  "334": { name: "Fort Lauderdale, FL",   multiplier: 1.08, label: "Average" },
  "335": { name: "Tampa, FL",             multiplier: 1.02, label: "Average" },
  "336": { name: "Tampa, FL",             multiplier: 1.02, label: "Average" },
  "337": { name: "Tampa, FL",             multiplier: 1.02, label: "Average" },
  "338": { name: "Tampa, FL",             multiplier: 1.02, label: "Average" },
  "339": { name: "Fort Myers, FL",        multiplier: 1.05, label: "Average" },
  "340": { name: "Miami, FL",             multiplier: 1.12, label: "Above Average" },
  "341": { name: "Naples, FL",            multiplier: 1.10, label: "Above Average" },
  "342": { name: "Sarasota, FL",          multiplier: 1.05, label: "Average" },
  "344": { name: "Gainesville, FL",       multiplier: 0.97, label: "Average" },
  "346": { name: "Tampa, FL",             multiplier: 1.02, label: "Average" },
  "347": { name: "Orlando, FL",           multiplier: 1.05, label: "Average" },
  "349": { name: "West Palm Beach, FL",   multiplier: 1.10, label: "Above Average" },
  // ── ALABAMA ──────────────────────────────────────────────────────────────
  "350": { name: "Birmingham, AL",        multiplier: 0.90, label: "Below Average" },
  "351": { name: "Birmingham, AL",        multiplier: 0.90, label: "Below Average" },
  "352": { name: "Birmingham, AL",        multiplier: 0.90, label: "Below Average" },
  "354": { name: "Tuscaloosa, AL",        multiplier: 0.88, label: "Below Average" },
  "355": { name: "Jasper, AL",            multiplier: 0.87, label: "Below Average" },
  "356": { name: "Decatur, AL",           multiplier: 0.88, label: "Below Average" },
  "357": { name: "Huntsville, AL",        multiplier: 0.92, label: "Below Average" },
  "358": { name: "Huntsville, AL",        multiplier: 0.92, label: "Below Average" },
  "359": { name: "Gadsden, AL",           multiplier: 0.87, label: "Below Average" },
  "360": { name: "Montgomery, AL",        multiplier: 0.88, label: "Below Average" },
  "361": { name: "Montgomery, AL",        multiplier: 0.88, label: "Below Average" },
  "362": { name: "Anniston, AL",          multiplier: 0.87, label: "Below Average" },
  "363": { name: "Dothan, AL",            multiplier: 0.87, label: "Below Average" },
  "364": { name: "Evergreen, AL",         multiplier: 0.85, label: "Below Average" },
  "365": { name: "Mobile, AL",            multiplier: 0.90, label: "Below Average" },
  "366": { name: "Mobile, AL",            multiplier: 0.90, label: "Below Average" },
  "367": { name: "Selma, AL",             multiplier: 0.85, label: "Below Average" },
  "368": { name: "Phenix City, AL",       multiplier: 0.87, label: "Below Average" },
  "369": { name: "Meridian, MS area",     multiplier: 0.85, label: "Below Average" },
  // ── TENNESSEE ────────────────────────────────────────────────────────────
  "370": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "371": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "372": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "373": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "374": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "375": { name: "Nashville, TN",         multiplier: 0.95, label: "Below Average" },
  "376": { name: "Johnson City, TN",      multiplier: 0.90, label: "Below Average" },
  "377": { name: "Knoxville, TN",         multiplier: 0.93, label: "Below Average" },
  "378": { name: "Knoxville, TN",         multiplier: 0.93, label: "Below Average" },
  "379": { name: "Knoxville, TN",         multiplier: 0.93, label: "Below Average" },
  "380": { name: "Memphis, TN",           multiplier: 0.90, label: "Below Average" },
  "381": { name: "Memphis, TN",           multiplier: 0.90, label: "Below Average" },
  "382": { name: "McKenzie, TN",          multiplier: 0.88, label: "Below Average" },
  "383": { name: "Jackson, TN",           multiplier: 0.88, label: "Below Average" },
  "384": { name: "Columbia, TN",          multiplier: 0.90, label: "Below Average" },
  "385": { name: "Cookeville, TN",        multiplier: 0.88, label: "Below Average" },
  // ── MISSISSIPPI ──────────────────────────────────────────────────────────
  "386": { name: "Jackson, MS",           multiplier: 0.85, label: "Below Average" },
  "387": { name: "Greenville, MS",        multiplier: 0.83, label: "Below Average" },
  "388": { name: "Tupelo, MS",            multiplier: 0.85, label: "Below Average" },
  "389": { name: "Meridian, MS",          multiplier: 0.83, label: "Below Average" },
  "390": { name: "Jackson, MS",           multiplier: 0.85, label: "Below Average" },
  "391": { name: "Jackson, MS",           multiplier: 0.85, label: "Below Average" },
  "392": { name: "Jackson, MS",           multiplier: 0.85, label: "Below Average" },
  "393": { name: "Meridian, MS",          multiplier: 0.83, label: "Below Average" },
  "394": { name: "Laurel, MS",            multiplier: 0.83, label: "Below Average" },
  "395": { name: "Gulfport, MS",          multiplier: 0.87, label: "Below Average" },
  "396": { name: "McComb, MS",            multiplier: 0.83, label: "Below Average" },
  "397": { name: "Columbus, MS",          multiplier: 0.83, label: "Below Average" },
  // ── KENTUCKY ─────────────────────────────────────────────────────────────
  "400": { name: "Louisville, KY",        multiplier: 0.95, label: "Below Average" },
  "401": { name: "Louisville, KY",        multiplier: 0.95, label: "Below Average" },
  "402": { name: "Louisville, KY",        multiplier: 0.95, label: "Below Average" },
  "403": { name: "Lexington, KY",         multiplier: 0.97, label: "Average" },
  "404": { name: "Lexington, KY",         multiplier: 0.97, label: "Average" },
  "405": { name: "Lexington, KY",         multiplier: 0.97, label: "Average" },
  "406": { name: "Frankfort, KY",         multiplier: 0.93, label: "Below Average" },
  "407": { name: "London, KY",            multiplier: 0.88, label: "Below Average" },
  "408": { name: "Corbin, KY",            multiplier: 0.88, label: "Below Average" },
  "409": { name: "Corbin, KY",            multiplier: 0.88, label: "Below Average" },
  "410": { name: "Cincinnati area, KY",   multiplier: 0.97, label: "Average" },
  "411": { name: "Ashland, KY",           multiplier: 0.90, label: "Below Average" },
  "412": { name: "Ashland, KY",           multiplier: 0.90, label: "Below Average" },
  "413": { name: "Campton, KY",           multiplier: 0.87, label: "Below Average" },
  "414": { name: "Paintsville, KY",       multiplier: 0.87, label: "Below Average" },
  "415": { name: "Pikeville, KY",         multiplier: 0.87, label: "Below Average" },
  "416": { name: "Pikeville, KY",         multiplier: 0.87, label: "Below Average" },
  "417": { name: "Hazard, KY",            multiplier: 0.87, label: "Below Average" },
  "418": { name: "London, KY",            multiplier: 0.88, label: "Below Average" },
  "420": { name: "Paducah, KY",           multiplier: 0.90, label: "Below Average" },
  "421": { name: "Bowling Green, KY",     multiplier: 0.92, label: "Below Average" },
  "422": { name: "Bowling Green, KY",     multiplier: 0.92, label: "Below Average" },
  "423": { name: "Owensboro, KY",         multiplier: 0.90, label: "Below Average" },
  "424": { name: "Elizabethtown, KY",     multiplier: 0.90, label: "Below Average" },
  "425": { name: "Somerset, KY",          multiplier: 0.88, label: "Below Average" },
  "426": { name: "Barbourville, KY",      multiplier: 0.87, label: "Below Average" },
  "427": { name: "Elizabethtown, KY",     multiplier: 0.90, label: "Below Average" },
  // ── OHIO ─────────────────────────────────────────────────────────────────
  "430": { name: "Columbus, OH",          multiplier: 0.97, label: "Average" },
  "431": { name: "Columbus, OH",          multiplier: 0.97, label: "Average" },
  "432": { name: "Columbus, OH",          multiplier: 0.97, label: "Average" },
  "433": { name: "Columbus, OH",          multiplier: 0.97, label: "Average" },
  "434": { name: "Toledo, OH",            multiplier: 0.97, label: "Average" },
  "435": { name: "Toledo, OH",            multiplier: 0.97, label: "Average" },
  "436": { name: "Toledo, OH",            multiplier: 0.97, label: "Average" },
  "437": { name: "Zanesville, OH",        multiplier: 0.93, label: "Below Average" },
  "438": { name: "Zanesville, OH",        multiplier: 0.93, label: "Below Average" },
  "439": { name: "Steubenville, OH",      multiplier: 0.93, label: "Below Average" },
  "440": { name: "Cleveland, OH",         multiplier: 1.00, label: "Average" },
  "441": { name: "Cleveland, OH",         multiplier: 1.00, label: "Average" },
  "442": { name: "Akron, OH",             multiplier: 0.97, label: "Average" },
  "443": { name: "Akron, OH",             multiplier: 0.97, label: "Average" },
  "444": { name: "Youngstown, OH",        multiplier: 0.93, label: "Below Average" },
  "445": { name: "Youngstown, OH",        multiplier: 0.93, label: "Below Average" },
  "446": { name: "Youngstown, OH",        multiplier: 0.93, label: "Below Average" },
  "447": { name: "Canton, OH",            multiplier: 0.95, label: "Below Average" },
  "448": { name: "Mansfield, OH",         multiplier: 0.93, label: "Below Average" },
  "449": { name: "Mansfield, OH",         multiplier: 0.93, label: "Below Average" },
  "450": { name: "Cincinnati, OH",        multiplier: 0.98, label: "Average" },
  "451": { name: "Cincinnati, OH",        multiplier: 0.98, label: "Average" },
  "452": { name: "Cincinnati, OH",        multiplier: 0.98, label: "Average" },
  "453": { name: "Dayton, OH",            multiplier: 0.95, label: "Below Average" },
  "454": { name: "Dayton, OH",            multiplier: 0.95, label: "Below Average" },
  "455": { name: "Springfield, OH",       multiplier: 0.93, label: "Below Average" },
  "456": { name: "Chillicothe, OH",       multiplier: 0.92, label: "Below Average" },
  "457": { name: "Athens, OH",            multiplier: 0.92, label: "Below Average" },
  "458": { name: "Lima, OH",              multiplier: 0.93, label: "Below Average" },
  // ── INDIANA ──────────────────────────────────────────────────────────────
  "460": { name: "Indianapolis, IN",      multiplier: 0.93, label: "Below Average" },
  "461": { name: "Indianapolis, IN",      multiplier: 0.93, label: "Below Average" },
  "462": { name: "Indianapolis, IN",      multiplier: 0.93, label: "Below Average" },
  "463": { name: "Gary, IN",              multiplier: 0.97, label: "Average" },
  "464": { name: "Gary, IN",              multiplier: 0.97, label: "Average" },
  "465": { name: "South Bend, IN",        multiplier: 0.95, label: "Below Average" },
  "466": { name: "South Bend, IN",        multiplier: 0.95, label: "Below Average" },
  "467": { name: "Fort Wayne, IN",        multiplier: 0.93, label: "Below Average" },
  "468": { name: "Fort Wayne, IN",        multiplier: 0.93, label: "Below Average" },
  "469": { name: "Kokomo, IN",            multiplier: 0.92, label: "Below Average" },
  "470": { name: "Lawrenceburg, IN",      multiplier: 0.92, label: "Below Average" },
  "471": { name: "New Albany, IN",        multiplier: 0.92, label: "Below Average" },
  "472": { name: "Columbus, IN",          multiplier: 0.93, label: "Below Average" },
  "473": { name: "Muncie, IN",            multiplier: 0.92, label: "Below Average" },
  "474": { name: "Bloomington, IN",       multiplier: 0.95, label: "Below Average" },
  "475": { name: "Washington, IN",        multiplier: 0.90, label: "Below Average" },
  "476": { name: "Evansville, IN",        multiplier: 0.92, label: "Below Average" },
  "477": { name: "Evansville, IN",        multiplier: 0.92, label: "Below Average" },
  "478": { name: "Terre Haute, IN",       multiplier: 0.92, label: "Below Average" },
  "479": { name: "Lafayette, IN",         multiplier: 0.93, label: "Below Average" },
  // ── MICHIGAN ─────────────────────────────────────────────────────────────
  "480": { name: "Detroit, MI",           multiplier: 1.02, label: "Average" },
  "481": { name: "Detroit, MI",           multiplier: 1.02, label: "Average" },
  "482": { name: "Detroit, MI",           multiplier: 1.02, label: "Average" },
  "483": { name: "Flint, MI",             multiplier: 0.97, label: "Average" },
  "484": { name: "Flint, MI",             multiplier: 0.97, label: "Average" },
  "485": { name: "Saginaw, MI",           multiplier: 0.97, label: "Average" },
  "486": { name: "Bay City, MI",          multiplier: 0.95, label: "Below Average" },
  "487": { name: "Bay City, MI",          multiplier: 0.95, label: "Below Average" },
  "488": { name: "Lansing, MI",           multiplier: 0.97, label: "Average" },
  "489": { name: "Lansing, MI",           multiplier: 0.97, label: "Average" },
  "490": { name: "Battle Creek, MI",      multiplier: 0.95, label: "Below Average" },
  "491": { name: "Kalamazoo, MI",         multiplier: 0.97, label: "Average" },
  "492": { name: "Jackson, MI",           multiplier: 0.95, label: "Below Average" },
  "493": { name: "Grand Rapids, MI",      multiplier: 0.97, label: "Average" },
  "494": { name: "Muskegon, MI",          multiplier: 0.95, label: "Below Average" },
  "495": { name: "Grand Rapids, MI",      multiplier: 0.97, label: "Average" },
  "496": { name: "Traverse City, MI",     multiplier: 1.00, label: "Average" },
  "497": { name: "Gaylord, MI",           multiplier: 0.95, label: "Below Average" },
  "498": { name: "Iron Mountain, MI",     multiplier: 0.93, label: "Below Average" },
  "499": { name: "Marquette, MI",         multiplier: 0.95, label: "Below Average" },
  // ── IOWA ─────────────────────────────────────────────────────────────────
  "500": { name: "Des Moines, IA",        multiplier: 0.88, label: "Below Average" },
  "501": { name: "Des Moines, IA",        multiplier: 0.88, label: "Below Average" },
  "502": { name: "Des Moines, IA",        multiplier: 0.88, label: "Below Average" },
  "503": { name: "Des Moines, IA",        multiplier: 0.88, label: "Below Average" },
  "504": { name: "Mason City, IA",        multiplier: 0.87, label: "Below Average" },
  "505": { name: "Fort Dodge, IA",        multiplier: 0.87, label: "Below Average" },
  "506": { name: "Waterloo, IA",          multiplier: 0.88, label: "Below Average" },
  "507": { name: "Dubuque, IA",           multiplier: 0.90, label: "Below Average" },
  "508": { name: "Davenport, IA",         multiplier: 0.90, label: "Below Average" },
  "509": { name: "Iowa City, IA",         multiplier: 0.92, label: "Below Average" },
  "510": { name: "Sioux City, IA",        multiplier: 0.88, label: "Below Average" },
  "511": { name: "Sioux City, IA",        multiplier: 0.88, label: "Below Average" },
  "512": { name: "Sioux City, IA",        multiplier: 0.88, label: "Below Average" },
  "513": { name: "Spencer, IA",           multiplier: 0.87, label: "Below Average" },
  "514": { name: "Carroll, IA",           multiplier: 0.87, label: "Below Average" },
  "515": { name: "Des Moines, IA",        multiplier: 0.88, label: "Below Average" },
  "516": { name: "Ottumwa, IA",           multiplier: 0.87, label: "Below Average" },
  "520": { name: "Dubuque, IA",           multiplier: 0.90, label: "Below Average" },
  "521": { name: "Decorah, IA",           multiplier: 0.87, label: "Below Average" },
  "522": { name: "Cedar Rapids, IA",      multiplier: 0.90, label: "Below Average" },
  "523": { name: "Cedar Rapids, IA",      multiplier: 0.90, label: "Below Average" },
  "524": { name: "Cedar Rapids, IA",      multiplier: 0.90, label: "Below Average" },
  "525": { name: "Iowa City, IA",         multiplier: 0.92, label: "Below Average" },
  "526": { name: "Burlington, IA",        multiplier: 0.88, label: "Below Average" },
  "527": { name: "Davenport, IA",         multiplier: 0.90, label: "Below Average" },
  "528": { name: "Davenport, IA",         multiplier: 0.90, label: "Below Average" },
  // ── MINNESOTA ────────────────────────────────────────────────────────────
  "550": { name: "St. Paul, MN",          multiplier: 1.05, label: "Average" },
  "551": { name: "St. Paul, MN",          multiplier: 1.05, label: "Average" },
  "553": { name: "Minneapolis, MN",       multiplier: 1.05, label: "Average" },
  "554": { name: "Minneapolis, MN",       multiplier: 1.05, label: "Average" },
  "555": { name: "Minneapolis, MN",       multiplier: 1.05, label: "Average" },
  "556": { name: "Duluth, MN",            multiplier: 0.98, label: "Average" },
  "557": { name: "Duluth, MN",            multiplier: 0.98, label: "Average" },
  "558": { name: "Duluth, MN",            multiplier: 0.98, label: "Average" },
  "559": { name: "Rochester, MN",         multiplier: 1.00, label: "Average" },
  "560": { name: "Mankato, MN",           multiplier: 0.97, label: "Average" },
  "561": { name: "Mankato, MN",           multiplier: 0.97, label: "Average" },
  "562": { name: "Willmar, MN",           multiplier: 0.93, label: "Below Average" },
  "563": { name: "St. Cloud, MN",         multiplier: 0.97, label: "Average" },
  "564": { name: "Brainerd, MN",          multiplier: 0.95, label: "Below Average" },
  "565": { name: "Detroit Lakes, MN",     multiplier: 0.93, label: "Below Average" },
  "566": { name: "Bemidji, MN",           multiplier: 0.92, label: "Below Average" },
  "567": { name: "Thief River Falls, MN", multiplier: 0.90, label: "Below Average" },
  // ── WISCONSIN ────────────────────────────────────────────────────────────
  "530": { name: "Milwaukee, WI",         multiplier: 0.98, label: "Average" },
  "531": { name: "Milwaukee, WI",         multiplier: 0.98, label: "Average" },
  "532": { name: "Milwaukee, WI",         multiplier: 0.98, label: "Average" },
  "534": { name: "Racine, WI",            multiplier: 0.97, label: "Average" },
  "535": { name: "Beloit, WI",            multiplier: 0.95, label: "Below Average" },
  "537": { name: "Madison, WI",           multiplier: 1.00, label: "Average" },
  "538": { name: "Madison, WI",           multiplier: 1.00, label: "Average" },
  "539": { name: "Portage, WI",           multiplier: 0.95, label: "Below Average" },
  "540": { name: "Green Bay, WI",         multiplier: 0.97, label: "Average" },
  "541": { name: "Green Bay, WI",         multiplier: 0.97, label: "Average" },
  "542": { name: "Wausau, WI",            multiplier: 0.95, label: "Below Average" },
  "543": { name: "Wausau, WI",            multiplier: 0.95, label: "Below Average" },
  "544": { name: "Wausau, WI",            multiplier: 0.95, label: "Below Average" },
  "545": { name: "Rhinelander, WI",       multiplier: 0.93, label: "Below Average" },
  "546": { name: "La Crosse, WI",         multiplier: 0.95, label: "Below Average" },
  "547": { name: "Eau Claire, WI",        multiplier: 0.95, label: "Below Average" },
  "548": { name: "Superior, WI",          multiplier: 0.93, label: "Below Average" },
  "549": { name: "Oshkosh, WI",           multiplier: 0.95, label: "Below Average" },
  // ── MONTANA ──────────────────────────────────────────────────────────────
  "590": { name: "Billings, MT",          multiplier: 0.97, label: "Average" },
  "591": { name: "Billings, MT",          multiplier: 0.97, label: "Average" },
  "592": { name: "Wolf Point, MT",        multiplier: 0.90, label: "Below Average" },
  "593": { name: "Glasgow, MT",           multiplier: 0.90, label: "Below Average" },
  "594": { name: "Great Falls, MT",       multiplier: 0.95, label: "Below Average" },
  "595": { name: "Havre, MT",             multiplier: 0.90, label: "Below Average" },
  "596": { name: "Helena, MT",            multiplier: 0.97, label: "Average" },
  "597": { name: "Butte, MT",             multiplier: 0.95, label: "Below Average" },
  "598": { name: "Missoula, MT",          multiplier: 1.00, label: "Average" },
  "599": { name: "Kalispell, MT",         multiplier: 1.00, label: "Average" },
  // ── ILLINOIS ─────────────────────────────────────────────────────────────
  "600": { name: "Chicago Suburbs, IL",   multiplier: 1.12, label: "Above Average" },
  "601": { name: "Chicago Suburbs, IL",   multiplier: 1.12, label: "Above Average" },
  "602": { name: "Chicago Suburbs, IL",   multiplier: 1.12, label: "Above Average" },
  "603": { name: "Chicago Suburbs, IL",   multiplier: 1.12, label: "Above Average" },
  "604": { name: "Chicago, IL",           multiplier: 1.18, label: "Above Average" },
  "605": { name: "Chicago, IL",           multiplier: 1.18, label: "Above Average" },
  "606": { name: "Chicago, IL",           multiplier: 1.18, label: "Above Average" },
  "607": { name: "Chicago, IL",           multiplier: 1.18, label: "Above Average" },
  "608": { name: "Joliet, IL",            multiplier: 1.05, label: "Average" },
  "609": { name: "Kankakee, IL",          multiplier: 1.00, label: "Average" },
  "610": { name: "Rockford, IL",          multiplier: 1.00, label: "Average" },
  "611": { name: "Rockford, IL",          multiplier: 1.00, label: "Average" },
  "612": { name: "Rock Island, IL",       multiplier: 0.97, label: "Average" },
  "613": { name: "La Salle, IL",          multiplier: 0.97, label: "Average" },
  "614": { name: "Galesburg, IL",         multiplier: 0.95, label: "Below Average" },
  "615": { name: "Peoria, IL",            multiplier: 0.97, label: "Average" },
  "616": { name: "Peoria, IL",            multiplier: 0.97, label: "Average" },
  "617": { name: "Bloomington, IL",       multiplier: 0.97, label: "Average" },
  "618": { name: "Champaign, IL",         multiplier: 0.98, label: "Average" },
  "619": { name: "Champaign, IL",         multiplier: 0.98, label: "Average" },
  "620": { name: "East St. Louis, IL",    multiplier: 0.93, label: "Below Average" },
  "621": { name: "East St. Louis, IL",    multiplier: 0.93, label: "Below Average" },
  "622": { name: "East St. Louis, IL",    multiplier: 0.93, label: "Below Average" },
  "623": { name: "Quincy, IL",            multiplier: 0.92, label: "Below Average" },
  "624": { name: "Effingham, IL",         multiplier: 0.92, label: "Below Average" },
  "625": { name: "Springfield, IL",       multiplier: 0.95, label: "Below Average" },
  "626": { name: "Springfield, IL",       multiplier: 0.95, label: "Below Average" },
  "627": { name: "Springfield, IL",       multiplier: 0.95, label: "Below Average" },
  "628": { name: "Centralia, IL",         multiplier: 0.92, label: "Below Average" },
  "629": { name: "Carbondale, IL",        multiplier: 0.92, label: "Below Average" },
  // ── MISSOURI ─────────────────────────────────────────────────────────────
  "630": { name: "St. Louis, MO",         multiplier: 0.95, label: "Below Average" },
  "631": { name: "St. Louis, MO",         multiplier: 0.95, label: "Below Average" },
  "633": { name: "St. Louis area, MO",    multiplier: 0.93, label: "Below Average" },
  "634": { name: "Hannibal, MO",          multiplier: 0.88, label: "Below Average" },
  "635": { name: "Kirksville, MO",        multiplier: 0.87, label: "Below Average" },
  "636": { name: "Cape Girardeau, MO",    multiplier: 0.88, label: "Below Average" },
  "637": { name: "Cape Girardeau, MO",    multiplier: 0.88, label: "Below Average" },
  "638": { name: "Sikeston, MO",          multiplier: 0.87, label: "Below Average" },
  "639": { name: "Poplar Bluff, MO",      multiplier: 0.87, label: "Below Average" },
  "640": { name: "Kansas City, MO",       multiplier: 0.93, label: "Below Average" },
  "641": { name: "Kansas City, MO",       multiplier: 0.93, label: "Below Average" },
  "644": { name: "St. Joseph, MO",        multiplier: 0.90, label: "Below Average" },
  "645": { name: "St. Joseph, MO",        multiplier: 0.90, label: "Below Average" },
  "646": { name: "Chillicothe, MO",       multiplier: 0.88, label: "Below Average" },
  "647": { name: "Harrisonville, MO",     multiplier: 0.90, label: "Below Average" },
  "648": { name: "Joplin, MO",            multiplier: 0.88, label: "Below Average" },
  "649": { name: "Joplin, MO",            multiplier: 0.88, label: "Below Average" },
  "650": { name: "Jefferson City, MO",    multiplier: 0.90, label: "Below Average" },
  "651": { name: "Jefferson City, MO",    multiplier: 0.90, label: "Below Average" },
  "652": { name: "Columbia, MO",          multiplier: 0.93, label: "Below Average" },
  "653": { name: "Sedalia, MO",           multiplier: 0.88, label: "Below Average" },
  "654": { name: "Springfield, MO",       multiplier: 0.90, label: "Below Average" },
  "655": { name: "Springfield, MO",       multiplier: 0.90, label: "Below Average" },
  "656": { name: "Springfield, MO",       multiplier: 0.90, label: "Below Average" },
  "657": { name: "Springfield, MO",       multiplier: 0.90, label: "Below Average" },
  "658": { name: "Springfield, MO",       multiplier: 0.90, label: "Below Average" },
  // ── NORTH / SOUTH DAKOTA ─────────────────────────────────────────────────
  "570": { name: "Sioux Falls, SD",       multiplier: 0.90, label: "Below Average" },
  "571": { name: "Sioux Falls, SD",       multiplier: 0.90, label: "Below Average" },
  "572": { name: "Watertown, SD",         multiplier: 0.88, label: "Below Average" },
  "573": { name: "Mitchell, SD",          multiplier: 0.87, label: "Below Average" },
  "574": { name: "Aberdeen, SD",          multiplier: 0.88, label: "Below Average" },
  "575": { name: "Pierre, SD",            multiplier: 0.88, label: "Below Average" },
  "576": { name: "Mobridge, SD",          multiplier: 0.87, label: "Below Average" },
  "577": { name: "Rapid City, SD",        multiplier: 0.90, label: "Below Average" },
  "580": { name: "Fargo, ND",             multiplier: 0.93, label: "Below Average" },
  "581": { name: "Fargo, ND",             multiplier: 0.93, label: "Below Average" },
  "582": { name: "Grand Forks, ND",       multiplier: 0.90, label: "Below Average" },
  "583": { name: "Devils Lake, ND",       multiplier: 0.88, label: "Below Average" },
  "584": { name: "Jamestown, ND",         multiplier: 0.88, label: "Below Average" },
  "585": { name: "Bismarck, ND",          multiplier: 0.92, label: "Below Average" },
  "586": { name: "Bismarck, ND",          multiplier: 0.92, label: "Below Average" },
  "587": { name: "Minot, ND",             multiplier: 0.90, label: "Below Average" },
  "588": { name: "Williston, ND",         multiplier: 0.95, label: "Below Average" },
  // ── NEBRASKA ─────────────────────────────────────────────────────────────
  "680": { name: "Omaha, NE",             multiplier: 0.90, label: "Below Average" },
  "681": { name: "Omaha, NE",             multiplier: 0.90, label: "Below Average" },
  "683": { name: "Lincoln, NE",           multiplier: 0.90, label: "Below Average" },
  "684": { name: "Lincoln, NE",           multiplier: 0.90, label: "Below Average" },
  "685": { name: "Lincoln, NE",           multiplier: 0.90, label: "Below Average" },
  "686": { name: "Norfolk, NE",           multiplier: 0.87, label: "Below Average" },
  "687": { name: "Norfolk, NE",           multiplier: 0.87, label: "Below Average" },
  "688": { name: "Grand Island, NE",      multiplier: 0.88, label: "Below Average" },
  "689": { name: "Hastings, NE",          multiplier: 0.87, label: "Below Average" },
  "690": { name: "McCook, NE",            multiplier: 0.87, label: "Below Average" },
  "691": { name: "North Platte, NE",      multiplier: 0.88, label: "Below Average" },
  "692": { name: "Valentine, NE",         multiplier: 0.87, label: "Below Average" },
  "693": { name: "Alliance, NE",          multiplier: 0.87, label: "Below Average" },
  // ── KANSAS ───────────────────────────────────────────────────────────────
  "660": { name: "Kansas City, KS",       multiplier: 0.90, label: "Below Average" },
  "661": { name: "Kansas City, KS",       multiplier: 0.90, label: "Below Average" },
  "662": { name: "Wichita, KS",           multiplier: 0.87, label: "Below Average" },
  "664": { name: "Topeka, KS",            multiplier: 0.88, label: "Below Average" },
  "665": { name: "Topeka, KS",            multiplier: 0.88, label: "Below Average" },
  "666": { name: "Topeka, KS",            multiplier: 0.88, label: "Below Average" },
  "667": { name: "Wichita, KS",           multiplier: 0.87, label: "Below Average" },
  "668": { name: "Emporia, KS",           multiplier: 0.87, label: "Below Average" },
  "669": { name: "Concordia, KS",         multiplier: 0.85, label: "Below Average" },
  "670": { name: "Wichita, KS",           multiplier: 0.87, label: "Below Average" },
  "671": { name: "Wichita, KS",           multiplier: 0.87, label: "Below Average" },
  "672": { name: "Wichita, KS",           multiplier: 0.87, label: "Below Average" },
  "673": { name: "Independence, KS",      multiplier: 0.85, label: "Below Average" },
  "674": { name: "Salina, KS",            multiplier: 0.87, label: "Below Average" },
  "675": { name: "Hutchinson, KS",        multiplier: 0.87, label: "Below Average" },
  "676": { name: "Hays, KS",              multiplier: 0.85, label: "Below Average" },
  "677": { name: "Colby, KS",             multiplier: 0.85, label: "Below Average" },
  "678": { name: "Dodge City, KS",        multiplier: 0.85, label: "Below Average" },
  "679": { name: "Liberal, KS",           multiplier: 0.85, label: "Below Average" },
  // ── LOUISIANA ────────────────────────────────────────────────────────────
  "700": { name: "New Orleans, LA",       multiplier: 0.93, label: "Below Average" },
  "701": { name: "New Orleans, LA",       multiplier: 0.93, label: "Below Average" },
  "703": { name: "Thibodaux, LA",         multiplier: 0.88, label: "Below Average" },
  "704": { name: "Hammond, LA",           multiplier: 0.88, label: "Below Average" },
  "705": { name: "Lafayette, LA",         multiplier: 0.90, label: "Below Average" },
  "706": { name: "Lake Charles, LA",      multiplier: 0.90, label: "Below Average" },
  "707": { name: "Baton Rouge, LA",       multiplier: 0.92, label: "Below Average" },
  "708": { name: "Baton Rouge, LA",       multiplier: 0.92, label: "Below Average" },
  "710": { name: "Shreveport, LA",        multiplier: 0.90, label: "Below Average" },
  "711": { name: "Shreveport, LA",        multiplier: 0.90, label: "Below Average" },
  "712": { name: "Monroe, LA",            multiplier: 0.87, label: "Below Average" },
  "713": { name: "Alexandria, LA",        multiplier: 0.87, label: "Below Average" },
  "714": { name: "Alexandria, LA",        multiplier: 0.87, label: "Below Average" },
  // ── ARKANSAS ─────────────────────────────────────────────────────────────
  "716": { name: "Pine Bluff, AR",        multiplier: 0.85, label: "Below Average" },
  "717": { name: "Camden, AR",            multiplier: 0.85, label: "Below Average" },
  "718": { name: "Texarkana, AR",         multiplier: 0.87, label: "Below Average" },
  "719": { name: "Hot Springs, AR",       multiplier: 0.87, label: "Below Average" },
  "720": { name: "Little Rock, AR",       multiplier: 0.88, label: "Below Average" },
  "721": { name: "Little Rock, AR",       multiplier: 0.88, label: "Below Average" },
  "722": { name: "Little Rock, AR",       multiplier: 0.88, label: "Below Average" },
  "723": { name: "West Memphis, AR",      multiplier: 0.87, label: "Below Average" },
  "724": { name: "Jonesboro, AR",         multiplier: 0.87, label: "Below Average" },
  "725": { name: "Batesville, AR",        multiplier: 0.85, label: "Below Average" },
  "726": { name: "Harrison, AR",          multiplier: 0.85, label: "Below Average" },
  "727": { name: "Fayetteville, AR",      multiplier: 0.90, label: "Below Average" },
  "728": { name: "Russellville, AR",      multiplier: 0.87, label: "Below Average" },
  "729": { name: "Fort Smith, AR",        multiplier: 0.88, label: "Below Average" },
  // ── OKLAHOMA ─────────────────────────────────────────────────────────────
  "730": { name: "Oklahoma City, OK",     multiplier: 0.88, label: "Below Average" },
  "731": { name: "Oklahoma City, OK",     multiplier: 0.88, label: "Below Average" },
  "733": { name: "Ardmore, OK",           multiplier: 0.85, label: "Below Average" },
  "734": { name: "Ardmore, OK",           multiplier: 0.85, label: "Below Average" },
  "735": { name: "Lawton, OK",            multiplier: 0.87, label: "Below Average" },
  "736": { name: "Enid, OK",              multiplier: 0.87, label: "Below Average" },
  "737": { name: "Enid, OK",              multiplier: 0.87, label: "Below Average" },
  "738": { name: "Woodward, OK",          multiplier: 0.85, label: "Below Average" },
  "739": { name: "Liberal, KS area",      multiplier: 0.85, label: "Below Average" },
  "740": { name: "Tulsa, OK",             multiplier: 0.90, label: "Below Average" },
  "741": { name: "Tulsa, OK",             multiplier: 0.90, label: "Below Average" },
  "743": { name: "Miami, OK",             multiplier: 0.87, label: "Below Average" },
  "744": { name: "Muskogee, OK",          multiplier: 0.87, label: "Below Average" },
  "745": { name: "McAlester, OK",         multiplier: 0.85, label: "Below Average" },
  "746": { name: "Ponca City, OK",        multiplier: 0.87, label: "Below Average" },
  "747": { name: "Durant, OK",            multiplier: 0.85, label: "Below Average" },
  "748": { name: "Shawnee, OK",           multiplier: 0.87, label: "Below Average" },
  "749": { name: "Poteau, OK",            multiplier: 0.85, label: "Below Average" },
  // ── TEXAS ────────────────────────────────────────────────────────────────
  "750": { name: "Dallas, TX",            multiplier: 0.95, label: "Below Average" },
  "751": { name: "Dallas, TX",            multiplier: 0.95, label: "Below Average" },
  "752": { name: "Dallas, TX",            multiplier: 0.95, label: "Below Average" },
  "753": { name: "Dallas, TX",            multiplier: 0.95, label: "Below Average" },
  "754": { name: "Dallas, TX",            multiplier: 0.95, label: "Below Average" },
  "755": { name: "Plano/Frisco, TX",      multiplier: 0.97, label: "Average" },
  "756": { name: "Arlington, TX",         multiplier: 0.93, label: "Below Average" },
  "757": { name: "Fort Worth, TX",        multiplier: 0.93, label: "Below Average" },
  "758": { name: "Wichita Falls, TX",     multiplier: 0.88, label: "Below Average" },
  "759": { name: "Lufkin, TX",            multiplier: 0.87, label: "Below Average" },
  "760": { name: "Fort Worth, TX",        multiplier: 0.93, label: "Below Average" },
  "761": { name: "Fort Worth, TX",        multiplier: 0.93, label: "Below Average" },
  "762": { name: "Denton, TX",            multiplier: 0.93, label: "Below Average" },
  "763": { name: "Wichita Falls, TX",     multiplier: 0.88, label: "Below Average" },
  "764": { name: "Stephenville, TX",      multiplier: 0.87, label: "Below Average" },
  "765": { name: "Temple, TX",            multiplier: 0.90, label: "Below Average" },
  "766": { name: "Waco, TX",              multiplier: 0.90, label: "Below Average" },
  "767": { name: "Waco, TX",              multiplier: 0.90, label: "Below Average" },
  "768": { name: "Abilene, TX",           multiplier: 0.87, label: "Below Average" },
  "769": { name: "Midland, TX",           multiplier: 0.92, label: "Below Average" },
  "770": { name: "Houston, TX",           multiplier: 0.92, label: "Below Average" },
  "771": { name: "Houston, TX",           multiplier: 0.92, label: "Below Average" },
  "772": { name: "Houston, TX",           multiplier: 0.92, label: "Below Average" },
  "773": { name: "Huntsville, TX",        multiplier: 0.88, label: "Below Average" },
  "774": { name: "Houston area, TX",      multiplier: 0.92, label: "Below Average" },
  "775": { name: "Houston area, TX",      multiplier: 0.92, label: "Below Average" },
  "776": { name: "Beaumont, TX",          multiplier: 0.90, label: "Below Average" },
  "777": { name: "Beaumont, TX",          multiplier: 0.90, label: "Below Average" },
  "778": { name: "Bryan, TX",             multiplier: 0.90, label: "Below Average" },
  "779": { name: "Victoria, TX",          multiplier: 0.88, label: "Below Average" },
  "780": { name: "San Antonio, TX",       multiplier: 0.90, label: "Below Average" },
  "781": { name: "San Antonio, TX",       multiplier: 0.90, label: "Below Average" },
  "782": { name: "San Antonio, TX",       multiplier: 0.90, label: "Below Average" },
  "783": { name: "Corpus Christi, TX",    multiplier: 0.88, label: "Below Average" },
  "784": { name: "Corpus Christi, TX",    multiplier: 0.88, label: "Below Average" },
  "785": { name: "McAllen, TX",           multiplier: 0.85, label: "Below Average" },
  "786": { name: "Austin, TX",            multiplier: 1.00, label: "Average" },
  "787": { name: "Austin, TX",            multiplier: 1.00, label: "Average" },
  "788": { name: "Laredo, TX",            multiplier: 0.83, label: "Below Average" },
  "789": { name: "Midland, TX",           multiplier: 0.92, label: "Below Average" },
  "790": { name: "Amarillo, TX",          multiplier: 0.88, label: "Below Average" },
  "791": { name: "Amarillo, TX",          multiplier: 0.88, label: "Below Average" },
  "792": { name: "Childress, TX",         multiplier: 0.85, label: "Below Average" },
  "793": { name: "Lubbock, TX",           multiplier: 0.88, label: "Below Average" },
  "794": { name: "Lubbock, TX",           multiplier: 0.88, label: "Below Average" },
  "795": { name: "Abilene, TX",           multiplier: 0.87, label: "Below Average" },
  "796": { name: "Abilene, TX",           multiplier: 0.87, label: "Below Average" },
  "797": { name: "Midland, TX",           multiplier: 0.92, label: "Below Average" },
  "798": { name: "El Paso, TX",           multiplier: 0.88, label: "Below Average" },
  "799": { name: "El Paso, TX",           multiplier: 0.88, label: "Below Average" },
  // ── COLORADO ─────────────────────────────────────────────────────────────
  "800": { name: "Denver, CO",            multiplier: 1.08, label: "Average" },
  "801": { name: "Denver, CO",            multiplier: 1.08, label: "Average" },
  "802": { name: "Denver, CO",            multiplier: 1.08, label: "Average" },
  "803": { name: "Denver, CO",            multiplier: 1.08, label: "Average" },
  "804": { name: "Denver, CO",            multiplier: 1.08, label: "Average" },
  "805": { name: "Boulder, CO",           multiplier: 1.15, label: "Above Average" },
  "806": { name: "Brighton, CO",          multiplier: 1.05, label: "Average" },
  "807": { name: "Fort Collins, CO",      multiplier: 1.08, label: "Average" },
  "808": { name: "Colorado Springs, CO",  multiplier: 1.02, label: "Average" },
  "809": { name: "Colorado Springs, CO",  multiplier: 1.02, label: "Average" },
  "810": { name: "Pueblo, CO",            multiplier: 0.97, label: "Average" },
  "811": { name: "Alamosa, CO",           multiplier: 0.93, label: "Below Average" },
  "812": { name: "Salida, CO",            multiplier: 0.97, label: "Average" },
  "813": { name: "Durango, CO",           multiplier: 1.00, label: "Average" },
  "814": { name: "Montrose, CO",          multiplier: 0.97, label: "Average" },
  "815": { name: "Grand Junction, CO",    multiplier: 1.00, label: "Average" },
  "816": { name: "Glenwood Springs, CO",  multiplier: 1.08, label: "Average" },
  // ── WYOMING ──────────────────────────────────────────────────────────────
  "820": { name: "Cheyenne, WY",          multiplier: 0.95, label: "Below Average" },
  "821": { name: "Yellowstone area, WY",  multiplier: 0.95, label: "Below Average" },
  "822": { name: "Wheatland, WY",         multiplier: 0.92, label: "Below Average" },
  "823": { name: "Rawlins, WY",           multiplier: 0.92, label: "Below Average" },
  "824": { name: "Worland, WY",           multiplier: 0.90, label: "Below Average" },
  "825": { name: "Riverton, WY",          multiplier: 0.90, label: "Below Average" },
  "826": { name: "Casper, WY",            multiplier: 0.95, label: "Below Average" },
  "827": { name: "Newcastle, WY",         multiplier: 0.90, label: "Below Average" },
  "828": { name: "Sheridan, WY",          multiplier: 0.93, label: "Below Average" },
  "829": { name: "Rock Springs, WY",      multiplier: 0.95, label: "Below Average" },
  "830": { name: "Rock Springs, WY",      multiplier: 0.95, label: "Below Average" },
  "831": { name: "Rock Springs, WY",      multiplier: 0.95, label: "Below Average" },
  // ── IDAHO ────────────────────────────────────────────────────────────────
  "832": { name: "Pocatello, ID",         multiplier: 0.93, label: "Below Average" },
  "833": { name: "Twin Falls, ID",        multiplier: 0.93, label: "Below Average" },
  "834": { name: "Idaho Falls, ID",       multiplier: 0.95, label: "Below Average" },
  "835": { name: "Lewiston, ID",          multiplier: 0.95, label: "Below Average" },
  "836": { name: "Boise, ID",             multiplier: 1.00, label: "Average" },
  "837": { name: "Boise, ID",             multiplier: 1.00, label: "Average" },
  "838": { name: "Coeur d Alene, ID",     multiplier: 1.00, label: "Average" },
  // ── UTAH ─────────────────────────────────────────────────────────────────
  "840": { name: "Salt Lake City, UT",    multiplier: 1.00, label: "Average" },
  "841": { name: "Salt Lake City, UT",    multiplier: 1.00, label: "Average" },
  "842": { name: "Ogden, UT",             multiplier: 0.97, label: "Average" },
  "843": { name: "Ogden, UT",             multiplier: 0.97, label: "Average" },
  "844": { name: "Ogden, UT",             multiplier: 0.97, label: "Average" },
  "845": { name: "Price, UT",             multiplier: 0.93, label: "Below Average" },
  "846": { name: "Provo, UT",             multiplier: 0.97, label: "Average" },
  "847": { name: "Provo, UT",             multiplier: 0.97, label: "Average" },
  // ── ARIZONA ──────────────────────────────────────────────────────────────
  "850": { name: "Phoenix, AZ",           multiplier: 0.97, label: "Average" },
  "851": { name: "Phoenix, AZ",           multiplier: 0.97, label: "Average" },
  "852": { name: "Phoenix, AZ",           multiplier: 0.97, label: "Average" },
  "853": { name: "Phoenix, AZ",           multiplier: 0.97, label: "Average" },
  "854": { name: "Phoenix, AZ",           multiplier: 0.97, label: "Average" },
  "855": { name: "Globe, AZ",             multiplier: 0.90, label: "Below Average" },
  "856": { name: "Tucson, AZ",            multiplier: 0.93, label: "Below Average" },
  "857": { name: "Tucson, AZ",            multiplier: 0.93, label: "Below Average" },
  "859": { name: "Show Low, AZ",          multiplier: 0.90, label: "Below Average" },
  "860": { name: "Flagstaff, AZ",         multiplier: 0.97, label: "Average" },
  "863": { name: "Prescott, AZ",          multiplier: 0.97, label: "Average" },
  "864": { name: "Kingman, AZ",           multiplier: 0.90, label: "Below Average" },
  "865": { name: "Yuma, AZ",              multiplier: 0.90, label: "Below Average" },
  // ── NEW MEXICO ────────────────────────────────────────────────────────────
  "870": { name: "Albuquerque, NM",       multiplier: 0.90, label: "Below Average" },
  "871": { name: "Albuquerque, NM",       multiplier: 0.90, label: "Below Average" },
  "872": { name: "Albuquerque, NM",       multiplier: 0.90, label: "Below Average" },
  "873": { name: "Gallup, NM",            multiplier: 0.85, label: "Below Average" },
  "874": { name: "Farmington, NM",        multiplier: 0.88, label: "Below Average" },
  "875": { name: "Santa Fe, NM",          multiplier: 0.97, label: "Average" },
  "877": { name: "Las Vegas, NM",         multiplier: 0.85, label: "Below Average" },
  "878": { name: "Socorro, NM",           multiplier: 0.85, label: "Below Average" },
  "879": { name: "Truth or Consequences", multiplier: 0.83, label: "Below Average" },
  "880": { name: "Las Cruces, NM",        multiplier: 0.87, label: "Below Average" },
  "881": { name: "Clovis, NM",            multiplier: 0.85, label: "Below Average" },
  "882": { name: "Roswell, NM",           multiplier: 0.87, label: "Below Average" },
  "883": { name: "Carrizozo, NM",         multiplier: 0.83, label: "Below Average" },
  "884": { name: "Tucumcari, NM",         multiplier: 0.83, label: "Below Average" },
  // ── NEVADA ───────────────────────────────────────────────────────────────
  "889": { name: "Las Vegas, NV",         multiplier: 1.00, label: "Average" },
  "890": { name: "Las Vegas, NV",         multiplier: 1.00, label: "Average" },
  "891": { name: "Las Vegas, NV",         multiplier: 1.00, label: "Average" },
  "893": { name: "Ely, NV",               multiplier: 0.95, label: "Below Average" },
  "894": { name: "Reno, NV",              multiplier: 1.05, label: "Average" },
  "895": { name: "Reno, NV",              multiplier: 1.05, label: "Average" },
  "897": { name: "Carson City, NV",       multiplier: 1.02, label: "Average" },
  "898": { name: "Elko, NV",              multiplier: 0.97, label: "Average" },
  // ── CALIFORNIA ───────────────────────────────────────────────────────────
  "900": { name: "Los Angeles, CA",       multiplier: 1.38, label: "High Cost" },
  "901": { name: "Los Angeles, CA",       multiplier: 1.38, label: "High Cost" },
  "902": { name: "Los Angeles, CA",       multiplier: 1.38, label: "High Cost" },
  "903": { name: "Los Angeles, CA",       multiplier: 1.38, label: "High Cost" },
  "904": { name: "Santa Monica, CA",      multiplier: 1.42, label: "High Cost" },
  "905": { name: "Los Angeles, CA",       multiplier: 1.35, label: "High Cost" },
  "906": { name: "Compton, CA",           multiplier: 1.28, label: "Above Average" },
  "907": { name: "Los Angeles, CA",       multiplier: 1.35, label: "High Cost" },
  "908": { name: "Long Beach, CA",        multiplier: 1.32, label: "High Cost" },
  "910": { name: "Pasadena, CA",          multiplier: 1.35, label: "High Cost" },
  "911": { name: "Pasadena, CA",          multiplier: 1.35, label: "High Cost" },
  "912": { name: "Glendale, CA",          multiplier: 1.35, label: "High Cost" },
  "913": { name: "San Fernando, CA",      multiplier: 1.30, label: "High Cost" },
  "914": { name: "San Fernando, CA",      multiplier: 1.30, label: "High Cost" },
  "915": { name: "Inglewood, CA",         multiplier: 1.35, label: "High Cost" },
  "916": { name: "Van Nuys, CA",          multiplier: 1.32, label: "High Cost" },
  "917": { name: "Van Nuys, CA",          multiplier: 1.32, label: "High Cost" },
  "918": { name: "Van Nuys, CA",          multiplier: 1.32, label: "High Cost" },
  "919": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "920": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "921": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "922": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "923": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "924": { name: "San Diego, CA",         multiplier: 1.28, label: "Above Average" },
  "925": { name: "Riverside, CA",         multiplier: 1.15, label: "Above Average" },
  "926": { name: "Orange County, CA",     multiplier: 1.32, label: "High Cost" },
  "927": { name: "Orange County, CA",     multiplier: 1.32, label: "High Cost" },
  "928": { name: "Palm Springs, CA",      multiplier: 1.15, label: "Above Average" },
  "930": { name: "Oxnard, CA",            multiplier: 1.25, label: "Above Average" },
  "931": { name: "Santa Barbara, CA",     multiplier: 1.35, label: "High Cost" },
  "932": { name: "Fresno, CA",            multiplier: 1.05, label: "Average" },
  "933": { name: "Fresno, CA",            multiplier: 1.05, label: "Average" },
  "934": { name: "San Luis Obispo, CA",   multiplier: 1.18, label: "Above Average" },
  "935": { name: "Mojave, CA",            multiplier: 1.05, label: "Average" },
  "936": { name: "Fresno, CA",            multiplier: 1.05, label: "Average" },
  "937": { name: "Fresno, CA",            multiplier: 1.05, label: "Average" },
  "938": { name: "Fresno, CA",            multiplier: 1.05, label: "Average" },
  "939": { name: "Salinas, CA",           multiplier: 1.20, label: "Above Average" },
  "940": { name: "San Francisco, CA",     multiplier: 1.55, label: "Very High Cost" },
  "941": { name: "San Francisco, CA",     multiplier: 1.55, label: "Very High Cost" },
  "942": { name: "Sacramento, CA",        multiplier: 1.18, label: "Above Average" },
  "943": { name: "Palo Alto, CA",         multiplier: 1.55, label: "Very High Cost" },
  "944": { name: "San Jose, CA",          multiplier: 1.48, label: "Very High Cost" },
  "945": { name: "Oakland, CA",           multiplier: 1.42, label: "High Cost" },
  "946": { name: "Oakland, CA",           multiplier: 1.42, label: "High Cost" },
  "947": { name: "Berkeley, CA",          multiplier: 1.45, label: "High Cost" },
  "948": { name: "Richmond, CA",          multiplier: 1.35, label: "High Cost" },
  "949": { name: "San Mateo, CA",         multiplier: 1.48, label: "Very High Cost" },
  "950": { name: "San Jose, CA",          multiplier: 1.45, label: "High Cost" },
  "951": { name: "San Jose, CA",          multiplier: 1.45, label: "High Cost" },
  "952": { name: "Stockton, CA",          multiplier: 1.10, label: "Above Average" },
  "953": { name: "Stockton, CA",          multiplier: 1.10, label: "Above Average" },
  "954": { name: "Santa Rosa, CA",        multiplier: 1.28, label: "Above Average" },
  "955": { name: "Eureka, CA",            multiplier: 1.10, label: "Above Average" },
  "956": { name: "Sacramento, CA",        multiplier: 1.18, label: "Above Average" },
  "957": { name: "Sacramento, CA",        multiplier: 1.18, label: "Above Average" },
  "958": { name: "Sacramento, CA",        multiplier: 1.18, label: "Above Average" },
  "959": { name: "Marysville, CA",        multiplier: 1.08, label: "Average" },
  "960": { name: "Redding, CA",           multiplier: 1.05, label: "Average" },
  "961": { name: "Reno area, CA/NV",      multiplier: 1.05, label: "Average" },
  // ── OREGON ───────────────────────────────────────────────────────────────
  "970": { name: "Portland, OR",          multiplier: 1.20, label: "Above Average" },
  "971": { name: "Portland, OR",          multiplier: 1.20, label: "Above Average" },
  "972": { name: "Portland, OR",          multiplier: 1.20, label: "Above Average" },
  "973": { name: "Salem, OR",             multiplier: 1.05, label: "Average" },
  "974": { name: "Salem, OR",             multiplier: 1.05, label: "Average" },
  "975": { name: "Medford, OR",           multiplier: 1.03, label: "Average" },
  "976": { name: "Klamath Falls, OR",     multiplier: 0.97, label: "Average" },
  "977": { name: "Bend, OR",              multiplier: 1.08, label: "Average" },
  "978": { name: "Corvallis, OR",         multiplier: 1.05, label: "Average" },
  "979": { name: "Eugene, OR",            multiplier: 1.05, label: "Average" },
  // ── WASHINGTON ───────────────────────────────────────────────────────────
  "980": { name: "Seattle, WA",           multiplier: 1.28, label: "Above Average" },
  "981": { name: "Seattle, WA",           multiplier: 1.28, label: "Above Average" },
  "982": { name: "Seattle, WA",           multiplier: 1.28, label: "Above Average" },
  "983": { name: "Tacoma, WA",            multiplier: 1.12, label: "Above Average" },
  "984": { name: "Tacoma, WA",            multiplier: 1.12, label: "Above Average" },
  "985": { name: "Tacoma, WA",            multiplier: 1.12, label: "Above Average" },
  "986": { name: "Olympia, WA",           multiplier: 1.10, label: "Above Average" },
  "988": { name: "Wenatchee, WA",         multiplier: 1.00, label: "Average" },
  "989": { name: "Yakima, WA",            multiplier: 0.98, label: "Average" },
  "990": { name: "Spokane, WA",           multiplier: 1.00, label: "Average" },
  "991": { name: "Spokane, WA",           multiplier: 1.00, label: "Average" },
  "992": { name: "Spokane, WA",           multiplier: 1.00, label: "Average" },
  "993": { name: "Richland, WA",          multiplier: 1.00, label: "Average" },
  "994": { name: "Clarkston, WA",         multiplier: 0.97, label: "Average" },
  // ── ALASKA ───────────────────────────────────────────────────────────────
  "995": { name: "Anchorage, AK",         multiplier: 1.55, label: "Very High Cost" },
  "996": { name: "Anchorage, AK",         multiplier: 1.55, label: "Very High Cost" },
  "997": { name: "Fairbanks, AK",         multiplier: 1.60, label: "Very High Cost" },
  "998": { name: "Juneau, AK",            multiplier: 1.65, label: "Very High Cost" },
  "999": { name: "Ketchikan, AK",         multiplier: 1.65, label: "Very High Cost" },
  // ── HAWAII ───────────────────────────────────────────────────────────────
  "967": { name: "Honolulu, HI",          multiplier: 1.65, label: "Very High Cost" },
  "968": { name: "Honolulu, HI",          multiplier: 1.65, label: "Very High Cost" },
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
  const [votes, setVotes]                 = useState({}); // { "Oil Change": "up" | "down" }

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

                  {/* Helpful vote */}
                  <div style={{ marginTop:"16px", display:"flex", alignItems:"center", gap:"10px" }}>
                    <span style={{ fontSize:"12px", color:"#555" }}>Were these prices helpful?</span>
                    <button onClick={e => { e.stopPropagation(); setVotes(v => ({ ...v, [name]: "up" })); }} style={{ background: votes[name]==="up" ? "#22c55e22" : "transparent", border:`1px solid ${votes[name]==="up" ? "#22c55e" : "#2a2a2a"}`, borderRadius:"6px", padding:"5px 12px", fontSize:"13px", color: votes[name]==="up" ? "#22c55e" : "#555", cursor:"pointer", fontFamily:"inherit" }}>
                      👍 {votes[name]==="up" ? "Thanks!" : "Yes"}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setVotes(v => ({ ...v, [name]: "down" })); }} style={{ background: votes[name]==="down" ? "#ef444422" : "transparent", border:`1px solid ${votes[name]==="down" ? "#ef4444" : "#2a2a2a"}`, borderRadius:"6px", padding:"5px 12px", fontSize:"13px", color: votes[name]==="down" ? "#ef4444" : "#555", cursor:"pointer", fontFamily:"inherit" }}>
                      👎 {votes[name]==="down" ? "Got it" : "No"}
                    </button>
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

      <footer style={{ borderTop:"1px solid #1a1a1a", padding:"32px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"16px", fontWeight:"400", color:"#f0ede6", letterSpacing:"-0.01em", marginBottom:"8px" }}>
          Repair<span style={{ color:"#c9a84c", fontStyle:"italic" }}>IQ</span>
        </div>
        <div style={{ fontSize:"12px", color:"#444", marginBottom:"6px" }}>
          Cost estimates are based on researched national averages and are updated periodically — not real-time data.
        </div>
        <div style={{ fontSize:"11px", color:"#2a2a2a" }}>
          Not affiliated with any repair facility · Always get multiple quotes · © 2026 RepairIQ
        </div>
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
