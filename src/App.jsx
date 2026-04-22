import { useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { inject } from "@vercel/analytics";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
inject(); // Vercel Analytics
const supabase = createClient(
  "https://bgulreqwhlsqlglivrbb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndWxyZXF3aGxzcWxnbGl2cmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDIyNDYsImV4cCI6MjA5MTIxODI0Nn0.LVmTb7YpjF1GlT2uPipzB4g6aqPzTLIxwbqqbkjZPfM"
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const repairData = {

  // ── MAINTENANCE ──────────────────────────────────────────────────────────
  "Oil Change": {
    icon: "🛢️", category: "Maintenance", trimSensitive: false, iceOnly: true,
    costs: {
      "Conventional": { low: 35, high: 75 },
      "Synthetic Blend": { low: 55, high: 100 },
      "Full Synthetic": { low: 75, high: 130 },
    },
    labor: "0.5–1 hr",
    notes: "KBB: conventional $35–$75, full synthetic $65–$125. Dealerships typically charge $100–$130 for synthetic.",
  },
  "Tire Rotation": {
    icon: "🔄", category: "Maintenance", trimSensitive: false,
    costs: {
      "Standard": { low: 20, high: 50 },
      "With Balance": { low: 80, high: 130 },
    },
    labor: "0.5 hr",
    notes: "Often free or discounted with tire purchase. Recommended every 5–7k miles.",
  },
  "Cabin Air Filter": {
    icon: "🌬️", category: "Maintenance", trimSensitive: false,
    costs: {
      "Basic": { low: 30, high: 65 },
      "HEPA/Premium": { low: 55, high: 95 },
    },
    labor: "0.25 hr",
    notes: "National average ~$95 in 2026. Very DIY-friendly — often under 5 minutes on most vehicles.",
  },
  "Engine Air Filter": {
    icon: "🌪️", category: "Maintenance", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 25, high: 60 }, "Performance": { low: 50, high: 85 } },
    labor: "0.25 hr",
    notes: "National average ~$83 in 2026. DIY-friendly on most vehicles. Replace every 15–30k miles.",
  },
  "Wiper Blades": {
    icon: "🌧️", category: "Maintenance", trimSensitive: false,
    costs: {
      "Economy (pair)": { low: 25, high: 55 },
      "Premium Beam (pair)": { low: 60, high: 100 },
    },
    labor: "0.25 hr",
    notes: "National average ~$93 in 2026. Most auto parts stores install for free with purchase.",
  },
  "Fuel Filter": {
    icon: "⛽", category: "Maintenance", trimSensitive: false, iceOnly: true,
    costs: {
      "External (inline)": { low: 75, high: 120 },
      "In-tank (with pump)": { low: 220, high: 400 },
    },
    labor: "1–3 hrs",
    notes: "Many modern cars have in-tank filters changed with the fuel pump. Check your service manual.",
  },
  "Tire Replacement (each)": {
    icon: "🛞", category: "Maintenance", trimSensitive: false,
    costs: {
      "Economy": { low: 80, high: 130 },
      "Mid-range": { low: 120, high: 185 },
      "Performance/SUV": { low: 175, high: 310 },
    },
    labor: "0.5 hr per tire",
    notes: "Price per tire including mounting and balancing. Buy 4 for better pricing.",
  },
  "Multi-Point Inspection": {
    icon: "🔍", category: "Maintenance", trimSensitive: false,
    costs: { "Standard": { low: 0, high: 60 } },
    labor: "0.5–1 hr",
    notes: "Often free at dealerships with any service. Standalone inspections typically $40–$75.",
  },

  // ── BRAKES ───────────────────────────────────────────────────────────────
  "Brake Pads (Front)": {
    icon: "🛑", category: "Brakes", trimSensitive: true,
    costs: {
      "Economy": { low: 100, high: 175 },
      "OEM": { low: 150, high: 300 },
      "Performance": { low: 250, high: 400 },
    },
    labor: "1–2 hrs",
    notes: "KBB average ~$150/axle, up to $300 for premium pads. RepairPal: $320–$379 per axle avg.",
  },
  "Brake Pads (Rear)": {
    icon: "🛑", category: "Brakes", trimSensitive: true,
    costs: {
      "Economy": { low: 90, high: 160 },
      "OEM": { low: 130, high: 250 },
      "Performance": { low: 220, high: 360 },
    },
    labor: "1–2 hrs",
    notes: "Rear pads typically 10–20% less than front. Electric parking brakes add labor cost.",
  },
  "Brake Rotors (pair)": {
    icon: "⭕", category: "Brakes", trimSensitive: true,
    costs: {
      "Economy": { low: 100, high: 175 },
      "OEM": { low: 150, high: 270 },
      "Slotted/Drilled": { low: 220, high: 390 },
    },
    labor: "1–2 hrs",
    notes: "KBB: pads + rotors average $250–$400 per axle. Usually replaced in pairs per axle.",
  },
  "Brake Fluid Flush": {
    icon: "💧", category: "Brakes", trimSensitive: false,
    costs: { "Standard": { low: 80, high: 130 } },
    labor: "0.5–1 hr",
    notes: "Recommended every 2 years or 30k miles. Moisture in old fluid lowers boiling point.",
  },
  "Brake Caliper": {
    icon: "🗜️", category: "Brakes", trimSensitive: true,
    costs: {
      "Remanufactured (each)": { low: 150, high: 280 },
      "OEM New (each)": { low: 250, high: 450 },
    },
    labor: "1–2 hrs",
    notes: "Seized calipers cause uneven wear or pulling. Often diagnosed during pad inspection.",
  },

  // ── ENGINE ────────────────────────────────────────────────────────────────
  "Spark Plugs": {
    icon: "⚡", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Copper (4-cyl)": { low: 80, high: 150 },
      "Iridium (4-cyl)": { low: 140, high: 250 },
      "V6/V8 Upcharge": { low: 200, high: 440 },
    },
    labor: "1–3 hrs",
    notes: "RepairPal national average $150–$300. V8 trucks like F-150 average $328–$438.",
  },
  "Timing Belt": {
    icon: "🔁", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Belt Only": { low: 300, high: 500 },
      "With Water Pump": { low: 500, high: 900 },
    },
    labor: "4–8 hrs",
    notes: "AAA range $400–$900. Many modern vehicles use timing chains instead. Critical safety service.",
  },
  "Timing Chain": {
    icon: "⛓️", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 900, high: 1800 } },
    labor: "6–12 hrs",
    notes: "Labor-intensive. Rattling on startup is a warning sign — don't ignore it.",
  },
  "Coolant Flush": {
    icon: "🧊", category: "Engine", trimSensitive: false,
    costs: { "Standard": { low: 100, high: 200 } },
    labor: "1 hr",
    notes: "KBB average $131–$209. Recommended every 30k–50k miles or 2–5 years.",
  },
  "Thermostat Replacement": {
    icon: "🌡️", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 150, high: 275 } },
    labor: "1–2 hrs",
    notes: "Often replaced with coolant flush. Symptoms include overheating or no heat in cabin.",
  },
  "Water Pump": {
    icon: "💧", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Standard": { low: 300, high: 600 },
      "With Timing Belt": { low: 500, high: 900 },
    },
    labor: "2–5 hrs",
    notes: "Often replaced simultaneously with timing belt since access requires similar disassembly.",
  },
  "Head Gasket": {
    icon: "🔩", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 1400, high: 3000 } },
    labor: "8–16 hrs",
    notes: "RepairPal average $2,475–$3,246. Signs include white exhaust smoke or milky oil.",
  },
  "Valve Cover Gasket": {
    icon: "🔩", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "4-cylinder": { low: 210, high: 350 },
      "V6/V8": { low: 350, high: 580 },
    },
    labor: "1–3 hrs",
    notes: "RepairPal average $336–$461. Toyota Corolla ~$212–$290; V6 trucks $481–$699.",
  },
  "Intake Manifold Gasket": {
    icon: "🔩", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 300, high: 600 } },
    labor: "2–4 hrs",
    notes: "Coolant or vacuum leaks often indicate this gasket is failing.",
  },
  "PCV Valve": {
    icon: "🔩", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 40, high: 90 } },
    labor: "0.25–0.5 hr",
    notes: "Cheap and often overlooked. A clogged PCV can cause rough idle and oil leaks.",
  },

  // ── ELECTRICAL ────────────────────────────────────────────────────────────
  "Battery Replacement": {
    icon: "🔋", category: "Electrical", trimSensitive: false,
    costs: {
      "Standard": { low: 120, high: 220 },
      "AGM/Premium": { low: 200, high: 350 },
    },
    labor: "0.5 hr",
    notes: "Most replacements run $120–$300 including installation. Some vehicles require computer reset.",
  },
  "Alternator": {
    icon: "⚡", category: "Electrical", trimSensitive: true, iceOnly: true,
    costs: {
      "Remanufactured": { low: 400, high: 650 },
      "OEM New": { low: 600, high: 1000 },
    },
    labor: "2–4 hrs",
    notes: "RepairPal $563–$767; KBB $747–$842. Luxury/performance vehicles can exceed $1,200.",
  },
  "Starter Motor": {
    icon: "🔑", category: "Electrical", trimSensitive: true, iceOnly: true,
    costs: {
      "Remanufactured": { low: 250, high: 430 },
      "OEM New": { low: 350, high: 600 },
    },
    labor: "1–3 hrs",
    notes: "Clicking sounds when turning the key are a common symptom of a failing starter.",
  },
  "Fuse Replacement": {
    icon: "🔌", category: "Electrical", trimSensitive: false,
    costs: { "Standard": { low: 15, high: 50 } },
    labor: "0.25 hr",
    notes: "Often DIY-friendly. Fuse box locations vary — check your owner's manual.",
  },
  "Oxygen Sensor": {
    icon: "📡", category: "Electrical", trimSensitive: true, iceOnly: true,
    costs: {
      "Single sensor": { low: 200, high: 400 },
      "All sensors (4-cyl)": { low: 400, high: 800 },
    },
    labor: "0.5–1 hr each",
    notes: "RepairPal average $434–$537 per sensor. P0130–P0167 codes are the most common trigger.",
  },
  "Mass Air Flow Sensor": {
    icon: "🌬️", category: "Electrical", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 150, high: 320 } },
    labor: "0.5–1 hr",
    notes: "Try cleaning with MAF cleaner spray ($10–$20) before replacing. Often resolves the issue.",
  },
  "Ignition Coil": {
    icon: "⚡", category: "Electrical", trimSensitive: true, iceOnly: true,
    costs: {
      "Single coil": { low: 100, high: 250 },
      "Full set (4-cyl)": { low: 280, high: 500 },
    },
    labor: "0.5–1.5 hrs",
    notes: "RepairPal average $231–$333 per coil. Misfires and rough idle are the main symptoms.",
  },

  // ── SUSPENSION & STEERING ─────────────────────────────────────────────────
  "Wheel Alignment": {
    icon: "🎯", category: "Suspension", trimSensitive: true,
    costs: {
      "2-Wheel": { low: 50, high: 100 },
      "4-Wheel": { low: 100, high: 175 },
    },
    labor: "1 hr",
    notes: "Jiffy Lube: 2-wheel $50–$75, 4-wheel $100–$168. RepairPal certified shops $189–$277.",
  },
  "Shock Absorbers (pair)": {
    icon: "🌀", category: "Suspension", trimSensitive: true,
    costs: {
      "Economy": { low: 250, high: 450 },
      "OEM/Performance": { low: 400, high: 700 },
    },
    labor: "1–3 hrs",
    notes: "RepairPal average $1,057–$1,260 for all four. Per-axle pair shown here.",
  },
  "Strut Assembly (pair)": {
    icon: "🌀", category: "Suspension", trimSensitive: true,
    costs: {
      "Economy": { low: 350, high: 600 },
      "OEM": { low: 550, high: 950 },
    },
    labor: "2–4 hrs",
    notes: "Quick-strut assemblies cost more but save labor. Alignment required after replacement.",
  },
  "Sway Bar Links": {
    icon: "🔗", category: "Suspension", trimSensitive: false,
    costs: { "Per side": { low: 80, high: 150 } },
    labor: "0.5–1 hr",
    notes: "RepairPal average $103–$143 per side. Clunking over bumps is the main symptom.",
  },
  "Ball Joint": {
    icon: "🎱", category: "Suspension", trimSensitive: true,
    costs: {
      "Per joint": { low: 150, high: 300 },
      "Both sides": { low: 280, high: 560 },
    },
    labor: "1–3 hrs",
    notes: "RepairPal average $248–$339 per joint. Alignment required after replacement.",
  },
  "Power Steering Fluid Flush": {
    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"9\"/><line x1=\"3.5\" y1=\"17\" x2=\"9.5\" y2=\"13.5\"/><line x1=\"20.5\" y1=\"17\" x2=\"14.5\" y2=\"13.5\"/></svg>", category: "Suspension", trimSensitive: false,
    costs: { "Standard": { low: 80, high: 140 } },
    labor: "0.5 hr",
    notes: "Not all vehicles have hydraulic power steering — electric systems don't need this service.",
  },
  "Tie Rod End": {
    icon: "↔️", category: "Suspension", trimSensitive: false,
    costs: {
      "Inner or outer (each)": { low: 100, high: 220 },
      "Both sides": { low: 200, high: 400 },
    },
    labor: "1–2 hrs",
    notes: "RepairPal ~$257 per tie rod. Alignment is required after any tie rod replacement.",
  },

  // ── DRIVETRAIN ────────────────────────────────────────────────────────────
  "Transmission Fluid": {
    icon: "🔄", category: "Drivetrain", trimSensitive: false,
    costs: {
      "Drain & Fill": { low: 80, high: 175 },
      "Full Flush": { low: 150, high: 290 },
    },
    labor: "0.5–1 hr",
    notes: "KBB: drain & fill $150–$175, flush $165–$290. CVT fluid services run 20–30% higher.",
  },
  "CV Axle/Halfshaft": {
    icon: "↔️", category: "Drivetrain", trimSensitive: true,
    costs: {
      "Remanufactured (each)": { low: 200, high: 380 },
      "OEM New (each)": { low: 350, high: 600 },
    },
    labor: "1–3 hrs",
    notes: "Clicking sounds during turns or vibration under acceleration are key symptoms.",
  },
  "Differential Fluid": {
    icon: "⚙️", category: "Drivetrain", trimSensitive: false,
    costs: {
      "Front or rear": { low: 80, high: 150 },
      "Front + rear": { low: 150, high: 275 },
    },
    labor: "0.5–1 hr",
    notes: "AWD and 4WD vehicles often have multiple differentials. Check your service schedule.",
  },
  "Transfer Case Service": {
    icon: "⚙️", category: "Drivetrain", trimSensitive: false,
    costs: { "Standard": { low: 100, high: 190 } },
    labor: "0.5–1 hr",
    notes: "Applies to 4WD and AWD vehicles only. Often overlooked in routine maintenance.",
  },
  "Clutch Replacement": {
    icon: "🦶", category: "Drivetrain", trimSensitive: true,
    costs: {
      "Economy": { low: 600, high: 1000 },
      "OEM/Performance": { low: 900, high: 1800 },
    },
    labor: "4–8 hrs",
    notes: "Manual transmission only. Slipping, burning smell, or difficulty shifting are symptoms.",
  },

  // ── HVAC ─────────────────────────────────────────────────────────────────
  "AC Recharge": {
    icon: "❄️", category: "HVAC", trimSensitive: false,
    costs: {
      "Standard R-134a": { low: 150, high: 300 },
      "R-1234yf (newer cars)": { low: 250, high: 500 },
    },
    labor: "1 hr",
    notes: "If a leak is present, expect additional $200–$800+ for repair. Leak test recommended.",
  },
  "AC Compressor": {
    icon: "❄️", category: "HVAC", trimSensitive: true,
    costs: {
      "Remanufactured": { low: 500, high: 900 },
      "OEM New": { low: 800, high: 1500 },
    },
    labor: "2–4 hrs",
    notes: "System must be evacuated and recharged after replacement. Often includes receiver/dryer.",
  },
  "Heater Core": {
    icon: "🔥", category: "HVAC", trimSensitive: true,
    costs: { "Standard": { low: 600, high: 1200 } },
    labor: "5–10 hrs",
    notes: "Labor-intensive — requires dashboard removal on most vehicles. Foggy windshield or sweet smell are signs.",
  },

  // ── BODY / GLASS ─────────────────────────────────────────────────────────
  "Windshield Replacement": {
    icon: "🪟", category: "Maintenance", trimSensitive: false, yearSensitive: true,
    costs: {
      "Standard (no ADAS)":       { low: 250,  high: 600  },
      "With ADAS Recalibration":  { low: 500,  high: 1200 },
      "Luxury / OEM Glass":       { low: 800,  high: 1800 },
    },
    labor: "1–3 hrs",
    notes: "Standard glass $250–$600. 85% of 2023+ vehicles require ADAS recalibration ($300–$600 extra) after replacement. Many comprehensive insurance policies cover windshield with no deductible — check before paying out of pocket.",
  },

  // ── ENGINE ────────────────────────────────────────────────────────────────
  "Serpentine Belt": {
    icon: "🔁", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: {
      "Belt Only":          { low: 100, high: 200 },
      "Belt + Tensioner":   { low: 200, high: 380 },
    },
    labor: "0.5–1.5 hrs",
    notes: "RepairPal average $84–$231 depending on vehicle. Replace every 60–100k miles. A snapping belt leaves you stranded instantly — replace at first signs of cracking or squealing.",
  },
  "Radiator Replacement": {
    icon: "♨️", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Economy/Import":   { low: 700,  high: 1200 },
      "Domestic/Truck":   { low: 900,  high: 1500 },
      "Luxury/European":  { low: 1200, high: 1900 },
    },
    labor: "2–4 hrs",
    notes: "RepairPal average $1,042–$1,196. Always pressure-test the full cooling system during replacement. Consider replacing hoses, thermostat, and coolant at the same time to avoid a repeat job.",
  },
  "Fuel Pump Replacement": {
    icon: "⛽", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "In-tank (most vehicles)":  { low: 900,  high: 1500 },
      "High-pressure (truck/V8)": { low: 1200, high: 1800 },
    },
    labor: "2–4 hrs",
    notes: "RepairPal average $1,247–$1,506. Symptoms: hard starts, sputtering at speed, sudden stall. Replace fuel filter at same time. Diagnosis is important — similar symptoms can come from a fuel relay or clogged filter.",
  },
  "Catalytic Converter": {
    icon: "🏭", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Economy/Direct-fit":   { low: 800,  high: 1800 },
      "V6/V8 or Dual":        { low: 1500, high: 3500 },
      "Luxury/European":      { low: 2500, high: 5500 },
    },
    labor: "1–3 hrs",
    notes: "RepairPal range $936–$5,460 depending on make. Toyota/Honda converters are expensive due to higher precious metal content. California CARB-compliant converters cost more. Confirm it's actually failed (O2 sensors can mimic symptoms) before replacing.",
  },
  "Oil Pump Replacement": {
    icon: "🛢️", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 1200, high: 2200 } },
    labor: "4–8 hrs",
    notes: "RepairPal average $1,569–$2,099. Low oil pressure warning light is the main trigger. Verify with a mechanical gauge before replacing — a faulty oil pressure sensor ($50–$150) is a much cheaper fix and can show identical symptoms.",
  },

  // ── DRIVETRAIN ────────────────────────────────────────────────────────────
  "Transmission Rebuild / Replacement": {
    icon: "⚙️", category: "Drivetrain", trimSensitive: true,
    costs: {
      "Rebuild (manual)":         { low: 1500, high: 3500 },
      "Rebuild (automatic)":      { low: 2500, high: 5000 },
      "Remanufactured unit":      { low: 3500, high: 6500 },
      "New OEM replacement":      { low: 5000, high: 8500 },
    },
    labor: "8–15 hrs",
    notes: "RepairPal average $5,700–$6,259 for full replacement. Get a diagnosis first — fluid service, solenoid, or valve body repairs ($300–$1,200) can fix many issues without a full rebuild. CVTs and DCTs trend toward the higher end.",
  },

  // ── SUSPENSION & STEERING ─────────────────────────────────────────────────
  "Wheel Bearing / Hub Assembly": {
    icon: "⭕", category: "Suspension", trimSensitive: false,
    costs: {
      "Standard (bolt-on hub)":   { low: 300, high: 550 },
      "Press-fit / AWD / Truck":  { low: 450, high: 750 },
    },
    labor: "1.5–3 hrs",
    notes: "RepairPal average $343–$504. Symptom: humming or rumbling noise that changes pitch when swerving. Front bearings typically cost 15–20% more than rear. ABS relearn may be required after replacement ($50–$150 extra at some shops).",
  },
  "Control Arm Replacement": {
    icon: "🦾", category: "Suspension", trimSensitive: false,
    costs: {
      "Single arm (aftermarket)": { low: 350, high: 600  },
      "Single arm (OEM)":         { low: 500, high: 900  },
      "Both front arms":          { low: 700, high: 1500 },
    },
    labor: "1.5–3 hrs per arm",
    notes: "Wheel alignment ($100–$175) is always required after control arm replacement. Symptoms include clunking over bumps, pulling, or uneven tire wear. Often combined with ball joint or bushing replacement.",
  },
  "Power Steering Rack (Rack & Pinion)": {
    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"9\"/><line x1=\"3.5\" y1=\"17\" x2=\"9.5\" y2=\"13.5\"/><line x1=\"20.5\" y1=\"17\" x2=\"14.5\" y2=\"13.5\"/></svg>", category: "Suspension", trimSensitive: true,
    costs: {
      "Remanufactured":   { low: 1200, high: 2000 },
      "OEM New":          { low: 1800, high: 3000 },
    },
    labor: "3–6 hrs",
    notes: "RepairPal average $2,027–$2,452. Symptoms: stiff steering, fluid leak, clunking while turning. Many modern vehicles require sub-frame removal — verify diagnosis before committing. Alignment required after replacement.",
  },
  "Power Steering Pump": {
    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"9\"/><line x1=\"3.5\" y1=\"17\" x2=\"9.5\" y2=\"13.5\"/><line x1=\"20.5\" y1=\"17\" x2=\"14.5\" y2=\"13.5\"/></svg>", category: "Suspension", trimSensitive: false, iceOnly: true,
    costs: {
      "Remanufactured":   { low: 500, high: 800  },
      "OEM New":          { low: 700, high: 1000 },
    },
    labor: "1.5–3 hrs",
    notes: "RepairPal average $699–$925. Symptoms: whining noise when turning, heavy steering, fluid leak. Replace hoses and fluid reservoir at same time to prevent repeat failures.",
  },

  // ── ELECTRICAL ────────────────────────────────────────────────────────────
  "Wheel Speed Sensor (ABS)": {
    icon: "🔄", category: "Electrical", trimSensitive: false,
    costs: { "Standard (per sensor)": { low: 200, high: 400 } },
    labor: "0.5–1.5 hrs",
    notes: "ABS warning light and traction control light are the main symptoms. Diagnosis important — tone ring damage or wiring issues can mimic a bad sensor at lower cost. YourMechanic average $150–$350 per sensor.",
  },
  "TPMS Sensor (per tire)": {
    icon: "🛞", category: "Electrical", trimSensitive: false,
    costs: {
      "Aftermarket (each)": { low: 50,  high: 150 },
      "OEM (each)":         { low: 100, high: 250 },
      "All 4 sensors":      { low: 250, high: 700 },
    },
    labor: "0.5 hr per sensor",
    notes: "KBB average $314–$368 for all 4. Sensors last 5–7 years (battery-limited). Programming/relearn required after replacement ($25–$50 per sensor at most shops). Required on all US vehicles since 2007.",
  },
  "Crankshaft Position Sensor": {
    icon: "⚙️", category: "Electrical", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 175, high: 350 } },
    labor: "0.5–2 hrs",
    notes: "P0335/P0336 are the most common codes. Symptoms: no-start, intermittent stall, rough running. Location varies widely — some are a 15-minute job, others require intake manifold removal.",
  },
  "Throttle Body Cleaning / Replacement": {
    icon: "💨", category: "Electrical", trimSensitive: false, iceOnly: true,
    costs: {
      "Cleaning":     { low: 100, high: 200 },
      "Replacement":  { low: 300, high: 700 },
    },
    labor: "0.5–1.5 hrs",
    notes: "Carbon buildup causes rough idle, hesitation, or stalling — cleaning often resolves it without replacement. Electronic throttle bodies (drive-by-wire) require relearn procedure after cleaning or replacement.",
  },



  // ── BRAKES ───────────────────────────────────────────────────────────────
  "Brake Master Cylinder": {
    icon: "🔩", category: "Brakes", trimSensitive: true,
    costs: { "Standard": { low: 400, high: 750 } },
    labor: "1.5–3 hrs",
    notes: "RepairPal average $586–$721. Symptoms: spongy pedal, pedal sinking to floor, no external leaks. Safety-critical — don't drive. Brake system flush recommended at same time.",
  },
  "Brake Lines / Hose": {
    icon: "〰️", category: "Brakes", trimSensitive: false,
    costs: {
      "Single rubber hose": { low: 150, high: 300 },
      "Steel line section":  { low: 200, high: 500 },
      "Full system reline":  { low: 600, high: 1500 },
    },
    labor: "1–4 hrs",
    notes: "Rubber hoses swell and collapse internally — can cause dragging brakes. Steel lines rust from inside out. Common in salt-belt states on vehicles over 10 years old. System flush required after any line work.",
  },
  "ABS Module / Pump": {
    icon: "🖥️", category: "Brakes", trimSensitive: true,
    costs: {
      "Refurbished module": { low: 600,  high: 1200 },
      "New OEM module":     { low: 1000, high: 1800 },
    },
    labor: "1.5–3 hrs",
    notes: "RepairPal parts avg $1,033–$1,052 + $150–$223 labor. ABS and traction control lights are main symptoms. Confirm diagnosis — wheel speed sensors and wiring issues are cheaper and often the real cause.",
  },

  // ── ENGINE ────────────────────────────────────────────────────────────────
  "Camshaft Position Sensor": {
    icon: "📡", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 175, high: 350 } },
    labor: "0.5–1.5 hrs",
    notes: "RepairPal average $214–$321. P0340–P0349 are the common codes. Symptoms: rough start, stall, misfires. Location varies — some are a 15-min job, others require more disassembly. Computer relearn after replacement.",
  },
  "Engine Mount Replacement": {
    icon: "🔩", category: "Engine", trimSensitive: true,
    costs: {
      "Single standard mount":    { low: 300,  high: 600  },
      "Hydraulic / active mount": { low: 400,  high: 900  },
      "All mounts (set)":         { low: 700,  high: 1500 },
    },
    labor: "1–3 hrs per mount",
    notes: "Jerry avg $487–$535 per standard mount. Symptoms: excessive vibration, clunking on acceleration, engine movement. Often replaced in sets. Oil leaks can accelerate mount deterioration.",
  },
  "Turbocharger Replacement": {
    icon: "💨", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Rebuilt / remanufactured": { low: 1000, high: 2500 },
      "New aftermarket":          { low: 1500, high: 3500 },
      "New OEM / performance":    { low: 2500, high: 6000 },
    },
    labor: "4–10 hrs",
    notes: "Labor adds $700–$1,500+. Total replacement $2,000–$4,000 for most vehicles, up to $7,000+ for twin-turbo or performance cars. Symptoms: blue/black smoke, whine, power loss. Always fix root cause (oil starvation, carbon buildup) or new turbo will fail again.",
  },
  "Exhaust Manifold": {
    icon: "💨", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Gasket only":       { low: 350,  high: 600  },
      "Full replacement":  { low: 900,  high: 1800 },
    },
    labor: "2–5 hrs",
    notes: "RepairPal gasket avg $386–$551; full manifold $1,430–$1,639. Ticking noise on cold start that fades when warm is the classic symptom. Exhaust smell in cabin is a safety concern — address promptly.",
  },
  "Oil Pan Gasket": {
    icon: "🛢️", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: { "Standard": { low: 400, high: 800 } },
    labor: "2–5 hrs",
    notes: "RepairPal average $553–$759. Oil spot on driveway is main symptom. Some vehicles require subframe removal — adds significant labor. Replace drain plug and inspect motor mounts while accessible.",
  },
  "Fuel Injector Replacement": {
    icon: "💉", category: "Engine", trimSensitive: true, iceOnly: true,
    costs: {
      "Single injector":    { low: 250, high: 500  },
      "Full set (4-cyl)":   { low: 600, high: 1000 },
      "Full set (V6/V8)":   { low: 900, high: 1600 },
    },
    labor: "1–4 hrs",
    notes: "RepairPal average $741–$927 for single. Symptoms: rough idle, misfire, poor fuel economy, P0200-series codes. Try professional injector cleaning ($100–$200) first — often resolves partial blockage without replacement.",
  },
  "EVAP System (Purge Valve / Canister)": {
    icon: "💨", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: {
      "Purge valve only": { low: 180, high: 320 },
      "EVAP canister":    { low: 450, high: 650 },
      "Full system":      { low: 500, high: 900 },
    },
    labor: "0.5–2 hrs",
    notes: "P0440–P0457 codes. Gas cap is the cheapest fix — check it first ($10–$25). Purge valve $180–$320, EVAP canister $450–$650 per RepairPal. Smoke test required to pinpoint the actual leak location.",
  },
  "VVT Solenoid (Variable Valve Timing)": {
    icon: "⚙️", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: { "Standard (per solenoid)": { low: 200, high: 600 } },
    labor: "0.5–1.5 hrs",
    notes: "RepairPal average $441–$559. P0010–P0025 codes, rough idle, poor fuel economy are main symptoms. Keep up with oil changes — dirty oil is the #1 cause of VVT solenoid failure.",
  },

  // ── EXHAUST ───────────────────────────────────────────────────────────────
  "Muffler Replacement": {
    icon: "🔇", category: "Engine", trimSensitive: false, iceOnly: true,
    costs: {
      "Aftermarket weld-on": { low: 150, high: 400  },
      "OEM bolt-on":         { low: 400, high: 800  },
      "Full rear section":   { low: 600, high: 1200 },
    },
    labor: "1–2 hrs",
    notes: "RepairPal average $1,077–$1,143 for full OEM system. Loud drone, visible rust holes, dragging exhaust are main symptoms. Aftermarket weld-on mufflers are cheaper but may have shorter lifespan. Replace hangers at same time.",
  },

  // ── DRIVETRAIN ────────────────────────────────────────────────────────────
  "Driveshaft Replacement": {
    icon: "↔️", category: "Drivetrain", trimSensitive: true,
    costs: {
      "Remanufactured": { low: 400, high: 800  },
      "New OEM":        { low: 700, high: 1500 },
    },
    labor: "1–3 hrs",
    notes: "Vibration at highway speed, clunking on acceleration or deceleration are main symptoms. Front or rear depending on drivetrain layout. U-joints often replaced at same time. Alignment recommended after.",
  },
  "U-Joint Replacement": {
    icon: "🔗", category: "Drivetrain", trimSensitive: false,
    costs: { "Standard (per joint)": { low: 200, high: 450 } },
    labor: "1–2 hrs",
    notes: "Clunking or vibration from under the vehicle, worse under load. Often multiple joints replaced at once. Common on trucks and RWD/4WD vehicles. Greaseable U-joints last longer if maintained.",
  },
  "Axle Seal Replacement": {
    icon: "💧", category: "Drivetrain", trimSensitive: false,
    costs: { "Standard (per seal)": { low: 150, high: 350 } },
    labor: "1–2 hrs",
    notes: "Oil leak from differential or transmission end of axle. Often found during brake or bearing inspection. Relatively inexpensive if caught early — ignored leaks lead to differential damage.",
  },

  // ── ELECTRICAL ────────────────────────────────────────────────────────────
  "Fuel Injector Cleaning (Service)": {
    icon: "🧹", category: "Electrical", trimSensitive: false, iceOnly: true,
    costs: {
      "On-car induction clean": { low: 80,  high: 200 },
      "Off-car bench clean":    { low: 150, high: 350 },
    },
    labor: "0.5–1 hr",
    notes: "Try this before replacing injectors — often resolves rough idle, hesitation, and poor fuel economy caused by partial blockage. Recommended every 30k miles on direct injection engines prone to carbon buildup.",
  },
  "MAP Sensor Replacement": {
    icon: "📡", category: "Electrical", trimSensitive: false, iceOnly: true,
    costs: { "Standard": { low: 150, high: 320 } },
    labor: "0.5–1 hr",
    notes: "Manifold Absolute Pressure sensor. P0105–P0108 codes. Symptoms: rough idle, poor fuel economy, black smoke, hard start. Often confused with MAF sensor — confirm which system your vehicle uses before replacing.",
  },
  "EGR Valve Replacement": {
    icon: "🔧", category: "Electrical", trimSensitive: false, iceOnly: true,
    costs: {
      "Cleaning only":  { low: 100, high: 200 },
      "Replacement":    { low: 300, high: 700 },
    },
    labor: "1–2 hrs",
    notes: "Exhaust Gas Recirculation valve. P0400–P0409 codes. Rough idle, check engine light, hesitation. Cleaning often fixes it before full replacement is needed. Common on diesels and older GDI engines.",
  },

  // ── HVAC ─────────────────────────────────────────────────────────────────
  "AC Condenser Replacement": {
    icon: "🧊", category: "HVAC", trimSensitive: true,
    costs: {
      "Condenser only":           { low: 400, high: 900  },
      "With receiver-drier/flush": { low: 600, high: 1200 },
    },
    labor: "2–4 hrs",
    notes: "AC system must be evacuated and recharged after replacement ($100–$200 extra). Condenser is in front of radiator — vulnerable to road debris. If condenser leaked, replace receiver-drier at same time to avoid contaminating new parts.",
  },
  "Blower Motor Replacement": {
    icon: "💨", category: "HVAC", trimSensitive: false,
    costs: {
      "Motor only":              { low: 200, high: 450 },
      "Motor + resistor/module": { low: 300, high: 650 },
    },
    labor: "1–3 hrs",
    notes: "Symptoms: no airflow at one or more fan speeds, loud squealing from vents, or complete loss of cabin airflow. Blower motor resistor ($50–$150) often fails before the motor itself — diagnose this first.",
  },


  "Blend Door Actuator": {
    icon: "🌡️", category: "HVAC", trimSensitive: false,
    costs: { "Standard": { low: 150, high: 350 } },
    labor: "1–3 hrs",
    notes: "Clicking from the dash or stuck temperature control are the main symptoms.",
  },

  // ── EV SYSTEMS ────────────────────────────────────────────────────────────
  "EV: 12V Battery": {
    icon: "🔋", category: "EV Systems", evOnly: true, trimSensitive: false,
    costs: { "Standard": { low: 200, high: 450 } },
    labor: "0.5–1 hr",
    notes: "Tesla 12V: ~$165-200 part + $75-100 labor. Other EVs similar. Total typically $250-450. Fails without warning — common on older Teslas. Can strand vehicle completely.",
  },
  "EV: HV Battery Diagnostic": {
    icon: "🔍", category: "EV Systems", evOnly: true, trimSensitive: false,
    costs: { "Standard": { low: 150, high: 350 } },
    labor: "1–2 hrs",
    notes: "High-voltage battery health scan, BMS fault codes, module analysis. Required before any HV repair. Get this first — many apparent pack failures are actually module-level issues.",
  },
  "EV: Battery Module Repair": {
    icon: "⚡", category: "EV Systems", evOnly: true, trimSensitive: true,
    costs: {
      "Single Module": { low: 1500, high: 5000 },
      "Multiple Modules": { low: 4000, high: 9000 },
    },
    labor: "4–10 hrs",
    notes: "Module-level repair is far cheaper than full pack replacement. Increasingly available at independent EV shops. Most real-world battery failures are module-level, not full pack.",
  },
  "EV: Battery Pack (Compact)": {
    icon: "🔋", category: "EV Systems", evOnly: true, trimSensitive: true,
    costs: {
      "Remanufactured": { low: 6000, high: 10000 },
      "New Pack": { low: 10000, high: 15000 },
    },
    labor: "5–12 hrs",
    notes: "Leaf, Model 3 SR, Bolt EV, Ioniq 5 SR, EV6, etc. Full out-of-warranty replacement. Most packs covered 8 yrs/100k mi — verify warranty status before paying out of pocket.",
  },
  "EV: Battery Pack (Large/Luxury)": {
    icon: "🔋", category: "EV Systems", evOnly: true, trimSensitive: true,
    costs: {
      "Remanufactured": { low: 10000, high: 16000 },
      "New Pack": { low: 14000, high: 22000 },
    },
    labor: "8–15 hrs",
    notes: "Model S/X, large luxury EVs, long-range packs. Module repairs ($3,600-$8,000) are often possible — always get diagnostic first. Labor ~$175-200/hr at Tesla service centers.",
  },
  "EV: Drive Motor / Inverter": {
    icon: "⚙️", category: "EV Systems", evOnly: true, trimSensitive: true,
    costs: {
      "Motor Repair": { low: 2000, high: 5000 },
      "Drive Unit Replacement": { low: 7000, high: 14000 },
    },
    labor: "5–12 hrs",
    notes: "Electric motors are very reliable but inverter failures occur. Tesla drive unit warranty: 8 yrs/100k-150k mi depending on model. Average full replacement ~$8,000.",
  },
  "EV: Charging Port Repair": {
    icon: "🔌", category: "EV Systems", evOnly: true, trimSensitive: false,
    costs: {
      "Door / Actuator": { low: 250, high: 600 },
      "Port Assembly": { low: 500, high: 1200 },
    },
    labor: "1–3 hrs",
    notes: "Charge port door actuator failure is common on older Teslas ($250-600). Full port assembly $500-1,200. Tesla mobile service can often handle at home. On-board charger (OBC) failure is a separate, costlier issue.",
  },
  "EV: On-Board Charger (OBC)": {
    icon: "⚡", category: "EV Systems", evOnly: true, trimSensitive: true,
    costs: { "Replacement": { low: 1000, high: 2500 } },
    labor: "2–5 hrs",
    notes: "Controls AC Level 1 and Level 2 charging. Failure = car can only DC fast charge or not charge at all. DC-DC converter sometimes replaced at same time. Total: $1,000-$2,500.",
  },
  "EV: Thermal Management Service": {
    icon: "🌡️", category: "EV Systems", evOnly: true, trimSensitive: false,
    costs: {
      "Coolant Flush": { low: 150, high: 300 },
      "System Repair": { low: 800, high: 2000 },
    },
    labor: "1–4 hrs",
    notes: "Battery coolant flush every 4-5 years per most manufacturer schedules. Heat pump or battery cooling system repairs $800-$2,000+. Neglecting this accelerates battery degradation.",
  },
  "EV: Annual Service": {
    icon: "✅", category: "EV Systems", evOnly: true, trimSensitive: false,
    costs: { "Standard": { low: 150, high: 300 } },
    labor: "1–2 hrs",
    notes: "EVs have minimal scheduled maintenance. Annual check includes brakes (regen braking extends pad life 2-3x vs. gas cars), tire rotation, HV battery health check, fluid levels, software update.",
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

// Individual model multipliers per make — stacks on top of make multiplier
const modelTiers = {
  "Acura": [
    ["Any Model",1.00],
    ["ILX",0.93],
    ["Integra",0.95],
    ["TL",0.98],
    ["TLX",1.00],
    ["RL",1.05],
    ["RLX",1.08],
    ["RDX",1.05],
    ["MDX",1.10],
    ["ZDX",1.15],
    ["NSX",1.40],
  ],
  "Audi": [
    ["Any Model",1.00],
    ["A3",0.93],
    ["A4",0.95],
    ["A5",0.98],
    ["A6",1.02],
    ["A7",1.08],
    ["A8",1.18],
    ["Q3",0.93],
    ["Q5",1.00],
    ["Q7",1.08],
    ["Q8",1.15],
    ["TT",1.05],
    ["R8",1.40],
    ["S3",1.05],
    ["S4",1.08],
    ["S5",1.10],
    ["S6",1.15],
    ["S7",1.18],
    ["S8",1.25],
    ["RS3",1.18],
    ["RS4",1.20],
    ["RS5",1.22],
    ["RS6",1.28],
    ["RS7",1.30],
    ["e-tron",1.18],
    ["e-tron GT",1.25],
    ["Q4 e-tron",1.12],
  ],
  "BMW": [
    ["Any Model",1.00],
    ["1 Series",0.93],
    ["2 Series",0.95],
    ["3 Series",1.00],
    ["4 Series",1.03],
    ["5 Series",1.10],
    ["6 Series",1.15],
    ["7 Series",1.22],
    ["8 Series",1.28],
    ["X1",0.95],
    ["X2",0.97],
    ["X3",1.00],
    ["X4",1.05],
    ["X5",1.12],
    ["X6",1.15],
    ["X7",1.20],
    ["Z4",1.10],
    ["M2",1.22],
    ["M3",1.28],
    ["M4",1.28],
    ["M5",1.35],
    ["M6",1.35],
    ["M8",1.40],
    ["X3 M",1.25],
    ["X4 M",1.25],
    ["X5 M",1.35],
    ["X6 M",1.35],
    ["i3",1.10],
    ["i4",1.15],
    ["i5",1.18],
    ["i7",1.25],
    ["iX",1.20],
  ],
  "Buick": [
    ["Any Model",1.00],
    ["Encore",0.92],
    ["Encore GX",0.95],
    ["Envision",0.97],
    ["Envista",0.92],
    ["Enclave",1.02],
    ["LaCrosse",0.95],
    ["Regal",0.95],
    ["Verano",0.92],
  ],
  "Cadillac": [
    ["Any Model",1.00],
    ["ATS",0.97],
    ["CT4",0.98],
    ["CT5",1.02],
    ["CTS",1.00],
    ["XTS",1.05],
    ["XT4",0.98],
    ["XT5",1.02],
    ["XT6",1.05],
    ["Escalade",1.22],
    ["Escalade ESV",1.25],
    ["CT4-V Blackwing",1.20],
    ["CT5-V Blackwing",1.25],
    ["Lyriq",1.15],
  ],
  "Chevrolet": [
    ["Any Model",1.00],
    ["Spark",0.85],
    ["Sonic",0.88],
    ["Trax",0.90],
    ["Trailblazer",0.92],
    ["Equinox",0.95],
    ["Malibu",0.93],
    ["Blazer",0.97],
    ["Traverse",1.00],
    ["Tahoe",1.05],
    ["Suburban",1.08],
    ["Colorado",0.97],
    ["Silverado 1500",1.00],
    ["Silverado 2500HD",1.08],
    ["Silverado 3500HD",1.12],
    ["Express",1.00],
    ["Camaro",1.05],
    ["Camaro SS",1.12],
    ["Camaro ZL1",1.25],
    ["Corvette Stingray",1.28],
    ["Corvette Z06",1.38],
    ["Corvette ZR1",1.45],
    ["Bolt EV",1.05],
    ["Bolt EUV",1.05],
    ["Blazer EV",1.08],
    ["Silverado EV",1.10],
  ],
  "Chrysler": [
    ["Any Model",1.00],
    ["200",0.92],
    ["300",1.00],
    ["300 SRT",1.15],
    ["Pacifica",0.95],
    ["Pacifica Hybrid",1.05],
    ["Voyager",0.90],
    ["Aspen",0.97],
  ],
  "Dodge": [
    ["Any Model",1.00],
    ["Dart",0.88],
    ["Neon",0.85],
    ["Avenger",0.90],
    ["Charger",1.00],
    ["Charger R/T",1.05],
    ["Charger Scat Pack",1.15],
    ["Charger Hellcat",1.32],
    ["Charger SRT 392",1.20],
    ["Challenger",1.00],
    ["Challenger R/T",1.05],
    ["Challenger Scat Pack",1.15],
    ["Challenger Hellcat",1.32],
    ["Challenger Demon",1.42],
    ["Durango",1.05],
    ["Durango SRT",1.20],
    ["Durango Hellcat",1.35],
    ["Journey",0.92],
    ["Grand Caravan",0.92],
    ["Viper",1.50],
  ],
  "Ford": [
    ["Any Model",1.00],
    ["Fiesta",0.88],
    ["Focus",0.90],
    ["Fusion",0.93],
    ["Taurus",0.95],
    ["Escape",0.93],
    ["Edge",0.97],
    ["Explorer",1.00],
    ["Expedition",1.05],
    ["Maverick",0.93],
    ["Ranger",0.97],
    ["F-150",1.00],
    ["F-150 Raptor",1.15],
    ["F-250 Super Duty",1.10],
    ["F-350 Super Duty",1.15],
    ["Bronco Sport",0.95],
    ["Bronco",1.05],
    ["EcoSport",0.90],
    ["Mustang EcoBoost",1.05],
    ["Mustang GT",1.10],
    ["Mustang GT500",1.28],
    ["Mustang Mach 1",1.20],
    ["Mustang Dark Horse",1.22],
    ["Mustang Mach-E",1.10],
    ["F-150 Lightning",1.12],
    ["Transit",1.00],
  ],
  "GMC": [
    ["Any Model",1.00],
    ["Terrain",0.95],
    ["Envoy",0.95],
    ["Acadia",1.00],
    ["Envista",0.92],
    ["Canyon",0.97],
    ["Sierra 1500",1.00],
    ["Sierra 2500HD",1.08],
    ["Sierra 3500HD",1.12],
    ["Yukon",1.05],
    ["Yukon XL",1.08],
    ["Sierra Denali",1.12],
    ["Yukon Denali",1.15],
    ["Hummer EV",1.25],
  ],
  "Honda": [
    ["Any Model",1.00],
    ["Fit",0.88],
    ["HR-V",0.90],
    ["Civic",0.92],
    ["Accord",0.97],
    ["Insight",0.95],
    ["CR-V",1.00],
    ["CR-V Hybrid",1.05],
    ["Passport",1.02],
    ["Pilot",1.05],
    ["Ridgeline",1.07],
    ["Odyssey",1.02],
    ["Civic Type R",1.18],
    ["Accord Hybrid",1.05],
    ["Prologue EV",1.10],
  ],
  "Hyundai": [
    ["Any Model",1.00],
    ["Accent",0.88],
    ["Venue",0.88],
    ["Elantra",0.92],
    ["Elantra N",1.10],
    ["Sonata",0.95],
    ["Sonata Hybrid",1.02],
    ["Tucson",0.97],
    ["Tucson Hybrid",1.03],
    ["Santa Fe",1.00],
    ["Santa Fe Hybrid",1.05],
    ["Palisade",1.05],
    ["Kona",0.92],
    ["Kona Electric",1.05],
    ["Ioniq 5",1.10],
    ["Ioniq 6",1.10],
    ["Ioniq 9",1.12],
    ["Veloster N",1.10],
    ["Santa Cruz",1.00],
  ],
  "Infiniti": [
    ["Any Model",1.00],
    ["G35 / G37",0.97],
    ["Q50",1.00],
    ["Q60",1.05],
    ["Q70",1.08],
    ["QX30",0.97],
    ["QX50",1.02],
    ["QX55",1.05],
    ["QX60",1.07],
    ["QX80",1.18],
    ["Q50 Red Sport",1.10],
  ],
  "Jeep": [
    ["Any Model",1.00],
    ["Renegade",0.90],
    ["Compass",0.92],
    ["Cherokee",0.95],
    ["Grand Cherokee",1.05],
    ["Grand Cherokee L",1.08],
    ["Grand Cherokee 4xe",1.12],
    ["Wrangler",1.05],
    ["Wrangler 4xe",1.12],
    ["Wrangler Rubicon",1.10],
    ["Gladiator",1.07],
    ["Grand Wagoneer",1.22],
    ["Trackhawk",1.35],
    ["Commander",0.97],
  ],
  "Kia": [
    ["Any Model",1.00],
    ["Rio",0.87],
    ["Soul",0.90],
    ["Forte",0.90],
    ["K5",0.95],
    ["Stinger",1.10],
    ["Stinger GT",1.15],
    ["Seltos",0.92],
    ["Sportage",0.95],
    ["Sorento",0.97],
    ["Sorento Hybrid",1.03],
    ["Telluride",1.02],
    ["Carnival",0.97],
    ["Niro",0.95],
    ["Niro EV",1.05],
    ["EV6",1.10],
    ["EV6 GT",1.18],
    ["EV9",1.12],
  ],
  "Lexus": [
    ["Any Model",1.00],
    ["CT 200h",0.97],
    ["IS",1.00],
    ["ES",1.02],
    ["GS",1.08],
    ["LS",1.20],
    ["RC",1.10],
    ["LC",1.20],
    ["UX",0.97],
    ["NX",1.02],
    ["RX",1.10],
    ["GX",1.12],
    ["LX",1.25],
    ["IS F",1.15],
    ["RC F",1.20],
    ["GS F",1.22],
    ["LC F",1.28],
    ["RZ EV",1.12],
  ],
  "Lincoln": [
    ["Any Model",1.00],
    ["MKZ",1.00],
    ["MKC",0.98],
    ["MKX",1.02],
    ["MKT",1.05],
    ["Corsair",1.00],
    ["Nautilus",1.05],
    ["Aviator",1.12],
    ["Aviator PHEV",1.18],
    ["Navigator",1.22],
    ["Navigator L",1.25],
    ["Continental",1.12],
  ],
  "Mazda": [
    ["Any Model",1.00],
    ["Mazda2",0.88],
    ["Mazda3",0.92],
    ["Mazda3 Turbo",0.98],
    ["Mazda6",0.95],
    ["CX-3",0.90],
    ["CX-30",0.93],
    ["CX-5",0.97],
    ["CX-50",0.98],
    ["CX-60",1.02],
    ["CX-70",1.03],
    ["CX-80",1.05],
    ["CX-90",1.07],
    ["CX-9",1.02],
    ["MX-5 Miata",1.00],
    ["MX-5 RF",1.03],
    ["MX-30 EV",1.05],
  ],
  "Mercedes-Benz": [
    ["Any Model",1.00],
    ["A-Class",0.93],
    ["B-Class",0.93],
    ["C-Class",1.00],
    ["E-Class",1.08],
    ["S-Class",1.20],
    ["CLA",0.95],
    ["CLS",1.12],
    ["GLA",0.95],
    ["GLB",0.97],
    ["GLC",1.02],
    ["GLE",1.10],
    ["GLS",1.18],
    ["G-Class",1.28],
    ["SL",1.22],
    ["SLC",1.10],
    ["AMG C 63",1.22],
    ["AMG E 63",1.28],
    ["AMG S 63",1.35],
    ["AMG GT",1.38],
    ["AMG GT 63",1.40],
    ["AMG G 63",1.42],
    ["EQB",1.10],
    ["EQC",1.15],
    ["EQE",1.18],
    ["EQS",1.25],
  ],
  "Mitsubishi": [
    ["Any Model",1.00],
    ["Mirage",0.83],
    ["Mirage G4",0.83],
    ["Galant",0.90],
    ["Lancer",0.90],
    ["Eclipse Cross",0.93],
    ["Eclipse Cross PHEV",1.05],
    ["Outlander Sport",0.92],
    ["Outlander",0.95],
    ["Outlander PHEV",1.05],
    ["Endeavor",0.95],
    ["3000GT",1.10],
    ["Lancer Evolution",1.20],
  ],
  "Nissan": [
    ["Any Model",1.00],
    ["Versa",0.87],
    ["Kicks",0.90],
    ["Sentra",0.90],
    ["Altima",0.95],
    ["Maxima",1.00],
    ["Rogue Sport",0.93],
    ["Rogue",0.95],
    ["Murano",1.00],
    ["Pathfinder",1.02],
    ["Armada",1.07],
    ["Frontier",0.97],
    ["Titan",1.05],
    ["370Z",1.15],
    ["400Z",1.18],
    ["GT-R",1.35],
    ["Leaf",1.05],
    ["Ariya EV",1.10],
  ],
  "RAM": [
    ["Any Model",1.00],
    ["ProMaster City",0.92],
    ["ProMaster",0.95],
    ["1500",1.00],
    ["1500 Classic",0.97],
    ["1500 TRX",1.32],
    ["2500",1.10],
    ["3500",1.15],
    ["4500 / 5500",1.20],
  ],
  "Subaru": [
    ["Any Model",1.00],
    ["Impreza",0.93],
    ["Crosstrek",0.95],
    ["Crosstrek Hybrid",1.02],
    ["Legacy",1.00],
    ["Outback",1.00],
    ["Forester",1.00],
    ["Ascent",1.05],
    ["BRZ",1.05],
    ["WRX",1.12],
    ["WRX STI",1.22],
    ["Solterra EV",1.10],
  ],
  "Tesla": [
    ["Any Model",1.00],
    ["Model 3 RWD",0.93],
    ["Model 3 Long Range",0.97],
    ["Model 3 Performance",1.02],
    ["Model Y RWD",0.95],
    ["Model Y Long Range",1.00],
    ["Model Y Performance",1.05],
    ["Model S",1.12],
    ["Model S Plaid",1.20],
    ["Model X",1.18],
    ["Model X Plaid",1.25],
    ["Cybertruck",1.22],
    ["Roadster",1.45],
  ],
  "Toyota": [
    ["Any Model",1.00],
    ["Yaris",0.88],
    ["Corolla",0.90],
    ["Corolla Cross",0.92],
    ["Corolla GR",1.12],
    ["Camry",0.95],
    ["Camry Hybrid",1.02],
    ["Avalon",1.02],
    ["Venza",1.02],
    ["RAV4",0.97],
    ["RAV4 Hybrid",1.03],
    ["RAV4 Prime",1.05],
    ["Highlander",1.00],
    ["Highlander Hybrid",1.05],
    ["4Runner",1.07],
    ["Sequoia",1.12],
    ["Sequoia Hybrid",1.15],
    ["Tacoma",1.05],
    ["Tundra",1.10],
    ["Tundra Hybrid",1.15],
    ["Sienna",1.05],
    ["Land Cruiser",1.22],
    ["GR86",1.10],
    ["GR Corolla",1.12],
    ["GR Supra",1.22],
    ["Prius",1.05],
    ["Prius Prime",1.07],
    ["bZ4X EV",1.10],
    ["Mirai (Hydrogen)",1.25],
  ],
  "Volkswagen": [
    ["Any Model",1.00],
    ["Polo",0.90],
    ["Jetta",0.93],
    ["Jetta GLI",1.02],
    ["Passat",0.97],
    ["Arteon",1.05],
    ["Golf",0.95],
    ["GTI",1.08],
    ["Golf R",1.15],
    ["Taos",0.93],
    ["Tiguan",0.97],
    ["Atlas",1.02],
    ["Atlas Cross Sport",1.02],
    ["ID.4",1.10],
    ["ID.Buzz",1.12],
  ],
  "Volvo": [
    ["Any Model",1.00],
    ["S40",0.95],
    ["S60",1.00],
    ["S60 Recharge",1.10],
    ["S90",1.10],
    ["S90 Recharge",1.18],
    ["V60",1.02],
    ["V60 Cross Country",1.05],
    ["V90",1.10],
    ["V90 Cross Country",1.12],
    ["XC40",1.02],
    ["XC40 Recharge",1.10],
    ["XC60",1.07],
    ["XC60 Recharge",1.15],
    ["XC90",1.15],
    ["XC90 Recharge",1.22],
    ["C40 Recharge",1.10],
    ["Polestar 1",1.28],
    ["Polestar 2",1.18],
  ],
};
// Known issues per model — sourced from RepairPal, CarComplaints, NHTSA complaint database
const knownIssues = {
  "Acura": {
    "TL": [
      { issue: "Power steering hose leaks — fluid drips near rack; steering becomes stiff", years: "2004–2008", severity: "Medium", source: "RepairPal" },
      { issue: "Transmission failure — shuddering, slipping, hard shifts on 5-speed auto", years: "2003–2006", severity: "High", source: "NHTSA/CarComplaints" },
    ],
    "MDX": [
      { issue: "VCM (cylinder deactivation) causes engine vibration and oil consumption", years: "2014–2018", severity: "High", source: "RepairPal/CarComplaints", trims: ["Base", "Technology", "Advance", "Sport Hybrid"] },
      { issue: "Transmission shudder — rough downshift especially from 3rd to 2nd", years: "2001–2006", severity: "High", source: "RepairPal" },
    ],
    "RDX": [
      { issue: "Turbo lag and hesitation on 2.3L turbocharged engine", years: "2007–2012", severity: "Medium", source: "RepairPal", trims: ["Base", "Technology"] },
      { issue: "Water pump seal failure causing coolant leak", years: "2007–2012", severity: "Medium", source: "RepairPal" },
    ],
    "ILX": [
      { issue: "Transmission hesitation and rough shifts on 8-speed DCT", years: "2016–2019", severity: "Medium", source: "CarComplaints" },
    ],
  },
  "Audi": {
    "A4": [["Any Trim",1.0],["1.8T",0.97],["2.8",1.0],["3.0",1.0],["3.2",1.05],["2.0T",0.97],["Premium",0.97],["Premium Plus",1.0],["Prestige",1.05],["allroad Premium",1.03],["allroad Prestige",1.08]],
    "Q5": [
      { issue: "Excessive oil consumption on 2.0T engine — 1 qt per 1,000 miles common", years: "2009–2014", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Timing chain tensioner failure — engine rattle at startup", years: "2009–2012", severity: "High", source: "RepairPal" },
      { issue: "Water pump failure — defective plastic impeller causes overheating", years: "2013–2022", severity: "High", source: "RepairPal" },
      { issue: "Transmission rough shifting and hesitation on DSG", years: "2018–2022", severity: "Medium", source: "CarComplaints", trims: ["Premium", "Premium Plus", "Prestige"] },
    ],
    "Q7": [
      { issue: "Water pump failure — defective plastic impeller", years: "2013–2022", severity: "High", source: "RepairPal" },
      { issue: "Control arm bushing wear — clunking over bumps, premature tire wear", years: "2007–2015", severity: "Medium", source: "RepairPal" },
    ],
    "A6": [
      { issue: "Excessive oil consumption on 3.0T V6 engine", years: "2009–2012", severity: "High", source: "RepairPal", trims: ["Premium Plus", "Prestige"] },
      { issue: "Power window regulator failure — window drops or won't operate", years: "2005–2011", severity: "Low", source: "RepairPal" },
    ],
  },
  "BMW": {
    "3 Series": [["Any Trim",1.0],["318i",0.95],["323i",0.97],["325i",0.97],["325xi",0.97],["325Ci",0.97],["328i",1.0],["328i xDrive",1.02],["328d",1.0],["330i",1.0],["330xi",1.0],["330Ci",1.0],["330e",1.05],["330e xDrive",1.05],["330i xDrive",1.0],["335i",1.08],["335i xDrive",1.1],["335d",1.05],["320i",0.95],["340i",1.08],["340i xDrive",1.1],["M340i",1.12],["M340i xDrive",1.12],["M3",1.25]],
    "5 Series": [
      { issue: "Electric water pump failure — sudden overheating, N52/N55 engines", years: "2006–2016", severity: "High", source: "RepairPal" },
      { issue: "Valve cover gasket and PCV valve oil leaks", years: "2004–2013", severity: "Medium", source: "RepairPal" },
      { issue: "Timing chain guide wear — N63 V8 engine rattle and potential failure", years: "2010–2014", severity: "High", source: "NHTSA", trims: ["550i", "550i xDrive", "M550i xDrive"] },
    ],
    "X3": [
      { issue: "Timing chain guide failure — N20 4-cylinder engine rattle on startup", years: "2012–2015", severity: "High", source: "CarComplaints/NHTSA", trims: ["sDrive30i", "xDrive30i"] },
      { issue: "Oil leaks from valve cover and front engine cover", years: "2011–2018", severity: "Medium", source: "RepairPal" },
      { issue: "Coolant expansion tank crack — coolant loss, overheating risk", years: "2011–2017", severity: "High", source: "RepairPal" },
    ],
    "X5": [
      { issue: "Oil leaks from valve cover gasket — common after 60k miles", years: "2007–2018", severity: "Medium", source: "RepairPal" },
      { issue: "Water pump failure — coolant leak, overheating", years: "2007–2018", severity: "High", source: "RepairPal" },
      { issue: "Timing chain guide wear on N63 V8 — rattle, potential engine damage", years: "2010–2014", severity: "High", source: "NHTSA", trims: ["xDrive50i", "M50i"] },
      { issue: "Transfer case failure — vibration, 4WD malfunction", years: "2007–2013", severity: "High", source: "CarComplaints", trims: ["xDrive40i", "xDrive45e", "M60i"] },
    ],
    "X1": [
      { issue: "Timing chain guide failure — N20 engine, same issue as 3 Series", years: "2013–2015", severity: "High", source: "RepairPal", trims: ["xDrive28i", "sDrive28i"] },
    ],
  },
  "Chevrolet": {
    "Silverado 1500": [
      { issue: "Active Fuel Management (AFM) lifter failure — ticking, oil consumption, misfires on V8", years: "2014–2021", severity: "High", source: "NHTSA/CarComplaints", trims: ["LT", "LTZ", "RST", "Trail Boss", "High Country", "ZR2"] },
      { issue: "Transmission shudder — torque converter shudder at light throttle on 8-speed auto", years: "2015–2019", severity: "Medium", source: "CarComplaints" },
      { issue: "Excessive oil consumption on 5.3L V8 — burning 1+ qt per 1,000 miles", years: "2014–2019", severity: "High", source: "NHTSA", trims: ["LT", "LTZ", "RST", "Trail Boss", "High Country", "ZR2"] },
    ],
    "Colorado": [
      { issue: "8-speed automatic transmission shudder and rough shifting", years: "2017–2019", severity: "Medium", source: "CarComplaints" },
      { issue: "Timing chain stretch on 2.8L Duramax diesel at high mileage", years: "2016–2020", severity: "Medium", source: "RepairPal", trims: ["Z71", "LT"] },
    ],
    "Equinox": [
      { issue: "Timing chain wear — rattle on startup, check engine light on 2.4L engine", years: "2010–2017", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Excessive oil consumption on 2.4L Ecotec — burning 1 qt per 2,000 miles", years: "2010–2017", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "AC compressor failure — warm air, refrigerant leaks", years: "2010–2017", severity: "Medium", source: "RepairPal" },
    ],
    "Malibu": [
      { issue: "Power steering failure — sudden loss of assist on electric system", years: "2013–2016", severity: "High", source: "NHTSA" },
      { issue: "Timing chain stretch on 2.4L Ecotec engine", years: "2013–2017", severity: "High", source: "RepairPal" },
    ],
    "Camaro": [
      { issue: "AFM/DOD lifter failure on V8 engines — ticking, misfire, oil consumption", years: "2010–2021", severity: "High", source: "NHTSA/CarComplaints", trims: ["LT1", "SS", "ZL1"] },
    ],
    "Tahoe": [
      { issue: "Active Fuel Management (AFM) lifter failure on 5.3L V8", years: "2014–2021", severity: "High", source: "NHTSA", trims: ["LT", "Z71", "RST", "Premier", "High Country"] },
      { issue: "Air conditioning compressor failure", years: "2007–2014", severity: "Medium", source: "RepairPal" },
    ],
  },
  "Chrysler": {
    "300": [
      { issue: "TIPM (Totally Integrated Power Module) failure — random electrical faults, no-start", years: "2011–2014", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "Transmission slipping and shudder on 8-speed auto", years: "2012–2015", severity: "Medium", source: "CarComplaints" },
    ],
    "Pacifica": [
      { issue: "Stalling while driving — fuel delivery or PCM fault", years: "2017–2020", severity: "High", source: "NHTSA" },
      { issue: "Uconnect infotainment system freezing, rebooting", years: "2017–2019", severity: "Low", source: "CarComplaints" },
    ],
  },
  "Dodge": {
    "Charger": [["Any Trim",1.0],["SE",0.95],["SXT",0.97],["SXT AWD",1.0],["GT",1.0],["R/T",1.05],["R/T Scat Pack",1.12],["SRT8",1.18],["SRT 392",1.18],["SRT Hellcat",1.25],["SRT Hellcat Redeye",1.28],["Daytona",1.08]],
    "Challenger": [
      { issue: "TIPM failure — same as Charger, electrical issues, no-start", years: "2011–2014", severity: "High", source: "NHTSA" },
      { issue: "Brake fade on base brakes under hard use — undersized for performance trims", years: "2009–2014", severity: "Medium", source: "CarComplaints", trims: ["SXT", "GT"] },
    ],
    "Durango": [
      { issue: "TIPM failure — fuel pump relay failure, random stalling", years: "2011–2014", severity: "High", source: "NHTSA" },
      { issue: "Transmission shudder on 8-speed automatic", years: "2014–2016", severity: "Medium", source: "CarComplaints" },
    ],
    "Grand Caravan": [
      { issue: "Power sliding door failure — door won't open/close electrically", years: "2005–2012", severity: "Medium", source: "RepairPal" },
      { issue: "Transmission failure — harsh shifts, slipping on 4-speed auto", years: "1996–2003", severity: "High", source: "CarComplaints" },
    ],
  },
  "Ford": {
    "F-150": [
      { issue: "Spark plug blowout — plugs eject from 2-valve Triton V8 cylinder head", years: "2000–2008", severity: "High", source: "NHTSA/CarComplaints", trims: ["XL", "XLT", "Lariat", "King Ranch"] },
      { issue: "Phase shifter (cam phaser) rattle — knock on startup on 5.4L Triton V8", years: "2004–2013", severity: "High", source: "RepairPal/CarComplaints", trims: ["XL", "XLT", "Lariat", "King Ranch", "Platinum"] },
      { issue: "Tailgate latch failure — tailgate opens unexpectedly while driving", years: "2004–2014", severity: "Medium", source: "NHTSA" },
      { issue: "EcoBoost 3.5L turbo intercooler condensation causing hesitation and misfires", years: "2011–2014", severity: "Medium", source: "NHTSA", trims: ["XLT", "Lariat", "King Ranch", "Platinum", "Limited"] },
    ],
    "Explorer": [
      { issue: "Exhaust fumes entering cabin — carbon monoxide via defective rear door seals", years: "2011–2017", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "Power steering failure — loss of assist on electric power steering", years: "2011–2017", severity: "High", source: "NHTSA" },
      { issue: "6-speed transmission shudder and delayed engagement", years: "2011–2015", severity: "Medium", source: "CarComplaints" },
    ],
    "Escape": [
      { issue: "Engine fire risk — coolant leak onto hot exhaust on 1.6L EcoBoost", years: "2013–2014", severity: "High", source: "NHTSA recall", trims: ["SE"] },
      { issue: "Power steering failure — sudden loss of electric assist", years: "2013–2016", severity: "High", source: "NHTSA" },
      { issue: "Transmission hesitation and shudder on 6-speed automatic", years: "2013–2016", severity: "Medium", source: "CarComplaints" },
    ],
    "Fusion": [
      { issue: "Door latch failure — door opens while driving, federal safety investigation", years: "2014–2016", severity: "High", source: "NHTSA recall" },
      { issue: "Power steering failure on electric assist system", years: "2010–2012", severity: "High", source: "NHTSA" },
      { issue: "MyFord Touch/Sync infotainment system freezing", years: "2010–2014", severity: "Low", source: "CarComplaints" },
    ],
    "Mustang GT": [
      { issue: "Independent rear suspension (IRS) subframe noise and bushing wear", years: "2015–2020", severity: "Medium", source: "CarComplaints" },
    ],
    "Mustang EcoBoost": [
      { issue: "Oil pan gasket leak on 2.3L EcoBoost", years: "2015–2017", severity: "Medium", source: "RepairPal", trims: ["Base", "Premium"] },
    ],
    "Transit": [
      { issue: "Transmission overheating and shudder on SelectShift 6-speed", years: "2015–2019", severity: "Medium", source: "NHTSA" },
    ],
  },
  "GMC": {
    "Sierra 1500": [
      { issue: "Active Fuel Management (AFM) lifter failure — same as Silverado V8", years: "2014–2021", severity: "High", source: "NHTSA", trims: ["SLE", "SLT", "AT4", "Denali", "AT4X", "Denali Ultimate"] },
      { issue: "Transmission shudder — torque converter shudder on 8-speed auto", years: "2015–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "Acadia": [
      { issue: "Timing chain wear — check engine, rattle on 3.6L V6", years: "2007–2012", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Transmission failure — slipping, delayed engagement on 6-speed", years: "2007–2012", severity: "High", source: "CarComplaints" },
    ],
    "Terrain": [
      { issue: "Timing chain and excessive oil consumption on 2.4L Ecotec", years: "2010–2017", severity: "High", source: "RepairPal" },
    ],
  },
  "Honda": {
    "Accord": [
      { issue: "VCM (Variable Cylinder Management) vibration — shudder at highway speed on V6", years: "2008–2017", severity: "High", source: "CarComplaints/NHTSA", trims: ["V6 Sport", "Touring"] },
      { issue: "Transmission failure on automatic — slipping, hunting gears", years: "1998–2002", severity: "High", source: "CarComplaints" },
    ],
    "Civic": [
      { issue: "Excessive oil consumption on 1.5T turbocharged engine — oil dilution with fuel", years: "2016–2018", severity: "High", source: "NHTSA/CarComplaints", trims: ["EX", "EX-L", "Touring", "Sport"] },
      { issue: "Air bag inflator recall (Takata) — metal fragments on deployment", years: "2001–2015", severity: "High", source: "NHTSA recall" },
    ],
    "CR-V": [
      { issue: "Oil dilution — gasoline mixing into engine oil on 1.5T in cold climates", years: "2017–2019", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "AC system refrigerant loss — weak cooling performance", years: "2017–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "Pilot": [
      { issue: "VCM vibration — shudder at highway speeds on 3.5L V6", years: "2009–2015", severity: "High", source: "CarComplaints" },
      { issue: "Transmission shudder and torque converter issues on 6-speed auto", years: "2009–2015", severity: "Medium", source: "RepairPal" },
    ],
    "Odyssey": [
      { issue: "Transmission failure — 4-speed automatic slipping or failure under 100k miles", years: "1999–2004", severity: "High", source: "CarComplaints" },
      { issue: "Paint peeling on roof and hood — Honda extended warranty on some years", years: "2005–2010", severity: "Low", source: "CarComplaints" },
    ],
    "Civic Type R": [
      { issue: "Infotainment display cracking — Honda issued extended warranty", years: "2017–2019", severity: "Low", source: "CarComplaints" },
    ],
  },
  "Hyundai": {
    "Sonata": [
      { issue: "Engine seizure and failure — theta II engine; massive recall/class action", years: "2011–2019", severity: "High", source: "NHTSA recall/class action" },
      { issue: "Engine fire risk — connecting rod failure on Theta II 2.4L and 2.0T", years: "2011–2019", severity: "High", source: "NHTSA" },
    ],
    "Elantra": [
      { issue: "Engine failure — Theta II 2.0L/2.4L connecting rod bearing failure", years: "2011–2016", severity: "High", source: "NHTSA recall" },
      { issue: "Automatic transmission hesitation and rough shifting", years: "2011–2016", severity: "Medium", source: "CarComplaints" },
    ],
    "Santa Fe": [
      { issue: "Engine failure — theta II engine bearing and rod failure", years: "2013–2018", severity: "High", source: "NHTSA recall" },
      { issue: "Sunroof shattering spontaneously", years: "2013–2018", severity: "Medium", source: "NHTSA" },
    ],
    "Tucson": [
      { issue: "Engine failure — 2.4L Theta II engine connecting rod failure", years: "2010–2015", severity: "High", source: "NHTSA recall" },
      { issue: "Transmission jerking and hesitation on DCT dual-clutch", years: "2016–2020", severity: "Medium", source: "CarComplaints" },
    ],
  },
  "Infiniti": {
    "Q50": [
      { issue: "Brake system — premature front brake wear on sport trim larger rotors", years: "2014–2017", severity: "Medium", source: "CarComplaints" },
      { issue: "Infotainment InTouch system freezing and restarting", years: "2014–2017", severity: "Low", source: "CarComplaints" },
    ],
    "QX60": [
      { issue: "CVT transmission judder and hesitation", years: "2013–2017", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Timing chain stretch on VQ35 V6 — rattle at startup", years: "2013–2018", severity: "Medium", source: "RepairPal" },
    ],
    "QX80": [
      { issue: "Timing chain stretch on 5.6L V8 at high mileage", years: "2011–2019", severity: "Medium", source: "RepairPal" },
    ],
  },
  "Jeep": {
    "Grand Cherokee": [["Any Trim",1.0],["SE",0.95],["Laredo",0.95],["Laredo X",0.97],["Altitude",0.97],["Limited",1.0],["High Altitude",1.08],["Overland",1.05],["Trailhawk",1.05],["Summit",1.1],["Summit Reserve",1.15],["Orvis",1.08],["SRT8",1.2],["SRT",1.2],["Trackhawk",1.25],["Sterling Edition",1.1]],
    "Wrangler": [
      { issue: "Death wobble — violent steering oscillation at highway speeds over bumps", years: "2007–2018", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "Pinion seal leak — Dana front axle differential oil leak", years: "2007–2018", severity: "Medium", source: "RepairPal" },
      { issue: "Manual transmission — synchro wear and difficulty shifting into 3rd gear", years: "2012–2018", severity: "Medium", source: "CarComplaints" },
    ],
    "Cherokee": [
      { issue: "9-speed ZF transmission hesitation, rough shifts, and hunting gears", years: "2014–2018", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Timing chain noise on 3.2L Pentastar V6 at startup", years: "2014–2019", severity: "Medium", source: "RepairPal", trims: ["Limited", "Trailhawk", "Overland"] },
    ],
    "Wrangler Rubicon": [
      { issue: "Dana 44 front axle seal leak — differential fluid loss", years: "2007–2018", severity: "Medium", source: "RepairPal" },
    ],
  },
  "Kia": {
    "Sorento": [
      { issue: "Theta II engine seizure — 2.4L rod bearing failure; fire risk; NHTSA recall and $758M settlement", years: "2011–2016", severity: "High", source: "NHTSA recall/class action" },
      { issue: "Transmission shudder on 6-speed automatic", years: "2011–2016", severity: "Medium", source: "CarComplaints" },
    ],
    "Optima": [
      { issue: "Theta II engine failure — rod bearing failure on 2.4L and 2.0T", years: "2011–2018", severity: "High", source: "NHTSA recall/class action" },
    ],
    "Sportage": [
      { issue: "Theta II 2.4L engine failure — rod bearing wear, stall, fire risk; recall and extended warranty to 15yr/150k mi", years: "2011–2016", severity: "High", source: "NHTSA recall/class action" },
    ],
    "Soul": [
      { issue: "Piston ring failure on 2.0L — oil consumption, engine knock, stall risk; recall for 2020–2021 models", years: "2020–2021", severity: "High", source: "NHTSA recall" },
    ],
    "Forte": [
      { issue: "Theta II / Nu 2.0L GDI engine oil consumption and potential failure — extended warranty issued", years: "2014–2016", severity: "High", source: "NHTSA/class action" },
    ],
    "K5": [
      { issue: "Smartstream 1.6T or 2.5T engine oil consumption at higher mileage", years: "2021–2023", severity: "Medium", source: "CarComplaints" },
    ],
    "Stinger": [
      { issue: "Excessive oil consumption on 2.0T engine — some owners report 1 qt per 2,000 miles", years: "2018–2020", severity: "Medium", source: "CarComplaints" },
    ],
  },
  "Lexus": {
    "IS": [
      { issue: "Valve spring fracture risk on 2GR-FSE engine — recall issued in some markets", years: "2006–2012", severity: "High", source: "NHTSA" },
    ],
    "GX": [
      { issue: "Frame rust perforation — rusted frames on vehicles in salt-belt states", years: "2003–2009", severity: "High", source: "NHTSA" },
      { issue: "Brake proportioning — Consumer Reports suspended recommendation for safety", years: "2010–2010", severity: "High", source: "Consumer Reports/NHTSA" },
    ],
    "RX": [
      { issue: "Brake actuator noise — grinding during initial brake engagement", years: "2010–2015", severity: "Medium", source: "CarComplaints" },
    ],
    "ES": [
      { issue: "Floor mat entrapping accelerator — Lexus recall", years: "2007–2010", severity: "High", source: "NHTSA recall" },
    ],
  },
  "Lincoln": {
    "MKZ": [
      { issue: "Electric parking brake failure — won't engage or disengage properly", years: "2013–2016", severity: "Medium", source: "CarComplaints" },
      { issue: "Panoramic roof noise and seal leaks", years: "2013–2016", severity: "Low", source: "CarComplaints" },
    ],
    "Navigator": [
      { issue: "Air suspension compressor failure — vehicle sits low on one corner", years: "2003–2014", severity: "High", source: "RepairPal" },
      { issue: "Spark plug ejection — Triton 5.4L V8, same as F-150", years: "2004–2010", severity: "High", source: "RepairPal" },
    ],
  },
  "Mazda": {
    "CX-5": [
      { issue: "Windshield delamination — inner layer separates from glass; recall in some regions", years: "2013–2016", severity: "Medium", source: "NHTSA" },
      { issue: "Infotainment MZD Connect system lag and freezing", years: "2014–2018", severity: "Low", source: "CarComplaints" },
    ],
    "Mazda3": [
      { issue: "Engine mount wear — vibration felt through steering wheel and seat", years: "2010–2013", severity: "Medium", source: "RepairPal" },
    ],
    "Mazda6": [
      { issue: "Spider nesting in fuel vent tube — causes fuel leak and fire risk", years: "2009–2012", severity: "High", source: "NHTSA recall" },
    ],
    "MX-5 Miata": [
      { issue: "Soft top wear and window separation — window separates from canvas", years: "2006–2015", severity: "Low", source: "CarComplaints" },
    ],
  },
  "Mercedes-Benz": {
    "C-Class": [["Any Trim",1.0],["C 220",0.95],["C 230",0.97],["C 240",0.97],["C 280",1.0],["C 300",0.97],["C 300 4MATIC",1.0],["C 320",1.0],["C 350",1.05],["C 350 4MATIC",1.05],["C 350e",1.05],["AMG C 43",1.12],["AMG C 55",1.18],["AMG C 63",1.2],["AMG C 63 S",1.22],["AMG C 63 S E Performance",1.25]],
    "E-Class": [
      { issue: "Camshaft adjuster and timing chain wear on M272/M273 engines", years: "2006–2012", severity: "High", source: "RepairPal" },
      { issue: "Air suspension failure — airmatic compressor and struts on all 4 corners", years: "2003–2009", severity: "High", source: "RepairPal", trims: ["E 450", "E 450 4MATIC", "E 53 AMG", "E 63 S AMG"] },
    ],
    "S-Class": [
      { issue: "Airmatic air suspension failure — all four corners require expensive repair", years: "2000–2013", severity: "High", source: "RepairPal" },
    ],
    "GLE": [
      { issue: "7G-Tronic transmission shudder and delayed shifts", years: "2016–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "GLC": [
      { issue: "Panoramic sunroof rattling and potential shattering", years: "2016–2020", severity: "Medium", source: "CarComplaints" },
    ],
    "AMG C 63": [
      { issue: "Carbon buildup on intake valves — direct injection M156/M177 V8 engines", years: "2008–2021", severity: "Medium", source: "RepairPal", trims: ["AMG C 63", "AMG C 63 S"] },
    ],
  },
  "Mitsubishi": {
    "Outlander": [
      { issue: "CVT transmission shudder — hesitation and judder under load", years: "2014–2020", severity: "Medium", source: "CarComplaints" },
    ],
    "Lancer Evolution": [
      { issue: "Rear differential limited slip wear — chattering on tight turns", years: "2003–2015", severity: "Medium", source: "RepairPal" },
    ],
    "Galant": [
      { issue: "Transmission failure — slipping and harsh shifts on automatic", years: "2004–2009", severity: "Medium", source: "CarComplaints" },
    ],
  },
  "Nissan": {
    "Altima": [
      { issue: "CVT transmission failure — shudder, hesitation, failure under 100k miles", years: "2013–2018", severity: "High", source: "CarComplaints/NHTSA class action" },
      { issue: "Control arm bolt loosening — suspension noise and recall", years: "2013–2015", severity: "High", source: "NHTSA recall" },
      { issue: "Timing chain stretch on 2.5L QR25 engine — rattle at startup", years: "2002–2006", severity: "High", source: "RepairPal" },
    ],
    "Rogue": [
      { issue: "CVT transmission judder and hesitation under load", years: "2014–2018", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Windshield wiper freezing — motor burnout in cold weather", years: "2014–2016", severity: "Medium", source: "NHTSA recall" },
    ],
    "Pathfinder": [
      { issue: "CVT transmission failure — overheating, limp mode", years: "2013–2017", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Coolant mixing into transmission fluid — CVT cooler failure", years: "2013–2016", severity: "High", source: "NHTSA/class action" },
    ],
    "GT-R": [
      { issue: "Transmission failure if launch control overused — VR38DETT dual-clutch", years: "2009–2014", severity: "High", source: "RepairPal" },
    ],
    "Leaf": [
      { issue: "Battery capacity degradation in hot climates — no active thermal management on Gen 1", years: "2011–2017", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "Rapid battery capacity loss — some owners report 20–30% range loss within 3 years", years: "2011–2015", severity: "High", source: "CarComplaints" },
      { issue: "Charge port latch failure — CHAdeMO port won't latch or release properly", years: "2011–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "Ariya EV": [
      { issue: "Software update issues causing charging errors and connectivity problems", years: "2023–2024", severity: "Medium", source: "CarComplaints" },
    ],
  },
  "Chevrolet": {
    "Bolt EV": [
      { issue: "High-voltage battery fire risk — battery replaced under recall; affected 2017–2022 models", years: "2017–2022", severity: "High", source: "NHTSA recall" },
      { issue: "DC fast charging disabled by recall — owners told not to charge above 90% or park indoors", years: "2020–2022", severity: "High", source: "NHTSA recall" },
    ],
    "Bolt EUV": [
      { issue: "Same battery fire recall as Bolt EV — all units had battery replaced under recall", years: "2022–2022", severity: "High", source: "NHTSA recall" },
    ],
  },
  "Hyundai": {
    "Sonata": [
      { issue: "Theta II 2.0L/2.4L GDI engine failure — rod bearing wear, stall, fire risk; $1.3B class action settlement, 15yr/150k mi warranty extension", years: "2011–2019", severity: "High", source: "NHTSA/class action settlement" },
      { issue: "Engine fire risk from non-crash events — oil leaks onto hot surfaces from failed bearings", years: "2011–2018", severity: "High", source: "NHTSA/class action" },
    ],
    "Santa Fe": [
      { issue: "Theta II engine failure — same rod bearing issue as Sonata; recall and extended warranty", years: "2013–2019", severity: "High", source: "NHTSA recall" },
    ],
    "Tucson": [
      { issue: "Theta II engine failure on 2.4L GDI — bearing wear, stall risk; covered under extended warranty", years: "2014–2019", severity: "High", source: "NHTSA recall" },
      { issue: "Dual-clutch DCT transmission hesitation and shudder at low speeds", years: "2016–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "Elantra": [
      { issue: "Gamma 1.6L GDI engine oil consumption and stalling — class action filed; extended warranty issued", years: "2014–2016", severity: "High", source: "NHTSA/class action" },
    ],
    "Ioniq 5": [
      { issue: "Integrated Charging Control Unit (ICCU) failure — car stops charging, tow required; recall", years: "2022–2023", severity: "High", source: "NHTSA recall" },
      { issue: "12V battery drain causing no-start condition if ICCU fails", years: "2022–2023", severity: "High", source: "NHTSA recall" },
    ],
    "Ioniq 6": [
      { issue: "ICCU charging failure — same issue as Ioniq 5; recall issued", years: "2023–2024", severity: "High", source: "NHTSA recall" },
    ],
  },
  "RAM": {
    "1500": [
      { issue: "TIPM (Totally Integrated Power Module) failure — stalling, no-start, random electrical faults", years: "2011–2014", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "Air suspension failure in cold weather — bags deflate below freezing, vehicle unsafe to drive; class action filed", years: "2013–2023", severity: "High", source: "CarComplaints/class action" },
      { issue: "8-speed automatic transmission shudder — torque converter vibration at 40–50 mph on light throttle", years: "2014–2018", severity: "Medium", source: "CarComplaints" },
      { issue: "eTorque 5.7L mild hybrid battery drain — loss of power, system failure warnings", years: "2019–2023", severity: "Medium", source: "NHTSA/CarComplaints" },
      { issue: "Rear window and third brake light water intrusion — leaks into headliner and electronics", years: "2019–2022", severity: "Medium", source: "CarComplaints/NHTSA TSBs" },
    ],
    "2500": [
      { issue: "TIPM failure — same stalling/no-start issue as 1500", years: "2011–2014", severity: "High", source: "NHTSA" },
      { issue: "Cummins exhaust brake valve failure — loss of engine braking on downhills", years: "2007–2012", severity: "Medium", source: "RepairPal" },
      { issue: "Front axle differential pinion seal leak — common on 4WD models over 80k miles", years: "2010–2018", severity: "Medium", source: "RepairPal" },
    ],
    "3500": [
      { issue: "Rear axle bearing failure on SRW (single rear wheel) models — grinding noise", years: "2014–2018", severity: "Medium", source: "RepairPal" },
    ],
  },

  "Subaru": {
    "Outback": [
      { issue: "Head gasket failure — coolant and oil mixing on EJ25 engine", years: "2000–2009", severity: "High", source: "CarComplaints/class action" },
      { issue: "Excessive oil consumption — FB25 engine burns oil between changes", years: "2013–2017", severity: "High", source: "NHTSA/CarComplaints class action" },
      { issue: "Premature battery failure — DCM telematics system drains battery", years: "2017–2019", severity: "High", source: "CarComplaints/NHTSA (893 complaints)" },
      { issue: "Steering loss risk — improperly machined steering column; do not drive warning issued", years: "2017–2017", severity: "High", source: "NHTSA recall" },
    ],
    "Forester": [
      { issue: "Head gasket failure — EJ25 phase 1 gasket failure, coolant loss", years: "1999–2010", severity: "High", source: "CarComplaints" },
      { issue: "Excessive oil consumption — 2.5L FB25 burns 1 qt per 1,000 miles", years: "2011–2018", severity: "High", source: "NHTSA/CarComplaints (1,000+ complaints)" },
      { issue: "CVT transmission failure — torque converter and valve body issues", years: "2014–2018", severity: "High", source: "CarComplaints", trims: ["Premium", "Sport", "Limited", "Touring"] },
      { issue: "Infotainment system freeze — Starlink head unit lockup, backup camera failure", years: "2018–2018", severity: "Medium", source: "CarComplaints/lawsuit" },
    ],
    "Impreza": [
      { issue: "Head gasket failure on EJ25 engine — coolant and oil mixing", years: "1999–2011", severity: "High", source: "CarComplaints" },
      { issue: "Spark plug tube seal oil leak — oil soaks ignition coil boots, causes misfires", years: "2006–2014", severity: "Medium", source: "RepairPal" },
    ],
    "WRX": [
      { issue: "Ringland failure — piston ring land cracks on EJ257 engine under high load", years: "2008–2014", severity: "High", source: "RepairPal/community data", trims: ["Base", "Premium"] },
      { issue: "Transmission synchro wear — 3rd/4th gear grind on 6-speed manual", years: "2015–2021", severity: "Medium", source: "CarComplaints" },
    ],
    "WRX STI": [
      { issue: "Ringland failure — EJ257 engine piston ring land fracture, often catastrophic", years: "2004–2021", severity: "High", source: "RepairPal/NHTSA" },
      { issue: "Rear differential limited slip wear — chattering on tight turns", years: "2004–2021", severity: "Medium", source: "RepairPal" },
    ],
    "Legacy": [
      { issue: "Head gasket failure on EJ25 — same issue as Outback", years: "2000–2009", severity: "High", source: "CarComplaints" },
      { issue: "CVT failure — transmission judder and hesitation", years: "2015–2019", severity: "Medium", source: "CarComplaints" },
    ],
    "Crosstrek": [
      { issue: "Excessive oil consumption on 2.0L FB20 engine", years: "2013–2017", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "ECM issue — ignition coil stays powered after shutoff, blows fuse; recall", years: "2018–2019", severity: "Medium", source: "NHTSA recall" },
    ],
    "BRZ": [
      { issue: "Infotainment display delamination — touchscreen layer separates", years: "2013–2020", severity: "Low", source: "CarComplaints" },
    ],
    "Ascent": [
      { issue: "Transmission shifting problems — hesitation, lurching reported to NHTSA", years: "2019–2020", severity: "Medium", source: "NHTSA" },
      { issue: "Fuel pump failure — defective Denso low-pressure pump; recall issued", years: "2019–2019", severity: "High", source: "NHTSA recall" },
    ],
  },
  "Tesla": {
    "Model S": [
      { issue: "Door handle failure — electrically actuated handles fail to present", years: "2012–2019", severity: "Medium", source: "CarComplaints" },
      { issue: "MCU (Media Control Unit) eMMC memory chip failure — no touchscreen, no backup camera", years: "2012–2018", severity: "High", source: "NHTSA recall" },
      { issue: "12V battery failure — sudden power loss with no warning; recall", years: "2012–2021", severity: "High", source: "NHTSA recall" },
    ],
    "Model 3 RWD": [
      { issue: "Trunk and frunk lid misalignment and wind noise", years: "2017–2020", severity: "Low", source: "CarComplaints" },
      { issue: "Suspension ball joint wear — accelerated wear reported", years: "2017–2020", severity: "Medium", source: "CarComplaints" },
    ],
    "Model X": [
      { issue: "Falcon wing door failure — sensors misaligning, doors won't close", years: "2015–2020", severity: "High", source: "CarComplaints/NHTSA" },
      { issue: "MCU eMMC memory chip failure — same as Model S", years: "2016–2018", severity: "High", source: "NHTSA recall" },
    ],
    "Cybertruck": [
      { issue: "Accelerator pedal pad delamination — stainless steel cover dislodges, jamming pedal; recall", years: "2024–2024", severity: "High", source: "NHTSA recall" },
    ],
  },
  "Toyota": {
    "Camry": [
      { issue: "Excessive oil consumption on 2.5L 4-cylinder — burns oil between changes", years: "2007–2011", severity: "Medium", source: "NHTSA/CarComplaints" },
      { issue: "Unintended acceleration investigation — floor mat and throttle pedal sticking", years: "2007–2010", severity: "High", source: "NHTSA recall/class action" },
      { issue: "EVAP charcoal canister failure — check engine light P0456/P0441", years: "2018–2022", severity: "Low", source: "RepairPal" },
    ],
    "Corolla": [
      { issue: "Oil consumption on 1.8L 2ZR-FE — burns oil, deposits on plugs", years: "2009–2014", severity: "Medium", source: "NHTSA/RepairPal" },
    ],
    "RAV4": [
      { issue: "EVAP canister releasing charcoal pellets into vent valve — check engine light", years: "2006–2015", severity: "Medium", source: "RepairPal" },
      { issue: "Excessive oil consumption on 2.5L engine", years: "2006–2010", severity: "Medium", source: "NHTSA" },
      { issue: "Premature rear differential wear — chattering on turns", years: "2006–2012", severity: "Medium", source: "RepairPal" },
    ],
    "Tacoma": [
      { issue: "Frame rust perforation — frames rotting through in salt-belt states; Toyota extended warranty", years: "2004–2010", severity: "High", source: "NHTSA/class action" },
      { issue: "Timing chain stretch on 4.0L V6 1GR-FE engine at high mileage", years: "2005–2015", severity: "Medium", source: "RepairPal" },
      { issue: "Automatic transmission hunting and harsh downshift on 5-speed auto", years: "2005–2012", severity: "Medium", source: "CarComplaints" },
    ],
    "4Runner": [
      { issue: "Frame rust — same issue as Tacoma in salt-belt states", years: "2003–2009", severity: "High", source: "NHTSA" },
      { issue: "Timing chain stretch on 4.0L V6 at high mileage", years: "2003–2015", severity: "Medium", source: "RepairPal" },
    ],
    "Tundra": [
      { issue: "Frame rust perforation — class action and extended warranty in salt-belt states", years: "2000–2006", severity: "High", source: "NHTSA/class action" },
      { issue: "Secondary air injection pump failure — check engine light on cold starts", years: "2007–2011", severity: "Medium", source: "RepairPal" },
    ],
    "Highlander": [
      { issue: "Timing chain stretch on 3.5L 2GR-FE V6 at high mileage", years: "2008–2013", severity: "Medium", source: "RepairPal" },
      { issue: "Fuel tank pressure sensor — EVAP system check engine codes", years: "2008–2013", severity: "Low", source: "RepairPal" },
    ],
    "GR Supra": [
      { issue: "Fuel injector coding mismatch — rough idle, codes from BMW B58 engine", years: "2020–2022", severity: "Medium", source: "RepairPal" },
    ],
    "Prius": [
      { issue: "Inverter failure — total vehicle shutdown; Toyota issued extended warranty", years: "2004–2009", severity: "High", source: "NHTSA/Toyota extended warranty" },
      { issue: "Hybrid battery failure earlier than expected in extreme heat climates", years: "2004–2009", severity: "High", source: "CarComplaints" },
    ],
  },
  "Volkswagen": {
    "Jetta": [
      { issue: "Timing chain tensioner failure on 2.0T TSI — engine rattle, risk of catastrophic failure", years: "2008–2013", severity: "High", source: "NHTSA/CarComplaints" },
      { issue: "DSG dual-clutch transmission shudder and rough low-speed engagement", years: "2008–2015", severity: "Medium", source: "CarComplaints" },
      { issue: "Key stuck in ignition — steering column lock housing failure", years: "2008–2018", severity: "Medium", source: "NHTSA" },
    ],
    "GTI": [
      { issue: "Timing chain tensioner failure on 2.0T TSI — same issue as Jetta", years: "2008–2013", severity: "High", source: "RepairPal" },
      { issue: "DSG clutch shudder on low-speed engagement", years: "2008–2014", severity: "Medium", source: "CarComplaints" },
    ],
    "Golf R": [
      { issue: "DQ381 DSG transmission software shudder at low speed", years: "2015–2020", severity: "Medium", source: "CarComplaints" },
    ],
    "Passat": [
      { issue: "Timing chain tensioner failure on 2.0T TSI engine", years: "2008–2012", severity: "High", source: "RepairPal" },
      { issue: "EGR cooler failure — coolant leak into intake; common on TDI diesel", years: "2009–2015", severity: "High", source: "RepairPal" },
    ],
    "Tiguan": [
      { issue: "Timing chain tensioner failure on 2.0T TSI", years: "2009–2013", severity: "High", source: "RepairPal" },
      { issue: "AC blend door actuator clicking — common failure", years: "2009–2017", severity: "Low", source: "RepairPal" },
    ],
  },
  "Volvo": {
    "XC90": [
      { issue: "Throttle body failure — stuck open or closed, stalling or runaway", years: "2003–2012", severity: "High", source: "RepairPal" },
      { issue: "Timing belt tensioner failure on B6294T — catastrophic engine failure if not replaced", years: "2003–2014", severity: "High", source: "RepairPal" },
    ],
    "XC60": [
      { issue: "Fuel injector failure — engine shudder, misfire on T6 turbo engine", years: "2010–2015", severity: "Medium", source: "CarComplaints" },
      { issue: "Sunroof seal leak — water intrusion into cabin", years: "2010–2017", severity: "Medium", source: "CarComplaints" },
    ],
    "S60": [
      { issue: "Throttle body failure — stalling, sudden loss of power", years: "2001–2009", severity: "High", source: "RepairPal" },
    ],
  },
  "Buick": {
    "Enclave": [
      { issue: "Timing chain wear on 3.6L V6 — premature stretch, rough idle, check engine; TSB 11340 covered 2009 Enclave up to 10yr/120k mi", years: "2008–2012", severity: "High", source: "NHTSA/TSB 11340" },
      { issue: "Water pump failure on 3.6L — coolant leak, overheating risk", years: "2008–2014", severity: "Medium", source: "RepairPal" },
      { issue: "Power steering fluid leak from rack and pinion — loss of assist", years: "2008–2017", severity: "Medium", source: "RepairPal" },
    ],
    "LaCrosse": [
      { issue: "Transmission shudder on 6-speed automatic — torque converter vibration at 40–50 mph", years: "2010–2016", severity: "Medium", source: "CarComplaints" },
      { issue: "Oil consumption on 3.6L V6 — burning 1 qt per 2,000 miles", years: "2010–2013", severity: "Medium", source: "RepairPal" },
    ],
    "Encore": [
      { issue: "Turbocharger failure on 1.4L Ecotec — loss of power, oil leak from turbo seals", years: "2013–2017", severity: "Medium", source: "RepairPal/CarComplaints" },
    ],
    "Verano": [
      { issue: "Timing chain stretch on 2.0T Ecotec — same as Chevy Malibu/Cruze; rattling on cold start", years: "2012–2017", severity: "High", source: "RepairPal" },
    ],
  },
  "Cadillac": {
    "CTS": [
      { issue: "Timing chain premature wear on 3.6L V6 — P0008/P0017 codes; TSB 11340C covers 2007–2009 up to 10yr/120k mi", years: "2007–2009", severity: "High", source: "NHTSA/TSB 11340C" },
      { issue: "CUE touchscreen delamination and unresponsiveness — screen cracks or ghost inputs; class action", years: "2013–2018", severity: "Medium", source: "CarComplaints/class action" },
      { issue: "Rear differential clutch pack failure — grinding on turns", years: "2014–2019", severity: "Medium", source: "RepairPal", trims: ["Vsport", "V"] },
    ],
    "ATS": [
      { issue: "CUE touchscreen delamination — same failure as CTS; class action settlement", years: "2013–2018", severity: "Medium", source: "CarComplaints/class action" },
      { issue: "Brake pedal bracket fracture — can cause complete brake loss; NHTSA recall", years: "2013–2018", severity: "High", source: "NHTSA recall" },
      { issue: "8-speed transmission shudder — torque converter vibration; updated fluid and TSB 18-NA-355", years: "2016–2018", severity: "Medium", source: "CarComplaints/TSB 18-NA-355" },
    ],
    "Escalade": [
      { issue: "DFM lifter collapse on 6.2L V8 — ticking, misfire, stall; GM recall April 2025 covering 597k vehicles (2021–2024)", years: "2021–2024", severity: "High", source: "NHTSA recall 25V274000" },
      { issue: "Magneride shock absorber leakage — oily shock body, poor damping, Service Suspension warning", years: "2015–2020", severity: "Medium", source: "CarComplaints/TSBs" },
      { issue: "CUE touchscreen failure — delamination and ghost inputs; $1,200+ out-of-warranty", years: "2013–2018", severity: "Medium", source: "CarComplaints" },
    ],
    "CT4": [
      { issue: "2.0T engine oil consumption — some owners report 1 qt per 3,000 miles", years: "2020–2022", severity: "Medium", source: "CarComplaints" },
    ],
    "XT5": [
      { issue: "8-speed transmission shudder at 40–55 mph — torque converter; updated fluid resolves most cases", years: "2017–2021", severity: "Medium", source: "CarComplaints/TSB 18-NA-355" },
    ],
    "Lyriq": [
      { issue: "Charging and software update failures — ICCU and over-the-air update issues causing car to not charge", years: "2023–2024", severity: "Medium", source: "CarComplaints/NHTSA" },
    ],
  },
};

// Trim availability by year — verified from Wikipedia, Edmunds, CarBuzz, manufacturer data
// Format: { Make: { Model: { TrimName: [startYear, endYear] } } }
const trimYears = {
  "Toyota": {
    "Camry": {
      "Any Trim": [1990, 2026],
      "Base":     [1990, 2001],
      "CE":       [1997, 2006],
      "LE":       [1990, 2026],
      "SE":       [1992, 2026],
      "XLE":      [1990, 2026],
      "XSE":      [2018, 2026],
      "TRD":      [2020, 2026],
    },
    "Camry Hybrid": {
      "Any Trim": [2007, 2026],
      "LE": [2007, 2026],
      "SE": [2013, 2026],
      "XLE": [2007, 2026],
      "XSE": [2018, 2026],
    },
    "Corolla": {
      "Any Trim": [1990, 2026],
      "Base":     [1990, 2002],
      "CE":       [1993, 2013],
      "LE":       [1993, 2026],
      "S":        [2003, 2013],
      "XRS":      [2005, 2013],
      "L":        [2009, 2026],
      "SE":       [2014, 2026],
      "XLE":      [2014, 2026],
      "XSE":      [2017, 2026],
    },
    "Corolla Cross": {
      "Any Trim": [2022, 2026],
      "L": [2022, 2026],
      "LE": [2022, 2026],
      "XLE": [2022, 2026],
      "XSE": [2022, 2026],
    },
    "RAV4": {
      "Any Trim": [1996, 2026],
      "Base": [1996, 2005],
      "L": [1996, 2000],
      "LE": [2001, 2026],
      "XLE": [2006, 2026],
      "XLE Premium": [2019, 2026],
      "Adventure": [2019, 2022],
      "TRD Off-Road": [2020, 2022],
      "SE": [2019, 2026],
      "Limited": [2006, 2026],
    },
    "RAV4 Hybrid": {
      "Any Trim": [2016, 2026],
      "LE": [2016, 2026],
      "XLE": [2016, 2026],
      "XLE Premium": [2019, 2026],
      "SE": [2019, 2026],
      "Limited": [2016, 2026],
    },
    "RAV4 Prime": {
      "Any Trim": [2021, 2026],
      "SE": [2021, 2026],
      "XSE": [2021, 2026],
      "XSE Premium": [2021, 2026],
    },
    "Highlander": {
      "Any Trim": [2001, 2026],
      "Base":     [2001, 2007],
      "Sport":    [2001, 2007],
      "SE":       [2006, 2007],
      "L":        [2020, 2026],
      "LE":       [2008, 2026],
      "XLE":      [2008, 2026],
      "Limited":  [2001, 2026],
      "Platinum": [2014, 2026],
    },
    "Highlander Hybrid": {
      "Any Trim": [2006, 2026],
      "Base": [2006, 2007],
      "LE": [2008, 2026],
      "XLE": [2014, 2026],
      "Limited": [2006, 2026],
      "Platinum": [2014, 2026],
    },
    "4Runner": {
      "Any Trim": [1990, 2026],
      "Base": [1990, 2002],
      "SR5": [1990, 2026],
      "Limited": [1996, 2026],
      "Sport": [1999, 2009],
      "TRD Sport": [2010, 2026],
      "TRD Off-Road": [2010, 2026],
      "TRD Pro": [2015, 2026],
      "Trailhunter": [2025, 2026],
    },
    "Tacoma": {
      "Any Trim": [1995, 2026],
      "Base": [1995, 2004],
      "SR": [2016, 2026],
      "SR5": [1995, 2026],
      "PreRunner": [1998, 2015],
      "TRD Sport": [2005, 2026],
      "TRD Off-Road": [2005, 2026],
      "Limited": [2016, 2026],
      "TRD Pro": [2017, 2026],
      "Trailhunter": [2024, 2026],
    },
    "Tundra": {
      "Any Trim": [2000, 2026],
      "Base": [2000, 2006],
      "SR": [2014, 2026],
      "SR5": [2000, 2026],
      "Limited": [2007, 2026],
      "Platinum": [2012, 2026],
      "1794": [2014, 2026],
      "Capstone": [2022, 2026],
      "TRD Pro": [2020, 2026],
    },
    "Tundra Hybrid": {
      "Any Trim": [2022, 2026],
      "SR5": [2022, 2026],
      "Limited": [2022, 2026],
      "Platinum": [2022, 2026],
      "Capstone": [2022, 2026],
      "TRD Pro": [2022, 2026],
    },
    "Sienna": {
      "Any Trim": [1998, 2026],
      "Base": [1998, 2003],
      "CE": [1998, 2010],
      "LE": [1998, 2026],
      "XLE": [2004, 2026],
      "SE": [2015, 2020],
      "XSE": [2021, 2026],
      "Limited": [2011, 2026],
      "Platinum": [2015, 2026],
    },
    "Prius": {
      "Any Trim": [2001, 2026],
      "Base": [2001, 2003],
      "Standard": [2004, 2009],
      "Two": [2010, 2026],
      "Three": [2010, 2026],
      "Four": [2010, 2026],
      "LE": [2023, 2026],
      "XLE": [2023, 2026],
      "Limited": [2023, 2026],
    },
    "GR Supra": {
      "Any Trim": [2020, 2026],
      "2.0": [2021, 2026],
      "3.0": [2020, 2026],
      "3.0 Premium": [2020, 2026],
      "A91": [2021, 2026],
      "A91-CF": [2022, 2022],
    },
    "GR86": {
      "Any Trim": [2022, 2026],
      "Base": [2022, 2026],
      "Premium": [2022, 2026],
    },
    "GR Corolla": {
      "Any Trim": [2023, 2026],
      "Core": [2023, 2026],
      "Circuit Edition": [2023, 2024],
      "Morizo Edition": [2023, 2024],
    },
    "Land Cruiser": {
      "Any Trim": [1990, 2026],
      "Base": [2022, 2026],
      "1958": [2024, 2026],
      "First Edition": [2024, 2024],
    },
    "Avalon": {
      "Any Trim": [1995, 2022],
      "XL": [1995, 1999],
      "XLS": [1995, 2004],
      "XLE": [2000, 2022],
      "Limited": [2005, 2022],
      "TRD": [2020, 2021],
      "Touring": [2019, 2022],
    },
    "Venza": {
      "Any Trim": [2021, 2024],
      "LE": [2021, 2024],
      "XLE": [2021, 2024],
      "Limited": [2021, 2024],
    },
    "bZ4X EV": {
      "Any Trim": [2023, 2026],
      "XLE": [2023, 2026],
      "Limited": [2023, 2026],
    },
    "Prius Prime": {
      "Any Trim": [2017, 2026],
      "Plus": [2017, 2022],
      "Premium": [2017, 2022],
      "Advanced": [2017, 2022],
      "SE": [2023, 2026],
      "XSE": [2023, 2026],
      "XSE Premium": [2023, 2026],
    },
    "Corolla GR": {
      "Any Trim": [2023, 2026],
      "Core": [2023, 2026],
      "Circuit Edition": [2023, 2024],
      "Morizo Edition": [2023, 2024],
    },
    "Mirai (Hydrogen)": {
      "Any Trim": [2016, 2026],
      "XLE": [2021, 2026],
      "Limited": [2021, 2026],
    },
    "Sequoia": {
      "Any Trim": [2001, 2026],
      "SR5": [2001, 2026],
      "Limited": [2001, 2026],
      "Platinum": [2008, 2026],
      "Capstone": [2022, 2026],
      "TRD Pro": [2020, 2022],
    },
    "Sequoia Hybrid": {
      "Any Trim": [2023, 2026],
      "SR5": [2023, 2026],
      "Limited": [2023, 2026],
      "Capstone": [2023, 2026],
    },
  },
  "Honda": {
    "Civic": {
      "Any Trim": [1990, 2026],
      "Base": [1990, 1995],
      "DX": [1990, 2005],
      "LX": [1990, 2026],
      "EX": [1990, 2026],
      "EX-L": [2006, 2021],
      "Si": [1990, 2026],
      "Sport": [2016, 2026],
      "Touring": [2016, 2026],
      "Type R": [2017, 2026],
    },
    "Accord": {
      "Any Trim":       [1990, 2026],
      "Base":           [1990, 1993],
      "DX":             [1990, 2002],
      "LX":             [1990, 2026],
      "SE":             [2011, 2015],
      "EX":             [1990, 2026],
      "EX-L":           [2003, 2024],
      "Sport":          [2014, 2026],
      "V6 Sport":       [2014, 2017],
      "Touring":        [2013, 2024],
      "Hybrid Sport":   [2018, 2026],
      "Hybrid Touring": [2018, 2026],
    },
    "Accord Hybrid": {
      "Any Trim": [2014, 2026],
      "Base": [2014, 2017],
      "Sport": [2018, 2026],
      "EX-L": [2018, 2024],
      "Touring": [2018, 2024],
      "Sport-L Hybrid": [2023, 2026],
    },
    "CR-V": {
      "Any Trim": [1997, 2026],
      "Base": [1997, 2001],
      "LX": [1997, 2026],
      "EX": [1999, 2026],
      "EX-L": [2007, 2026],
      "SE": [2005, 2006],
      "Touring": [2015, 2026],
      "Sport": [2023, 2026],
    },
    "CR-V Hybrid": {
      "Any Trim": [2020, 2026],
      "Sport": [2020, 2026],
      "EX-L": [2020, 2026],
      "Touring": [2020, 2026],
    },
    "Pilot": {
      "Any Trim":     [2003, 2026],
      "LX":           [2003, 2026],
      "EX":           [2003, 2015],
      "EX-L":         [2003, 2026],
      "Touring":      [2009, 2026],
      "Sport":        [2019, 2026],
      "Elite":        [2016, 2026],
      "TrailSport":   [2023, 2026],
      "Black Edition":[2023, 2026],
    },
    "Odyssey": {
      "Any Trim": [1995, 2026],
      "Base": [1995, 1998],
      "LX": [1995, 2026],
      "EX": [1995, 2026],
      "EX-L": [2005, 2026],
      "Touring": [2005, 2026],
      "Elite": [2018, 2026],
    },
    "Ridgeline": {
      "Any Trim": [2006, 2026],
      "RT": [2006, 2014],
      "Sport": [2017, 2026],
      "RTL": [2006, 2026],
      "RTL-E": [2017, 2026],
      "Black Edition": [2017, 2026],
    },
    "Fit": {
      "Any Trim": [2007, 2020],
      "Base": [2007, 2007],
      "Sport": [2007, 2020],
      "LX": [2009, 2020],
      "EX": [2007, 2020],
      "EX-L": [2015, 2020],
    },
    "HR-V": {
      "Any Trim": [2016, 2026],
      "LX": [2016, 2026],
      "Sport": [2019, 2026],
      "EX": [2016, 2026],
      "EX-L": [2016, 2026],
    },
    "Civic Type R": {
      "Any Trim": [2017, 2026],
      "Base": [2017, 2026],
      "Limited Edition": [2020, 2020],
    },
    "Insight": {
      "Any Trim": [2000, 2022],
      "Base": [2000, 2006],
      "LX": [2019, 2022],
      "EX": [2019, 2022],
      "Touring": [2019, 2022],
    },
    "Prologue EV": {
      "Any Trim": [2024, 2026],
      "EX-L": [2024, 2026],
      "Touring": [2024, 2026],
    },
    "Passport": {
      "Any Trim": [2019, 2026],
      "Sport": [2019, 2026],
      "EX-L": [2019, 2026],
      "TrailSport": [2022, 2026],
      "Elite": [2019, 2026],
    },
  },
  "Ford": {
    "F-150": {
      "Any Trim": [1990, 2026],
      "XL": [1990, 2026],
      "XLT": [1990, 2026],
      "Lariat": [1990, 2026],
      "King Ranch": [2001, 2026],
      "Platinum": [2009, 2026],
      "Limited": [2016, 2026],
      "Tremor": [2021, 2026],
    },
    "F-150 Raptor": {
      "Any Trim": [2010, 2026],
      "Base": [2010, 2026],
      "Raptor R": [2023, 2026],
    },
    "F-250 Super Duty": {
      "Any Trim": [1999, 2026],
      "XL": [1999, 2026],
      "XLT": [1999, 2026],
      "Lariat": [1999, 2026],
      "King Ranch": [2004, 2026],
      "Platinum": [2011, 2026],
      "Limited": [2019, 2026],
      "Tremor": [2021, 2026],
    },
    "F-350 Super Duty": {
      "Any Trim": [1999, 2026],
      "XL": [1999, 2026],
      "XLT": [1999, 2026],
      "Lariat": [1999, 2026],
      "King Ranch": [2004, 2026],
      "Platinum": [2011, 2026],
      "Limited": [2019, 2026],
    },
    "Explorer": {
      "Any Trim": [1990, 2026],
      "Base": [1990, 2001],
      "XL": [1990, 2001],
      "XLT": [1990, 2026],
      "Eddie Bauer": [1990, 2010],
      "Limited": [2001, 2026],
      "ST": [2020, 2026],
      "Platinum": [2013, 2026],
      "King Ranch": [2020, 2026],
      "Timberline": [2022, 2026],
    },
    "Escape": {
      "Any Trim":      [2001, 2026],
      "XLS":           [2001, 2004],
      "XLT":           [2001, 2004],
      "S":             [2013, 2019],
      "SE":            [2005, 2026],
      "SEL":           [2013, 2026],
      "Titanium":      [2013, 2026],
      "ST-Line":       [2020, 2026],
      "PHEV SE":       [2021, 2026],
      "PHEV Titanium": [2021, 2026],
    },
    "Expedition": {
      "Any Trim":    [1997, 2026],
      "XLT":         [1997, 2026],
      "Eddie Bauer": [1997, 2013],
      "Limited":     [2003, 2026],
      "King Ranch":  [2013, 2026],
      "Platinum":    [2015, 2026],
      "Max XLT":     [2018, 2026],
      "Max Platinum":[2018, 2026],
      "Timberline":  [2022, 2026],
    },
    "Mustang GT": {
      "Any Trim": [1990, 2026],
      "Base": [1990, 2026],
      "Premium": [1994, 2026],
      "California Special": [2007, 2026],
    },
    "Mustang EcoBoost": {
      "Any Trim": [2015, 2026],
      "Base": [2015, 2026],
      "Premium": [2015, 2026],
      "High Performance": [2020, 2026],
    },
    "Mustang GT500": {
      "Any Trim": [2020, 2026],
      "Base": [2020, 2026],
      "Carbon Fiber Track Pack": [2020, 2026],
    },
    "Mustang Mach-E": {
      "Any Trim": [2021, 2026],
      "Select": [2021, 2026],
      "California Route 1": [2021, 2026],
      "Premium": [2021, 2026],
      "GT": [2021, 2026],
      "GT Performance": [2021, 2026],
    },
    "F-150 Lightning": {
      "Any Trim": [2022, 2026],
      "Pro": [2022, 2026],
      "XLT": [2022, 2026],
      "Lariat": [2022, 2026],
      "Platinum": [2022, 2026],
      "Black Ops": [2024, 2026],
    },
    "Bronco": {
      "Any Trim": [2021, 2026],
      "Base": [2021, 2026],
      "Big Bend": [2021, 2026],
      "Black Diamond": [2021, 2026],
      "Outer Banks": [2021, 2026],
      "Badlands": [2021, 2026],
      "Wildtrak": [2021, 2026],
      "Everglades": [2022, 2026],
      "Raptor": [2022, 2026],
      "Heritage": [2023, 2026],
    },
    "Bronco Sport": {
      "Any Trim": [2021, 2026],
      "Base": [2021, 2026],
      "Big Bend": [2021, 2026],
      "Outer Banks": [2021, 2026],
      "Badlands": [2021, 2026],
      "Wildtrak": [2021, 2026],
      "Heritage": [2023, 2026],
    },
    "Ranger": {
      "Any Trim": [1990, 2026],
      "XL": [1990, 2026],
      "XLT": [1990, 2026],
      "Edge": [1990, 2011],
      "Sport": [1990, 2011],
      "FX4": [2003, 2011],
      "Lariat": [2019, 2026],
      "Tremor": [2022, 2026],
      "Raptor": [2024, 2026],
    },
    "Maverick": {
      "Any Trim": [2022, 2026],
      "XL": [2022, 2026],
      "XLT": [2022, 2026],
      "Lariat": [2022, 2026],
      "Tremor": [2024, 2026],
    },
    "Fusion": {
      "Any Trim": [2006, 2020],
      "S": [2006, 2020],
      "SE": [2006, 2020],
      "SEL": [2006, 2020],
      "Titanium": [2013, 2020],
      "Sport": [2017, 2020],
      "V6 Sport": [2017, 2018],
    
      "Platinum": [2017, 2020],
    },
    "Edge": {
      "Any Trim": [2007, 2024],
      "SE": [2007, 2024],
      "SEL": [2007, 2024],
      "Titanium": [2011, 2024],
      "ST": [2019, 2024],
      "ST-Line": [2022, 2024],
    },
    "Focus": {
      "Any Trim": [2000, 2018],
      "S": [2000, 2018],
      "SE": [2000, 2018],
      "SEL": [2000, 2018],
      "Titanium": [2012, 2018],
      "ST": [2013, 2018],
      "RS": [2016, 2018],
    },
    "Fiesta": {
      "Any Trim": [2011, 2019],
      "S": [2011, 2019],
      "SE": [2011, 2019],
      "SEL": [2011, 2019],
      "Titanium": [2011, 2019],
      "ST": [2014, 2019],
    },
    "Taurus": {
      "Any Trim": [1990, 2019],
      "L": [1990, 1995],
      "GL": [1990, 1998],
      "LX": [1990, 1995],
      "SE": [1996, 2019],
      "SEL": [1999, 2019],
      "Limited": [2008, 2019],
      "SHO": [2010, 2019],
    },
    "EcoSport": {
      "Any Trim": [2018, 2022],
      "S": [2018, 2022],
      "SE": [2018, 2022],
      "SES": [2018, 2022],
      "Titanium": [2018, 2022],
    },
    "Mustang Mach 1": {
      "Any Trim": [2021, 2023],
      "Base": [2021, 2023],
      "Handling Package": [2021, 2023],
    },
    "Mustang Dark Horse": {
      "Any Trim": [2024, 2026],
      "Base": [2024, 2026],
      "Performance Package": [2024, 2026],
    },
    "Transit": {
      "Any Trim": [2015, 2026],
      "Base": [2015, 2026],
      "XL": [2015, 2026],
      "XLT": [2015, 2026],
    },
  },
  "Chevrolet": {
    "Silverado 1500": {
      "Any Trim": [1999, 2026],
      "WT": [1999, 2026],
      "Custom": [2014, 2026],
      "LS": [1999, 2013],
      "LT": [1999, 2026],
      "RST": [2019, 2026],
      "LTZ": [2007, 2025],
      "Trail Boss": [2019, 2026],
      "High Country": [2014, 2026],
      "ZR2": [2022, 2026],
    },
    "Silverado 2500HD": {
      "Any Trim": [2001, 2026],
      "WT": [2001, 2026],
      "Custom": [2014, 2026],
      "LT": [2001, 2026],
      "LTZ": [2007, 2026],
      "High Country": [2015, 2026],
    },
    "Silverado 3500HD": {
      "Any Trim": [2001, 2026],
      "WT": [2001, 2026],
      "LT": [2001, 2026],
      "LTZ": [2007, 2026],
      "High Country": [2015, 2026],
    },
    "Equinox": {
      "Any Trim": [2005, 2026],
      "LS": [2005, 2017],
      "LT": [2005, 2026],
      "RS": [2022, 2026],
      "Premier": [2016, 2026],
    },
    "Tahoe": {
      "Any Trim": [1995, 2026],
      "LS": [1995, 2026],
      "LT": [2000, 2026],
      "Z71": [2000, 2026],
      "RST": [2021, 2026],
      "Premier": [2015, 2026],
      "High Country": [2015, 2026],
    },
    "Suburban": {
      "Any Trim": [1990, 2026],
      "C1500": [1990, 1999],
      "K1500": [1990, 1999],
      "LS": [2000, 2026],
      "LT": [2000, 2026],
      "Z71": [2000, 2026],
      "RST": [2021, 2026],
      "Premier": [2015, 2026],
      "High Country": [2015, 2026],
    },
    "Colorado": {
      "Any Trim": [2004, 2026],
      "WT": [2004, 2026],
      "LT": [2004, 2026],
      "Z71": [2004, 2026],
      "ZR2": [2017, 2026],
      "Trail Boss": [2019, 2026],
    },
    "Traverse": {
      "Any Trim": [2009, 2026],
      "LS": [2009, 2026],
      "LT": [2009, 2026],
      "RS": [2022, 2026],
      "Premier": [2018, 2026],
      "High Country": [2009, 2026],
    },
    "Blazer": {
      "Any Trim": [2019, 2026],
      "LT": [2019, 2026],
      "RS": [2019, 2026],
      "Premier": [2019, 2026],
    },
    "Blazer EV": {
      "Any Trim": [2024, 2026],
      "LT": [2024, 2026],
      "2LT": [2024, 2026],
      "RS": [2024, 2026],
      "SS": [2024, 2026],
    },
    "Camaro": {
      "Any Trim": [1990, 2024],
      "Base": [1990, 2024],
      "RS": [1990, 2024],
      "LS": [2010, 2024],
      "LT": [2010, 2024],
      "LT1": [2016, 2024],
      "SS": [1990, 2024],
      "ZL1": [2012, 2024],
    
      "ZL1 1LE": [2017, 2024],
    },
    "Malibu": {
      "Any Trim": [1997, 2024],
      "Base": [1997, 2003],
      "LS": [1997, 2024],
      "LT": [2004, 2024],
      "LTZ": [2013, 2024],
      "Premier": [2016, 2024],
      "RS": [2013, 2019],
    },
    "Trax": {
      "Any Trim": [2013, 2026],
      "LS": [2013, 2026],
      "LT": [2013, 2026],
      "ACTIV": [2023, 2026],
      "RS": [2023, 2026],
      "Premier": [2017, 2026],
    },
    "Trailblazer": {
      "Any Trim": [2021, 2026],
      "LS": [2021, 2026],
      "LT": [2021, 2026],
      "ACTIV": [2021, 2026],
      "RS": [2021, 2026],
      "Premier": [2021, 2026],
    },
    "Sonic": {
      "Any Trim": [2012, 2020],
      "LS": [2012, 2020],
      "LT": [2012, 2020],
      "Premier": [2017, 2020],
    },
    "Spark": {
      "Any Trim": [2013, 2022],
      "LS": [2013, 2022],
      "1LT": [2013, 2022],
      "2LT": [2013, 2022],
      "ACTIV": [2018, 2022],
    },
    "Corvette Stingray": {
      "Any Trim": [2014, 2026],
      "1LT": [2014, 2026],
      "2LT": [2014, 2026],
      "3LT": [2014, 2026],
    },
    "Corvette Z06": {
      "Any Trim": [2023, 2026],
      "1LZ": [2023, 2026],
      "2LZ": [2023, 2026],
      "3LZ": [2023, 2026],
      "70th Anniversary": [2023, 2023],
    },
    "Corvette ZR1": {
      "Any Trim": [2025, 2026],
      "Base": [2025, 2026],
      "ZTK": [2025, 2026],
    },
    "Bolt EV": {
      "Any Trim": [2017, 2023],
      "LT": [2017, 2023],
      "Premier": [2017, 2023],
    },
    "Bolt EUV": {
      "Any Trim": [2022, 2023],
      "LT": [2022, 2023],
      "Premier": [2022, 2023],
    },
    "Silverado EV": {
      "Any Trim": [2024, 2026],
      "WT": [2024, 2026],
      "LT": [2024, 2026],
      "RST": [2024, 2026],
      "4ST": [2024, 2026],
    },
    "Camaro SS": {
      "Any Trim": [1990, 2024],
      "Base": [1990, 2024],
      "1LE": [2014, 2024],
    },
    "Camaro ZL1": {
      "Any Trim": [2012, 2024],
      "Base": [2012, 2024],
      "1LE": [2017, 2024],
    },
    "Express": {
      "Any Trim": [1996, 2026],
      "Cargo": [1996, 2026],
      "1500": [1996, 2026],
      "2500": [1996, 2026],
      "3500": [1996, 2026],
    },
  },
  "Subaru": {
    "Outback": {
      "Any Trim":         [1995, 2026],
      "Base":             [1995, 2026],
      "L":                [1995, 1999],
      "Limited":          [1995, 2026],
      "XT":               [2005, 2009],
      "Premium":          [2010, 2026],
      "Onyx Edition":     [2020, 2026],
      "Onyx Edition XT":  [2020, 2026],
      "Limited XT":       [2020, 2026],
      "Touring":          [2010, 2026],
      "Touring XT":       [2020, 2026],
      "Wilderness":       [2022, 2026],
    },
    "Forester": {
      "Any Trim": [1998, 2026],
      "Base":     [1998, 2013],
      "L":        [1998, 2002],
      "S":        [1998, 2002],
      "X":        [2003, 2013],
      "XT":       [2004, 2013],
      "Premium":  [2014, 2026],
      "Sport":    [2019, 2026],
      "Limited":  [2014, 2026],
      "Touring":  [2016, 2026],
      "Wilderness":[2022, 2026],
    },
    "Impreza": {
      "Any Trim": [1993, 2026],
      "Base": [1993, 2026],
      "L": [1993, 2001],
      "LX": [1993, 1996],
      "TS": [1998, 2001],
      "RS": [1998, 2007],
      "WRX": [2002, 2014],
      "Premium": [2012, 2026],
      "Sport": [2017, 2026],
      "Limited": [2012, 2026],
    },
    "WRX": {
      "Any Trim":     [2002, 2026],
      "Base":         [2002, 2026],
      "Premium":      [2015, 2026],
      "Limited":      [2008, 2021],
      "GT":           [2022, 2026],
      "Series.White": [2020, 2020],
    },
    "WRX STI": {
      "Any Trim": [2004, 2021],
      "Base": [2004, 2021],
      "Limited": [2004, 2021],
      "S209": [2019, 2019],
      "Series.Grey": [2018, 2018],
    },
    "Crosstrek": {
      "Any Trim": [2013, 2026],
      "Base":     [2013, 2026],
      "Premium":  [2013, 2026],
      "Sport":    [2019, 2026],
      "Limited":  [2016, 2026],
      "Wilderness":[2022, 2026],
    },
    "Crosstrek Hybrid": {
      "Any Trim": [2019, 2026],
      "Limited": [2019, 2026],
    },
    "Legacy": {
      "Any Trim": [1990, 2025],
      "Base": [1990, 2009],
      "L": [1990, 1999],
      "LS": [1990, 1994],
      "GT": [1990, 2009],
      "Premium": [2010, 2025],
      "Sport": [2020, 2025],
      "Limited": [2010, 2025],
      "Limited XT": [2020, 2025],
    },
    "BRZ": {
      "Any Trim": [2013, 2026],
      "Premium": [2013, 2026],
      "Limited": [2013, 2026],
      "tS": [2018, 2021],
    },
    "Ascent": {
      "Any Trim": [2019, 2026],
      "Base": [2019, 2026],
      "Premium": [2019, 2026],
      "Limited": [2019, 2026],
      "Touring": [2019, 2026],
    },
    "Solterra EV": {
      "Any Trim": [2023, 2026],
      "Premium": [2023, 2026],
      "Limited": [2023, 2026],
      "Touring": [2023, 2026],
    },
  },
  "Nissan": {
    "Altima": {
      "Any Trim":  [1993, 2026],
      "GXE":       [1993, 2006],
      "GLE":       [1993, 2001],
      "SE":        [1993, 2006],
      "SE-R":      [2002, 2006],
      "SL":        [2002, 2026],
      "S":         [2007, 2026],
      "SV":        [2007, 2026],
      "SR":        [2016, 2026],
      "Platinum":  [2019, 2022],
    },
    "Maxima": {
      "Any Trim":  [1990, 2023],
      "S":         [2004, 2023],
      "SV":        [2004, 2023],
      "SR":        [2004, 2023],
      "Platinum":  [2016, 2023],
    },
    "Rogue": {
      "Any Trim":  [2008, 2026],
      "S":         [2008, 2026],
      "SV":        [2008, 2026],
      "SL":        [2008, 2026],
      "Platinum":  [2017, 2023],
    },
    "Rogue Sport": {
      "Any Trim":  [2017, 2022],
      "S":         [2017, 2022],
      "SV":        [2017, 2022],
      "SL":        [2017, 2022],
    },
    "Murano": {
      "Any Trim":  [2003, 2026],
      "S":         [2003, 2026],
      "SV":        [2009, 2026],
      "SL":        [2003, 2026],
      "Platinum":  [2015, 2026],
    },
    "Pathfinder": {
      "Any Trim":  [1990, 2026],
      "XE":        [1990, 2004],
      "SE":        [1990, 2004],
      "LE":        [1990, 2004],
      "S":         [2005, 2026],
      "SV":        [2005, 2026],
      "SL":        [2005, 2026],
      "Rock Creek": [2019, 2026],
      "Platinum":  [2013, 2026],
    },
    "Armada": {
      "Any Trim":  [2004, 2026],
      "SE":        [2004, 2008],
      "LE":        [2004, 2008],
      "S":         [2017, 2026],
      "SV":        [2017, 2026],
      "SL":        [2004, 2026],
      "Platinum":  [2017, 2026],
    },
    "Frontier": {
      "Any Trim":  [1998, 2026],
      "XE":        [1998, 2004],
      "SE":        [1998, 2004],
      "S":         [2005, 2026],
      "SV":        [2005, 2026],
      "SL":        [2005, 2021],
      "Pro-4X":    [2009, 2026],
      "PRO-X":     [2022, 2026],
    },
    "Titan": {
      "Any Trim":          [2004, 2026],
      "SE":                [2004, 2012],
      "LE":                [2004, 2012],
      "Pro-4X":            [2004, 2021],
      "S":                 [2017, 2026],
      "SV":                [2017, 2026],
      "SL":                [2017, 2026],
      "Platinum":          [2017, 2021],
      "Platinum Reserve":  [2017, 2026],
    },
    "370Z": {
      "Any Trim":  [2009, 2021],
      "Base":      [2009, 2021],
      "Sport":     [2009, 2021],
      "Touring":   [2009, 2021],
      "NISMO":     [2009, 2021],
    },
    "400Z": {
      "Any Trim":    [2023, 2026],
      "Sport":       [2023, 2026],
      "Performance": [2023, 2026],
      "Proto Spec":  [2023, 2023],
    },
    "GT-R": {
      "Any Trim":        [2009, 2023],
      "Premium":         [2009, 2023],
      "Track Edition":   [2013, 2023],
      "NISMO":           [2015, 2023],
    },
    "Leaf": {
      "Any Trim": [2011, 2026],
      "S":        [2011, 2026],
      "SV":       [2011, 2026],
      "SL":       [2011, 2026],
      "SV Plus":  [2019, 2026],
      "SL Plus":  [2019, 2026],
    },
    "Ariya EV": {
      "Any Trim":   [2023, 2026],
      "Engage":     [2023, 2026],
      "Evolve+":    [2023, 2026],
      "Empower+":   [2023, 2026],
      "Platinum+":  [2023, 2026],
    },
  },
  "Hyundai": {
    "Sonata": {
      "Any Trim":   [1990, 2026],
      "GLS":        [1990, 2010],
      "GL":         [1990, 2001],
      "SE":         [2011, 2026],
      "SEL":        [2011, 2026],
      "SEL Plus":   [2018, 2026],
      "Limited":    [2011, 2026],
      "Sport":      [2015, 2020],
      "N Line":     [2022, 2026],
    },
    "Sonata Hybrid": {
      "Any Trim": [2011, 2026],
      "Blue":     [2020, 2026],
      "SE":       [2011, 2019],
      "SEL":      [2013, 2026],
      "Limited":  [2011, 2026],
    },
    "Elantra": {
      "Any Trim": [1991, 2026],
      "Base":     [1991, 2005],
      "GLS":      [1991, 2010],
      "GL":       [1991, 2001],
      "SE":       [2007, 2026],
      "SEL":      [2007, 2026],
      "Limited":  [2007, 2026],
      "Sport":    [2017, 2020],
      "N Line":   [2021, 2026],
    },
    "Elantra N": {
      "Any Trim": [2022, 2026],
      "Base":     [2022, 2026],
    },
    "Tucson": {
      "Any Trim": [2005, 2026],
      "GL":       [2005, 2009],
      "GLS":      [2005, 2015],
      "Limited":  [2005, 2026],
      "SE":       [2016, 2026],
      "SEL":      [2016, 2026],
      "N Line":   [2022, 2026],
      "XRT":      [2023, 2026],
    },
    "Tucson Hybrid": {
      "Any Trim": [2022, 2026],
      "Blue":     [2022, 2026],
      "SEL":      [2022, 2026],
      "N Line":   [2022, 2026],
      "Limited":  [2022, 2026],
    },
    "Santa Fe": {
      "Any Trim":    [2001, 2026],
      "GLS":         [2001, 2012],
      "SE":          [2013, 2026],
      "SEL":         [2019, 2026],
      "XRT":         [2021, 2026],
      "Limited":     [2001, 2026],
      "Calligraphy": [2021, 2026],
    },
    "Santa Fe Hybrid": {
      "Any Trim":    [2022, 2026],
      "Blue":        [2022, 2026],
      "SEL Premium": [2022, 2026],
      "Limited":     [2022, 2026],
      "Calligraphy": [2022, 2026],
    },
    "Palisade": {
      "Any Trim":    [2020, 2026],
      "SE":          [2020, 2026],
      "SEL":         [2020, 2026],
      "XRT":         [2023, 2026],
      "Limited":     [2020, 2026],
      "Calligraphy": [2020, 2026],
    },
    "Kona": {
      "Any Trim": [2018, 2026],
      "SE":       [2018, 2026],
      "SEL":      [2018, 2026],
      "N Line":   [2022, 2026],
      "Limited":  [2018, 2026],
    },
    "Kona Electric": {
      "Any Trim": [2019, 2026],
      "SE":       [2019, 2026],
      "SEL":      [2019, 2026],
      "Limited":  [2019, 2026],
    },
    "Ioniq 5": {
      "Any Trim":         [2022, 2026],
      "SE Standard Range":[2022, 2026],
      "SE":               [2022, 2026],
      "SEL":              [2022, 2026],
      "N Line":           [2024, 2026],
      "Limited":          [2022, 2026],
      "N":                [2024, 2026],
    },
    "Ioniq 6": {
      "Any Trim":          [2023, 2026],
      "SE Standard Range": [2023, 2026],
      "SE":                [2023, 2026],
      "SEL":               [2023, 2026],
      "Limited":           [2023, 2026],
    },
    "Ioniq 9": {
      "Any Trim": [2026, 2026],
      "SE":       [2026, 2026],
      "SEL":      [2026, 2026],
      "Limited":  [2026, 2026],
    },
    "Veloster N": {
      "Any Trim":           [2019, 2022],
      "Base":               [2019, 2022],
      "Performance Package":[2019, 2022],
    },
    "Santa Cruz": {
      "Any Trim":    [2022, 2026],
      "SE":          [2022, 2026],
      "SEL":         [2022, 2026],
      "SEL Premium": [2022, 2026],
      "Limited":     [2022, 2026],
    },
    "Accent": {
      "Any Trim": [1995, 2023],
      "GL":       [1995, 2011],
      "GS":       [1995, 2011],
      "GLS":      [1995, 2011],
      "SE":       [2012, 2023],
      "SEL":      [2018, 2023],
      "Limited":  [2018, 2023],
    },
    "Venue": {
      "Any Trim": [2020, 2026],
      "SE":       [2020, 2026],
      "SEL":      [2020, 2026],
      "Denim":    [2021, 2023],
      "Limited":  [2020, 2026],
    },
  },
  "Kia": {
    "Sorento": {
      "Any Trim":     [2003, 2026],
      "Base":         [2003, 2005],
      "EX":           [2003, 2026],
      "LX":           [2003, 2026],
      "S":            [2021, 2026],
      "SX":           [2011, 2026],
      "SX Prestige":  [2019, 2026],
    },
    "Sorento Hybrid": {
      "Any Trim":     [2022, 2026],
      "S":            [2022, 2026],
      "EX":           [2022, 2026],
      "SX Prestige":  [2022, 2026],
    },
    "Telluride": {
      "Any Trim":   [2020, 2026],
      "LX":         [2020, 2026],
      "S":          [2020, 2026],
      "EX":         [2020, 2026],
      "SX":         [2020, 2026],
      "X-Pro":      [2022, 2026],
      "X-Line":     [2022, 2026],
      "SX Prestige":[2020, 2026],
    },
    "Sportage": {
      "Any Trim":    [1995, 2026],
      "Base":        [1995, 2009],
      "EX":          [2005, 2026],
      "LX":          [2005, 2026],
      "SX Turbo":    [2013, 2026],
      "SX Prestige": [2017, 2026],
      "X-Pro":       [2023, 2026],
    },
    "K5": {
      "Any Trim":   [2021, 2026],
      "LXS":        [2021, 2026],
      "EX":         [2021, 2026],
      "GT-Line":    [2021, 2026],
      "GT":         [2021, 2026],
      "GT1":        [2021, 2026],
      "GT2":        [2021, 2026],
    },
    "Stinger": {
      "Any Trim":   [2018, 2023],
      "Base":       [2018, 2023],
      "GT-Line":    [2018, 2023],
      "GT1":        [2018, 2023],
      "GT2":        [2018, 2023],
    },
    "Stinger GT": {
      "Any Trim": [2018, 2023],
      "Base":     [2018, 2023],
      "GT2":      [2018, 2023],
    },
    "Soul": {
      "Any Trim": [2010, 2026],
      "Base":     [2010, 2021],
      "LX":       [2021, 2026],
      "S":        [2021, 2026],
      "EX":       [2010, 2026],
      "GT-Line":  [2016, 2026],
      "Turbo":    [2020, 2021],
    },
    "Forte": {
      "Any Trim": [2010, 2026],
      "EX":       [2010, 2021],
      "LX":       [2010, 2021],
      "FE":       [2019, 2026],
      "LXS":      [2019, 2026],
      "GT-Line":  [2017, 2026],
      "GT":       [2020, 2026],
      "GT2":      [2021, 2026],
    },
    "Rio": {
      "Any Trim": [2001, 2026],
      "Base":     [2001, 2011],
      "LX":       [2001, 2026],
      "S":        [2018, 2026],
      "EX":       [2001, 2017],
    },
    "Seltos": {
      "Any Trim": [2021, 2026],
      "LX":       [2021, 2026],
      "S":        [2021, 2026],
      "EX":       [2021, 2026],
      "SX":       [2021, 2026],
      "X-Pro":    [2023, 2026],
    },
    "Carnival": {
      "Any Trim":   [2022, 2026],
      "LX":         [2022, 2026],
      "EX":         [2022, 2026],
      "SX":         [2022, 2026],
      "SX Prestige":[2022, 2026],
    },
    "Niro": {
      "Any Trim": [2017, 2026],
      "FE":       [2017, 2022],
      "LX":       [2017, 2022],
      "EX":       [2017, 2026],
      "Touring":  [2017, 2026],
    },
    "Niro EV": {
      "Any Trim":  [2019, 2026],
      "Wind":      [2023, 2026],
      "Wave":      [2023, 2026],
      "GT-Line":   [2019, 2026],
    },
    "EV6": {
      "Any Trim":  [2022, 2026],
      "Light":     [2022, 2026],
      "Wind":      [2022, 2026],
      "Air":       [2022, 2026],
      "GT-Line":   [2022, 2026],
      "GT":        [2023, 2026],
    },
    "EV6 GT": {
      "Any Trim": [2023, 2026],
      "Base":     [2023, 2026],
    },
    "EV9": {
      "Any Trim": [2024, 2026],
      "Light":    [2024, 2026],
      "Wind":     [2024, 2026],
      "Land":     [2024, 2026],
    },
  },
  "Volkswagen": {
    "Jetta": {
      "Any Trim":      [1993, 2026],
      "GL":            [1993, 2004],
      "GLS":           [1993, 2004],
      "GLX":           [1993, 2004],
      "TDI":           [1996, 2015],
      "S":             [2011, 2026],
      "Sport":         [2019, 2026],
      "SE":            [2011, 2026],
      "SEL":           [2011, 2026],
      "SEL Premium":   [2019, 2024],
    },
    "Jetta GLI": {
      "Any Trim":           [2003, 2026],
      "S":                  [2019, 2026],
      "Autobahn":           [2019, 2026],
      "35th Anniversary":   [2021, 2021],
    },
    "Passat": {
      "Any Trim":    [1995, 2022],
      "GL":          [1995, 2004],
      "GLS":         [1995, 2004],
      "GLX":         [1995, 2004],
      "TDI":         [2002, 2015],
      "S":           [2012, 2022],
      "SE":          [2012, 2022],
      "SEL":         [2012, 2022],
      "SEL Premium": [2017, 2022],
    },
    "Golf": {
      "Any Trim": [1993, 2019],
      "GL":       [1993, 2006],
      "GLS":      [1993, 2006],
      "S":        [2010, 2019],
      "SE":       [2010, 2019],
      "SEL":      [2010, 2019],
    },
    "GTI": {
      "Any Trim":         [1990, 2026],
      "Base":             [1990, 2014],
      "S":                [2015, 2026],
      "SE":               [2015, 2026],
      "Autobahn":         [2019, 2026],
      "35th Anniversary": [2021, 2021],
      "Clubsport":        [2023, 2026],
    },
    "Golf R": {
      "Any Trim":          [2012, 2026],
      "Base":              [2012, 2026],
      "20th Anniversary":  [2022, 2022],
    },
    "Tiguan": {
      "Any Trim":    [2009, 2026],
      "S":           [2009, 2026],
      "SE":          [2009, 2026],
      "SEL":         [2009, 2022],
      "SEL Premium": [2018, 2022],
      "SEL R-Line":  [2022, 2024],
      "SEL R-Line Black": [2022, 2026],
    },
    "Atlas": {
      "Any Trim":        [2018, 2026],
      "S":               [2018, 2026],
      "SE":              [2018, 2026],
      "SE Technology":   [2019, 2026],
      "SEL":             [2018, 2026],
      "SEL Premium":     [2018, 2026],
    },
    "Atlas Cross Sport": {
      "Any Trim":        [2020, 2026],
      "S":               [2020, 2026],
      "SE":              [2020, 2026],
      "SE Technology":   [2020, 2026],
      "SEL":             [2020, 2026],
      "SEL Premium":     [2020, 2026],
    },
    "Taos": {
      "Any Trim": [2022, 2026],
      "S":        [2022, 2026],
      "SE":       [2022, 2026],
      "SEL":      [2022, 2026],
    },
    "Arteon": {
      "Any Trim":      [2019, 2024],
      "SE":            [2019, 2024],
      "SEL":           [2019, 2024],
      "SEL R-Line":    [2020, 2024],
      "SEL Premium":   [2019, 2024],
    },
    "ID.4": {
      "Any Trim":    [2021, 2026],
      "Standard":    [2021, 2022],
      "Pro":         [2021, 2026],
      "Pro S":       [2021, 2026],
      "Pro S Plus":  [2023, 2026],
      "GTX":         [2023, 2026],
    },
    "ID.Buzz": {
      "Any Trim":  [2025, 2026],
      "Pro":       [2025, 2026],
      "Pro S":     [2025, 2026],
      "Pro S Plus":[2025, 2026],
    },
  },
  "Mazda": {
    "Mazda2": {
      "Any Trim":       [2011, 2014],
      "Sport":          [2011, 2014],
      "Touring":        [2011, 2014],
      "Grand Touring":  [2011, 2014],
    },
    "Mazda3": {
      "Any Trim":       [2004, 2026],
      "i":              [2004, 2013],
      "s":              [2004, 2013],
      "Sport":          [2004, 2018],
      "Touring":        [2004, 2018],
      "Grand Touring":  [2004, 2018],
      "Select":         [2019, 2026],
      "Preferred":      [2019, 2026],
      "Premium":        [2019, 2026],
      "Carbon Edition": [2021, 2026],
    },
    "Mazda3 Turbo": {
      "Any Trim":   [2021, 2026],
      "Premium":    [2021, 2026],
      "Premium Plus":[2021, 2026],
    },
    "Mazda6": {
      "Any Trim":       [2003, 2021],
      "i":              [2003, 2013],
      "s":              [2003, 2013],
      "Sport":          [2003, 2021],
      "Touring":        [2003, 2021],
      "Grand Touring":  [2003, 2021],
      "Signature":      [2018, 2021],
    },
    "CX-3": {
      "Any Trim":       [2016, 2021],
      "Sport":          [2016, 2021],
      "Touring":        [2016, 2021],
      "Grand Touring":  [2016, 2021],
    },
    "CX-30": {
      "Any Trim":       [2020, 2026],
      "Select":         [2020, 2026],
      "Preferred":      [2020, 2026],
      "Premium":        [2020, 2026],
      "Turbo Premium":  [2021, 2026],
    },
    "CX-5": {
      "Any Trim":               [2013, 2026],
      "Sport":                  [2013, 2021],
      "Touring":                [2013, 2026],
      "Grand Touring":          [2013, 2026],
      "Grand Touring Reserve":  [2019, 2021],
      "Carbon Edition":         [2021, 2026],
      "Select":                 [2022, 2026],
      "Preferred":              [2022, 2026],
      "Signature":              [2019, 2026],
      "Turbo":                  [2022, 2026],
    },
    "CX-50": {
      "Any Trim":         [2023, 2026],
      "Select":           [2023, 2026],
      "Preferred":        [2023, 2026],
      "Premium":          [2023, 2026],
      "Premium Plus":     [2023, 2026],
      "Turbo Premium Plus":[2023, 2026],
    },
    "CX-9": {
      "Any Trim":       [2007, 2023],
      "Sport":          [2007, 2023],
      "Touring":        [2007, 2023],
      "Grand Touring":  [2007, 2023],
      "Signature":      [2018, 2023],
    },
    "CX-90": {
      "Any Trim":    [2024, 2026],
      "Select":      [2024, 2026],
      "Preferred":   [2024, 2026],
      "Premium":     [2024, 2026],
      "Premium Plus":[2024, 2026],
      "Signature":   [2024, 2026],
      "PHEV Premium":[2024, 2026],
    },
    "MX-5 Miata": {
      "Any Trim":       [1990, 2026],
      "Base":           [1990, 2014],
      "Sport":          [2006, 2026],
      "Club":           [2012, 2026],
      "Grand Touring":  [2006, 2026],
    },
    "MX-5 RF": {
      "Any Trim":       [2017, 2026],
      "Club":           [2017, 2026],
      "Grand Touring":  [2017, 2026],
    },
  },
  "Lexus": {
    "IS": {
      "Any Trim":   [1999, 2026],
      "IS 300":     [1999, 2026],
      "IS 350":     [2006, 2026],
      "IS 500":     [2022, 2026],
      "F Sport":    [2014, 2026],
    },
    "ES": {
      "Any Trim":     [1990, 2026],
      "ES 250":       [2019, 2026],
      "ES 300h":      [2013, 2026],
      "ES 350":       [2007, 2026],
      "F Sport":      [2019, 2026],
      "Ultra Luxury": [2020, 2026],
    },
    "GS": {
      "Any Trim":   [1993, 2020],
      "GS 300":     [1993, 2011],
      "GS 350":     [2007, 2020],
      "GS 200t":    [2016, 2018],
      "GS 450h":    [2007, 2018],
      "GS F":       [2016, 2020],
      "F Sport":    [2013, 2020],
    },
    "LS": {
      "Any Trim":       [1990, 2026],
      "LS 400":         [1990, 2000],
      "LS 430":         [2001, 2006],
      "LS 460":         [2007, 2017],
      "LS 500":         [2018, 2026],
      "LS 500h":        [2018, 2026],
      "LS 500 F Sport": [2018, 2026],
    },
    "RC": {
      "Any Trim": [2015, 2025],
      "RC 300":   [2015, 2025],
      "RC 350":   [2015, 2025],
      "F Sport":  [2015, 2025],
      "RC F":     [2015, 2025],
    },
    "LC": {
      "Any Trim":          [2018, 2026],
      "LC 500":            [2018, 2026],
      "LC 500h":           [2018, 2026],
      "LC 500 Inspiration":[2021, 2023],
    },
    "CT 200h": {
      "Any Trim": [2011, 2020],
      "Base":     [2011, 2020],
      "F Sport":  [2014, 2018],
    },
    "UX": {
      "Any Trim": [2019, 2026],
      "UX 200":   [2019, 2023],
      "UX 250h":  [2019, 2026],
      "F Sport":  [2019, 2026],
    },
    "NX": {
      "Any Trim":   [2015, 2026],
      "NX 250":     [2022, 2026],
      "NX 300":     [2015, 2021],
      "NX 300h":    [2015, 2021],
      "NX 350":     [2022, 2026],
      "NX 350h":    [2022, 2026],
      "NX 450h+":   [2022, 2026],
      "F Sport":    [2015, 2026],
    },
    "RX": {
      "Any Trim":          [1998, 2026],
      "RX 300":            [1998, 2003],
      "RX 330":            [2004, 2006],
      "RX 350":            [2007, 2026],
      "RX 350h":           [2023, 2026],
      "RX 400h":           [2006, 2009],
      "RX 450h":           [2010, 2022],
      "RX 500h F Sport":   [2023, 2026],
      "F Sport":           [2016, 2026],
    },
    "GX": {
      "Any Trim": [2003, 2026],
      "Premium":  [2003, 2023],
      "Luxury":   [2003, 2023],
      "Overtrail":[2024, 2026],
      "F Sport":  [2024, 2026],
    },
    "LX": {
      "Any Trim":    [1996, 2026],
      "Base":        [1996, 2026],
      "Luxury":      [2008, 2026],
      "F Sport":     [2022, 2026],
      "Ultra Luxury":[2022, 2026],
    },
    "IS F": {
      "Any Trim": [2008, 2014],
      "Base":     [2008, 2014],
    },
    "RC F": {
      "Any Trim":       [2015, 2025],
      "Base":           [2015, 2025],
      "Track Edition":  [2020, 2025],
    },
    "GS F": {
      "Any Trim": [2016, 2020],
      "Base":     [2016, 2020],
    },
    "LC F": {
      "Any Trim": [2022, 2026],
      "Base":     [2022, 2026],
    },
    "RZ EV": {
      "Any Trim": [2023, 2026],
      "Premium":  [2023, 2026],
      "Luxury":   [2023, 2026],
      "F Sport":  [2024, 2026],
    },
  },
// trimYears Batch 2: BMW, Audi, Mercedes-Benz, Jeep, Dodge, RAM
// Sources: Wikipedia, Edmunds, CarBuzz, JD Power model histories
  "BMW": {
    "3 Series": {
      "Any Trim":       [1990, 2026],
      "318i":           [1992, 2005],
      "323i":           [1998, 1999],
      "325i":           [1992, 2007],
      "325xi":          [2001, 2007],
      "325Ci":          [2001, 2006],
      "328i":           [1996, 2016],
      "328i xDrive":    [2007, 2016],
      "328d":           [2014, 2016],
      "328d xDrive":    [2014, 2016],
      "330i":           [2001, 2026],
      "330i xDrive":    [2017, 2026],
      "330xi":          [2001, 2006],
      "330Ci":          [2001, 2006],
      "335i":           [2007, 2015],
      "335i xDrive":    [2009, 2015],
      "335is":          [2011, 2013],
      "335d":           [2009, 2011],
      "340i":           [2016, 2018],
      "340i xDrive":    [2016, 2018],
      "330e":           [2016, 2026],
      "330e xDrive":    [2021, 2026],
      "M340i":          [2020, 2026],
      "M340i xDrive":   [2020, 2026],
      "320i":           [2013, 2018],
      "M3":             [1988, 2026],
    },
    "M3": {
      "Any Trim": [1988, 2026],
      "Base": [2014, 2026],
      "Competition": [2016, 2026],
      "CS": [2018, 2018],
      "xDrive": [2021, 2026],
    
      "CSL": [2023, 2024],
    },
    "5 Series": {
      "Any Trim":       [1990, 2026],
      "525i":           [1997, 2010],
      "528i":           [1997, 2016],
      "528i xDrive":    [2012, 2016],
      "530i":           [2001, 2026],
      "530i xDrive":    [2017, 2026],
      "530e":           [2018, 2026],
      "530e xDrive":    [2018, 2026],
      "535i":           [2004, 2016],
      "535i xDrive":    [2012, 2016],
      "535d":           [2014, 2016],
      "540i":           [1997, 2026],
      "540i xDrive":    [2017, 2026],
      "545i":           [2004, 2005],
      "550i":           [2006, 2016],
      "550i xDrive":    [2012, 2016],
      "M550i xDrive":   [2018, 2026],
      "M5":             [1991, 2026],
    },
    "M5": {
      "Any Trim": [1991, 2026],
      "Base": [1991, 2026],
      "Competition": [2018, 2026],
      "CS": [2022, 2022],
    },
    "X1": {
      "Any Trim": [2013, 2026],
      "sDrive28i": [2013, 2015],
      "xDrive28i": [2013, 2022],
      "xDrive28d": [2015, 2018],
      "sDrive18i": [2023, 2026],
      "xDrive23i": [2023, 2026],
      "M35i": [2023, 2026],
    },
    "X3": {
      "Any Trim":       [2004, 2026],
      "2.5i":           [2004, 2006],
      "3.0i":           [2004, 2010],
      "3.0si":          [2007, 2010],
      "xDrive28i":      [2011, 2017],
      "xDrive35i":      [2013, 2017],
      "sDrive30i":      [2018, 2026],
      "xDrive30i":      [2018, 2026],
      "xDrive30e":      [2020, 2023],
      "M40i":           [2018, 2026],
    },
    "X3 M": {
      "Any Trim": [2020, 2026],
      "Base": [2020, 2026],
      "Competition": [2020, 2026],
    },
    "X4": {
      "Any Trim": [2015, 2026],
      "xDrive28i": [2015, 2018],
      "xDrive35i": [2015, 2018],
      "xDrive30i": [2019, 2026],
      "M40i": [2019, 2026],
    },
    "X5": {
      "Any Trim":       [2000, 2026],
      "4.4i":           [2000, 2006],
      "3.0i":           [2001, 2006],
      "4.6is":          [2002, 2003],
      "4.8is":          [2004, 2006],
      "3.0si":          [2007, 2008],
      "4.8i":           [2007, 2008],
      "xDrive30i":      [2009, 2010],
      "xDrive48i":      [2009, 2010],
      "xDrive35d":      [2009, 2018],
      "xDrive35i":      [2011, 2018],
      "xDrive50i":      [2011, 2020],
      "sDrive35i":      [2014, 2018],
      "xDrive40e":      [2016, 2018],
      "xDrive40i":      [2019, 2026],
      "sDrive40i":      [2020, 2026],
      "M50i":           [2020, 2023],
      "xDrive45e":      [2021, 2023],
      "xDrive50e":      [2024, 2026],
      "M60i":           [2024, 2026],
    },
    "X5 M": {
      "Any Trim": [2010, 2026],
      "Base": [2010, 2026],
      "Competition": [2020, 2026],
    },
    "X6": {
      "Any Trim":       [2008, 2026],
      "xDrive35i":      [2008, 2019],
      "xDrive50i":      [2008, 2019],
      "sDrive35i":      [2015, 2019],
      "sDrive40i":      [2020, 2026],
      "xDrive40i":      [2020, 2026],
      "M50i":           [2020, 2023],
      "M60i":           [2024, 2026],
    },
    "X7": {
      "Any Trim": [2019, 2026],
      "xDrive40i": [2019, 2026],
      "xDrive50i": [2019, 2020],
      "M50i": [2019, 2022],
      "M60i": [2023, 2026],
      "xDrive40d": [2019, 2022],
    },
    "Z4": {
      "Any Trim":       [2003, 2026],
      "2.5i":           [2003, 2005],
      "3.0i":           [2003, 2008],
      "3.0si":          [2006, 2008],
      "M Roadster":     [2006, 2008],
      "sDrive30i":      [2009, 2026],
      "sDrive35i":      [2009, 2016],
      "sDrive35is":     [2011, 2016],
      "sDrive28i":      [2012, 2016],
      "M40i":           [2019, 2026],
    },
    "4 Series": {
      "Any Trim":       [2014, 2026],
      "428i":           [2014, 2016],
      "428i xDrive":    [2014, 2016],
      "435i":           [2014, 2016],
      "435i xDrive":    [2014, 2016],
      "430i":           [2017, 2026],
      "430i xDrive":    [2017, 2026],
      "440i":           [2017, 2026],
      "440i xDrive":    [2017, 2026],
      "M440i xDrive":   [2021, 2026],
    },
    "M4": {
      "Any Trim":       [2015, 2026],
      "Base":           [2015, 2026],
      "Competition":    [2016, 2026],
      "CS":             [2021, 2022],
      "CSL":            [2023, 2024],
    },
  },
  "Audi": {
    "A4": {
      "Any Trim":        [1996, 2026],
      "Base":            [1996, 2001],
      "1.8T":            [1996, 2008],
      "2.0T":            [2005, 2008],
      "2.8":             [1996, 2001],
      "3.0":             [2002, 2004],
      "3.2":             [2005, 2008],
      "Premium":         [2009, 2026],
      "Premium Plus":    [2009, 2026],
      "Prestige":        [2009, 2026],
      "allroad Premium": [2013, 2026],
      "allroad Prestige":[2013, 2026],
    },
    "S4": {
      "Any Trim": [1992, 2026],
      "Premium": [2004, 2026],
      "Premium Plus": [2004, 2026],
      "Prestige": [2013, 2026],
    },
    "RS4": {
      "Any Trim": [2007, 2012],
      "Base": [2007, 2012],
    },
    "A5": {
      "Any Trim":           [2008, 2026],
      "Premium":            [2008, 2026],
      "Premium Plus":       [2008, 2026],
      "Prestige":           [2008, 2026],
      "Sportback Premium":  [2018, 2026],
      "Cabriolet Premium":  [2008, 2017],
    },
    "S5": {
      "Any Trim":          [2008, 2026],
      "Premium":           [2018, 2026],
      "Premium Plus":      [2018, 2026],
      "Prestige":          [2018, 2026],
      "Sportback Premium": [2018, 2026],
    },
    "A6": {
      "Any Trim":       [1995, 2026],
      "Base":           [1995, 2004],
      "2.7T":           [1999, 2004],
      "4.2":            [1999, 2010],
      "4.2 Prestige":   [2005, 2011],
      "Premium":        [2005, 2026],
      "Premium Plus":   [2005, 2026],
      "Prestige":       [2005, 2026],
      "3.0T Prestige":  [2012, 2018],
      "allroad Premium":[2013, 2018],
    },
    "S6": {
      "Any Trim": [2002, 2026],
      "Premium": [2012, 2026],
      "Premium Plus": [2012, 2026],
      "Prestige": [2012, 2026],
    },
    "A7": {
      "Any Trim": [2012, 2026],
      "Premium": [2012, 2026],
      "Premium Plus": [2012, 2026],
      "Prestige": [2012, 2026],
    },
    "A8": {
      "Any Trim":        [1994, 2026],
      "Base":            [1994, 2002],
      "A8":              [1997, 2010],
      "L":               [2004, 2026],
      "A8 L":            [2004, 2026],
      "L 55 TFSI":       [2019, 2026],
      "A8 L 60 TFSI e":  [2020, 2026],
    },
    "Q3": {
      "Any Trim": [2015, 2026],
      "Premium": [2015, 2026],
      "Premium Plus": [2015, 2026],
      "Prestige": [2015, 2026],
    },
    "Q5": {
      "Any Trim": [2009, 2026],
      "Premium": [2009, 2026],
      "Premium Plus": [2009, 2026],
      "Prestige": [2009, 2026],
    
      "PHEV Premium": [2018, 2026],
      "Sportback Premium": [2021, 2026],
    },
    "SQ5": {
      "Any Trim": [2014, 2026],
      "Premium": [2014, 2026],
      "Premium Plus": [2014, 2026],
      "Prestige": [2014, 2026],
    },
    "Q5 e": {
      "Any Trim": [2021, 2026],
      "Premium": [2021, 2026],
      "Premium Plus": [2021, 2026],
      "Prestige": [2021, 2026],
    },
    "Q7": {
      "Any Trim":       [2007, 2026],
      "Premium":        [2007, 2026],
      "Premium Plus":   [2007, 2026],
      "Prestige":       [2007, 2026],
      "3.0T Premium":   [2007, 2015],
      "4.2 Premium":    [2007, 2010],
    },
    "SQ7": {
      "Any Trim": [2020, 2026],
      "Premium": [2020, 2026],
      "Premium Plus": [2020, 2026],
      "Prestige": [2020, 2026],
    },
    "Q8": {
      "Any Trim": [2019, 2026],
      "Premium": [2019, 2026],
      "Premium Plus": [2019, 2026],
      "Prestige": [2019, 2026],
    },
    "e-tron": {
      "Any Trim":     [2019, 2023],
      "Premium":      [2019, 2023],
      "Premium Plus": [2019, 2023],
      "Prestige":     [2019, 2023],
      "S":            [2021, 2023],
    },
    "Q8 e-tron": {
      "Any Trim": [2024, 2026],
      "Premium": [2024, 2026],
      "Premium Plus": [2024, 2026],
      "Prestige": [2024, 2026],
    },
    "RS7": {
      "Any Trim": [2014, 2026],
      "Base": [2014, 2026],
      "Performance": [2016, 2016],
    },
    "TT": {
      "Any Trim":   [2000, 2023],
      "Base":       [2000, 2006],
      "Coupe":      [2000, 2023],
      "Roadster":   [2000, 2023],
      "2.0T":       [2008, 2015],
      "3.2":        [2004, 2008],
      "TTS":        [2009, 2023],
      "TTRS":       [2009, 2023],
      "2.0 TFSI":   [2016, 2023],
    },
    "R8": {
      "Any Trim":          [2008, 2024],
      "V8":                [2008, 2015],
      "V10":               [2010, 2024],
      "V10 RWD":           [2017, 2024],
      "V10 Plus":          [2016, 2022],
      "V10 Performance":   [2020, 2024],
      "V10 GT RWD":        [2023, 2024],
    },
  },
  "Mercedes-Benz": {
    "C-Class": {
      "Any Trim":                  [1994, 2026],
      "C 220":                     [1994, 2000],
      "C 230":                     [1994, 2007],
      "C 240":                     [2001, 2005],
      "C 280":                     [2006, 2007],
      "C 300":                     [2008, 2026],
      "C 300 4MATIC":              [2008, 2026],
      "C 320":                     [2001, 2007],
      "C 350":                     [2006, 2015],
      "C 350 4MATIC":              [2008, 2014],
      "C 350e":                    [2016, 2018],
      "AMG C 43":                  [2016, 2026],
      "C 43 AMG":                  [2016, 2026],
      "AMG C 55":                  [2005, 2007],
      "AMG C 63":                  [2015, 2023],
      "C 63 AMG":                  [2008, 2023],
      "AMG C 63 S":                [2016, 2023],
      "C 63 S AMG":                [2015, 2023],
      "AMG C 63 S E Performance":  [2024, 2026],
    },
    "E-Class": {
      "Any Trim":       [1994, 2026],
      "E 320":          [1994, 2009],
      "E 430":          [1998, 2002],
      "E 500":          [2003, 2006],
      "E 350":          [2006, 2022],
      "E 350 4MATIC":   [2006, 2022],
      "E 550":          [2007, 2016],
      "E 400":          [2014, 2022],
      "E 300":          [2017, 2019],
      "E 450":          [2019, 2026],
      "E 450 4MATIC":   [2019, 2026],
      "E 53 AMG":       [2019, 2026],
      "AMG E 55":       [1999, 2006],
      "AMG E 63":       [2007, 2026],
      "E 63 AMG":       [2007, 2026],
      "AMG E 63 S":     [2017, 2026],
      "E 63 S AMG":     [2018, 2026],
    },
    "S-Class": {
      "Any Trim":        [1990, 2026],
      "S 320":           [1994, 1999],
      "S 420":           [1994, 1999],
      "S 430":           [2000, 2006],
      "S 450":           [2007, 2026],
      "S 500":           [1994, 2013],
      "S 550":           [2007, 2020],
      "S 560":           [2018, 2021],
      "S 580":           [2021, 2026],
      "S 580 4MATIC":    [2021, 2026],
      "S 600":           [1994, 2013],
      "S 680":           [2022, 2026],
      "AMG S 63":        [2007, 2026],
      "S 63 AMG":        [2007, 2026],
      "AMG S 65":        [2007, 2022],
      "Maybach S 560":   [2018, 2021],
      "Maybach S 580":   [2021, 2026],
      "Maybach S 650":   [2018, 2020],
      "Maybach S 680":   [2022, 2026],
    },
    "GLC": {
      "Any Trim":                      [2016, 2026],
      "GLC 300":                       [2016, 2026],
      "GLC 300 4MATIC":                [2016, 2026],
      "GLC 350e":                      [2016, 2020],
      "AMG GLC 43":                    [2017, 2026],
      "GLC 43 AMG":                    [2017, 2026],
      "AMG GLC 63":                    [2017, 2023],
      "GLC 63 AMG":                    [2017, 2023],
      "AMG GLC 63 S":                  [2018, 2023],
      "AMG GLC 63 S E Performance":    [2025, 2026],
    },
    "GLE": {
      "Any Trim":       [2016, 2026],
      "GLE 300d":       [2016, 2019],
      "GLE 350":        [2016, 2026],
      "GLE 350 4MATIC": [2016, 2026],
      "GLE 350d":       [2016, 2019],
      "GLE 400":        [2016, 2019],
      "GLE 450":        [2016, 2026],
      "GLE 450 AMG":    [2016, 2019],
      "GLE 450e":       [2023, 2026],
      "GLE 580":        [2020, 2026],
      "AMG GLE 43":     [2017, 2019],
      "AMG GLE 53":     [2020, 2026],
      "GLE 53 AMG":     [2020, 2026],
      "AMG GLE 63":     [2016, 2022],
      "GLE 63 AMG":     [2016, 2019],
      "AMG GLE 63 S":   [2020, 2026],
    },
    "GLS": {
      "Any Trim": [2017, 2026],
      "GLS 450": [2017, 2026],
      "GLS 580": [2020, 2026],
      "AMG GLS 63": [2021, 2026],
      "Maybach GLS 600": [2021, 2026],
    },
    "GLK": {
      "Any Trim": [2010, 2015],
      "GLK 250 BlueTEC": [2013, 2015],
      "GLK 350": [2010, 2015],
      "GLK 350 4MATIC": [2010, 2015],
    },
    "ML-Class": {
      "Any Trim":           [1998, 2015],
      "ML 320":             [1998, 2005],
      "ML 430":             [1998, 2001],
      "ML 500":             [2002, 2011],
      "ML 320 CDI":         [2006, 2011],
      "ML 350":             [2003, 2015],
      "ML 350 BlueTEC":     [2012, 2015],
      "ML 550":             [2007, 2015],
      "AMG ML 55":          [2000, 2003],
      "AMG ML 63":          [2007, 2015],
    },
    "CLA": {
      "Any Trim":         [2014, 2026],
      "CLA 250":          [2014, 2026],
      "CLA 250 4MATIC":   [2015, 2026],
      "CLA 45 AMG":       [2014, 2019],
      "AMG CLA 45":       [2014, 2019],
      "AMG CLA 35":       [2020, 2026],
    },
    "GLA": {
      "Any Trim":         [2015, 2026],
      "GLA 250":          [2015, 2026],
      "GLA 250 4MATIC":   [2015, 2026],
      "GLA 45 AMG":       [2015, 2024],
      "AMG GLA 45":       [2015, 2024],
      "AMG GLA 35":       [2021, 2026],
      "GLA 35 AMG":       [2021, 2026],
    },
    "AMG GT": {
      "Any Trim":             [2016, 2026],
      "AMG GT":               [2016, 2026],
      "AMG GT S":             [2016, 2026],
      "AMG GT C":             [2018, 2021],
      "AMG GT R":             [2018, 2026],
      "AMG GT Black Series":  [2021, 2023],
      "AMG GT 43":            [2019, 2023],
      "AMG GT 63 S":          [2019, 2023],
    },
    "AMG C 63": {
      "Any Trim": [2015, 2026],
      "Base": [2015, 2023],
      "S": [2016, 2023],
      "S E Performance": [2024, 2026],
    },
  },
  "Jeep": {
    "Grand Cherokee": {
      "Any Trim":         [1993, 2026],
      "SE":               [1993, 1995],
      "Laredo":           [1993, 2026],
      "Limited":          [1993, 2026],
      "Orvis":            [1995, 1998],
      "Overland":         [1999, 2026],
      "SRT8":             [2006, 2014],
      "Laredo X":         [2011, 2026],
      "Summit":           [2011, 2026],
      "High Altitude":    [2012, 2021],
      "Trailhawk":        [2014, 2022],
      "SRT":              [2015, 2021],
      "Sterling Edition": [2018, 2019],
      "Trackhawk":        [2018, 2021],
      "Altitude":         [2022, 2026],
      "Summit Reserve":   [2022, 2026],
    },
    "Wrangler": {
      "Any Trim": [1987, 2026],
      "S": [1987, 1995],
      "Sport": [1997, 2026],
      "Sport S": [2011, 2026],
      "Sahara": [1997, 2026],
      "Rubicon": [2003, 2026],
      "Willys": [2016, 2026],
      "Willys Wheeler": [2014, 2017],
      "Freedom": [2012, 2014],
      "High Altitude": [2013, 2014],
      "Islander": [2021, 2022],
      "Xtreme Recon": [2022, 2026],
      "4xe": [2021, 2026],
      "392": [2021, 2026],
    
      "Base": [1987, 1995],
      "X": [2003, 2010],
      "Renegade": [1987, 1995],
      "Unlimited Sport": [2004, 2018],
      "Altitude": [2012, 2022],
    },
    "Cherokee": {
      "Any Trim":       [1984, 2023],
      "Base":           [1984, 2000],
      "Sport":          [1984, 2023],
      "Country":        [1984, 2001],
      "Classic":        [1997, 2001],
      "Latitude":       [2014, 2023],
      "Limited":        [2014, 2023],
      "Trailhawk":      [2014, 2023],
      "Overland":       [2014, 2023],
      "High Altitude":  [2020, 2023],
    },
    "Gladiator": {
      "Any Trim": [2020, 2026],
      "Sport": [2020, 2026],
      "Sport S": [2020, 2026],
      "Willys": [2020, 2026],
      "Overland": [2020, 2026],
      "Rubicon": [2020, 2026],
      "Mojave": [2021, 2026],
      "High Altitude": [2022, 2026],
    },
    "Compass": {
      "Any Trim":       [2007, 2026],
      "Sport":          [2007, 2026],
      "Latitude":       [2007, 2026],
      "Latitude Lux":   [2021, 2026],
      "Limited":        [2007, 2026],
      "Trailhawk":      [2017, 2026],
      "High Altitude":  [2020, 2026],
    },
    "Renegade": {
      "Any Trim":   [2015, 2026],
      "Sport":      [2015, 2026],
      "Latitude":   [2015, 2026],
      "Altitude":   [2016, 2026],
      "Limited":    [2015, 2026],
      "Trailhawk":  [2015, 2026],
    },
  },
  "Dodge": {
    "Charger": {
      "Any Trim":             [2006, 2023],
      "SE":                   [2006, 2014],
      "SXT":                  [2006, 2023],
      "SXT AWD":              [2013, 2023],
      "GT":                   [2017, 2023],
      "R/T":                  [2006, 2023],
      "R/T Scat Pack":        [2015, 2023],
      "SRT8":                 [2006, 2014],
      "SRT 392":              [2015, 2023],
      "SRT Hellcat":          [2015, 2023],
      "SRT Hellcat Redeye":   [2021, 2023],
      "Daytona":              [2006, 2009],
    },
    "Challenger": {
      "Any Trim":             [2008, 2023],
      "SE":                   [2008, 2011],
      "SXT":                  [2012, 2023],
      "GT":                   [2017, 2023],
      "R/T":                  [2008, 2023],
      "R/T Scat Pack":        [2015, 2023],
      "T/A":                  [2017, 2021],
      "T/A 392":              [2017, 2021],
      "SRT8":                 [2008, 2014],
      "SRT 392":              [2015, 2023],
      "SRT Hellcat":          [2015, 2023],
      "SRT Hellcat Redeye":   [2019, 2023],
      "SRT Demon":            [2018, 2018],
      "SRT Demon 170":        [2023, 2023],
    },
    "Durango": {
      "Any Trim":       [1998, 2026],
      "Base":           [1998, 2002],
      "Sport":          [1998, 2003],
      "SLT":            [1998, 2009],
      "SXT":            [2004, 2026],
      "Limited":        [2004, 2009],
      "R/T":            [2011, 2026],
      "Citadel":        [2012, 2026],
      "SRT8":           [2012, 2014],
      "GT":             [2018, 2026],
      "SRT 392":        [2018, 2026],
      "SRT Hellcat":    [2021, 2021],
    },
    "Grand Caravan": {
      "Any Trim":   [1984, 2020],
      "Base":       [1984, 1995],
      "SE":         [1996, 2020],
      "SE Plus":    [2011, 2020],
      "C/V":        [2012, 2014],
      "SXT":        [2001, 2020],
      "GT":         [2017, 2020],
      "R/T":        [2008, 2010],
    },
  },
  "RAM": {
    "1500": {
      "Any Trim":           [1994, 2026],
      "ST":                 [1994, 2019],
      "SLT":                [1994, 2026],
      "Sport":              [1994, 2026],
      "Laramie":            [2002, 2026],
      "Tradesman":          [2009, 2026],
      "Express":            [2011, 2026],
      "Big Horn":           [2011, 2026],
      "Lone Star":          [2011, 2026],
      "Laramie Longhorn":   [2011, 2026],
      "HFE":                [2013, 2018],
      "Limited":            [2014, 2026],
      "Rebel":              [2015, 2026],
      "Limited Longhorn":   [2015, 2026],
      "TRX":                [2021, 2024],
    },
    "2500": {
      "Any Trim": [1994, 2026],
      "Tradesman": [2010, 2026],
      "SLT": [1994, 2026],
      "Big Horn": [2011, 2026],
      "Laramie": [2002, 2026],
      "Power Wagon": [2005, 2026],
      "Laramie Longhorn": [2011, 2026],
      "Limited": [2014, 2026],
    },
    "3500": {
      "Any Trim": [1994, 2026],
      "Tradesman": [2010, 2026],
      "SLT": [1994, 2026],
      "Big Horn": [2011, 2026],
      "Laramie": [2002, 2026],
      "Laramie Longhorn": [2011, 2026],
      "Limited": [2014, 2026],
    },
    "ProMaster": {
      "Any Trim":    [2014, 2026],
      "1500":        [2014, 2026],
      "2500":        [2014, 2026],
      "3500":        [2014, 2026],
      "Cargo":       [2014, 2026],
      "Window Van":  [2014, 2026],
      "Cutaway":     [2014, 2026],
    },
  },
  "Acura": {
    "ILX": {
      "Any Trim":   [2013, 2022],
      "Base":       [2013, 2022],
      "Premium":    [2013, 2022],
      "Technology": [2013, 2022],
      "A-Spec":     [2019, 2022],
    },
    "Integra": {
      "Any Trim":   [2023, 2026],
      "Base":       [2023, 2026],
      "Standard":   [2023, 2026],
      "Technology": [2023, 2026],
      "A-Spec":     [2023, 2026],
      "Type S":     [2023, 2026],
    },
    "TL": {
      "Any Trim":    [1995, 2014],
      "Base":        [1995, 2014],
      "Technology":  [2004, 2014],
      "SH-AWD":      [2009, 2014],
      "SH-AWD Tech": [2009, 2014],
    },
    "TLX": {
      "Any Trim":   [2015, 2026],
      "Base":       [2015, 2026],
      "Standard":   [2021, 2026],
      "Technology": [2015, 2026],
      "A-Spec":     [2018, 2026],
      "SH-AWD":     [2015, 2026],
      "Type S":     [2021, 2026],
    },
    "RL": {
      "Any Trim":   [1996, 2012],
      "Base":       [1996, 2012],
      "Technology": [2005, 2012],
    },
    "RLX": {
      "Any Trim":                [2014, 2020],
      "Base":                    [2014, 2020],
      "Technology":              [2014, 2020],
      "Sport Hybrid":            [2015, 2020],
      "Sport Hybrid Advance":    [2015, 2020],
    },
    "RDX": {
      "Any Trim":     [2007, 2026],
      "Base":         [2007, 2026],
      "Technology":   [2007, 2026],
      "A-Spec":       [2019, 2026],
      "Advance":      [2019, 2026],
      "PMC Edition":  [2021, 2022],
    },
    "MDX": {
      "Any Trim":       [2001, 2026],
      "Base":           [2001, 2026],
      "Technology":     [2007, 2026],
      "SH-AWD":         [2007, 2026],
      "Advance":        [2022, 2026],
      "Type S":         [2022, 2026],
      "Type S Advance": [2022, 2026],
    },
    "NSX": {
      "Any Trim": [2017, 2022],
      "Base":     [2017, 2022],
      "Type S":   [2022, 2022],
    },
    "ZDX": {
      "Any Trim": [2024, 2026],
      "A-Spec":   [2024, 2026],
      "Type S":   [2024, 2026],
    },
  },
  "Buick": {
    "Encore": {
      "Any Trim":       [2013, 2022],
      "Base":           [2013, 2022],
      "Preferred":      [2017, 2022],
      "Essence":        [2017, 2022],
      "Sport Touring":  [2018, 2022],
    },
    "Encore GX": {
      "Any Trim":       [2020, 2026],
      "Select":         [2020, 2026],
      "Preferred":      [2020, 2026],
      "Essence":        [2020, 2026],
      "Sport Touring":  [2020, 2026],
      "Avenir":         [2021, 2026],
    },
    "Envision": {
      "Any Trim":   [2016, 2026],
      "Preferred":  [2021, 2026],
      "Essence":    [2016, 2026],
      "Avenir":     [2021, 2026],
    },
    "Envista": {
      "Any Trim":   [2024, 2026],
      "Base":       [2024, 2026],
      "Preferred":  [2024, 2026],
      "Essence":    [2024, 2026],
    },
    "Enclave": {
      "Any Trim":   [2008, 2026],
      "CX":         [2008, 2012],
      "CXL":        [2008, 2012],
      "Leather":    [2013, 2017],
      "Preferred":  [2018, 2026],
      "Essence":    [2018, 2026],
      "Avenir":     [2018, 2026],
    },
    "LaCrosse": {
      "Any Trim":   [2005, 2019],
      "Base":       [2005, 2019],
      "Preferred":  [2017, 2019],
      "Essence":    [2017, 2019],
      "Premium":    [2017, 2019],
    },
    "Regal": {
      "Any Trim":   [1988, 2020],
      "Base":       [1988, 2004],
      "Preferred":  [2018, 2020],
      "Essence":    [2018, 2020],
      "GS":         [2012, 2020],
    },
    "Verano": {
      "Any Trim":       [2012, 2017],
      "Base":           [2012, 2017],
      "Convenience":    [2012, 2017],
      "Leather":        [2012, 2017],
      "Premium":        [2012, 2017],
    },
  },
  "Cadillac": {
    "ATS": {
      "Any Trim":     [2013, 2019],
      "Base":         [2013, 2019],
      "Luxury":       [2013, 2019],
      "Performance":  [2013, 2019],
      "Premium":      [2013, 2019],
      "V":            [2016, 2019],
    },
    "CT4": {
      "Any Trim":            [2020, 2026],
      "Luxury":              [2020, 2026],
      "Premium Luxury":      [2020, 2026],
      "Sport":               [2020, 2026],
      "V-Series":            [2022, 2026],
      "V-Series Blackwing":  [2022, 2026],
    },
    "CT5": {
      "Any Trim":            [2020, 2026],
      "Luxury":              [2020, 2026],
      "Premium Luxury":      [2020, 2026],
      "Sport":               [2020, 2026],
      "V-Series":            [2022, 2026],
      "V-Series Blackwing":  [2022, 2026],
    },
    "CTS": {
      "Any Trim":     [2003, 2019],
      "Base":         [2003, 2019],
      "Luxury":       [2003, 2019],
      "Performance":  [2014, 2019],
      "Vsport":       [2014, 2019],
      "V":            [2004, 2019],
    },
    "XTS": {
      "Any Trim":   [2013, 2019],
      "Luxury":     [2013, 2019],
      "Platinum":   [2013, 2019],
      "Vsport":     [2013, 2019],
    },
    "XT4": {
      "Any Trim":         [2019, 2026],
      "Luxury":           [2019, 2026],
      "Premium Luxury":   [2019, 2026],
      "Sport":            [2019, 2026],
    },
    "XT5": {
      "Any Trim":         [2017, 2026],
      "Luxury":           [2017, 2026],
      "Premium Luxury":   [2017, 2026],
      "Sport":            [2020, 2026],
      "Platinum":         [2017, 2026],
    },
    "XT6": {
      "Any Trim":         [2020, 2026],
      "Luxury":           [2020, 2026],
      "Premium Luxury":   [2020, 2026],
      "Sport":            [2020, 2026],
      "Platinum":         [2020, 2026],
    },
    "Escalade": {
      "Any Trim":         [1999, 2026],
      "Base":             [1999, 2026],
      "Luxury":           [2007, 2026],
      "Premium Luxury":   [2017, 2026],
      "Sport Platinum":   [2021, 2026],
      "Platinum":         [2007, 2026],
    },
    "Escalade ESV": {
      "Any Trim":         [2003, 2026],
      "Base":             [2003, 2026],
      "Luxury":           [2007, 2026],
      "Premium Luxury":   [2017, 2026],
      "Platinum":         [2007, 2026],
    },
    "Lyriq": {
      "Any Trim":    [2023, 2026],
      "Luxury":      [2023, 2026],
      "Sport":       [2023, 2026],
      "Luxury AWD":  [2023, 2026],
    },
  },
  "GMC": {
    "Sierra 1500": {
      "Any Trim":       [1999, 2026],
      "Base":           [1999, 2013],
      "SL":             [1999, 2006],
      "SLE":            [1999, 2026],
      "SLT":            [1999, 2026],
      "Z71":            [1999, 2026],
      "AT4":            [2019, 2026],
      "Denali":         [2002, 2026],
      "Pro":            [2019, 2026],
      "Elevation":      [2019, 2026],
    },
    "Sierra 2500HD": {
      "Any Trim":   [2001, 2026],
      "SLE":        [2001, 2026],
      "SLT":        [2001, 2026],
      "AT4":        [2020, 2026],
      "Denali":     [2002, 2026],
    },
    "Sierra 3500HD": {
      "Any Trim":   [2001, 2026],
      "SLE":        [2001, 2026],
      "SLT":        [2001, 2026],
      "Denali":     [2002, 2026],
    },
    "Terrain": {
      "Any Trim":   [2010, 2026],
      "SLE":        [2010, 2026],
      "SLT":        [2010, 2026],
      "AT4":        [2019, 2026],
      "Denali":     [2013, 2026],
    },
    "Acadia": {
      "Any Trim":   [2007, 2026],
      "SLE":        [2007, 2026],
      "SLT":        [2007, 2026],
      "AT4":        [2020, 2026],
      "Denali":     [2007, 2026],
    },
    "Canyon": {
      "Any Trim":   [2004, 2026],
      "Base":       [2004, 2012],
      "SLE":        [2004, 2026],
      "SLT":        [2004, 2026],
      "AT4":        [2021, 2026],
      "Denali":     [2015, 2026],
    },
    "Yukon": {
      "Any Trim":   [1992, 2026],
      "Base":       [1992, 2014],
      "SLE":        [1992, 2026],
      "SLT":        [1992, 2026],
      "AT4":        [2021, 2026],
      "Denali":     [2002, 2026],
    },
    "Yukon XL": {
      "Any Trim":   [1999, 2026],
      "SLE":        [1999, 2026],
      "SLT":        [1999, 2026],
      "AT4":        [2021, 2026],
      "Denali":     [2002, 2026],
    },
    "Envoy": {
      "Any Trim": [2002, 2009],
      "SLE":      [2002, 2009],
      "SLT":      [2002, 2009],
      "Denali":   [2002, 2009],
    },
  },
  "Chrysler": {
    "300": {
      "Any Trim":   [2005, 2023],
      "Base":       [2005, 2010],
      "Touring":    [2005, 2023],
      "Touring L":  [2012, 2023],
      "Limited":    [2005, 2023],
      "S":          [2012, 2023],
      "C":          [2012, 2023],
      "SRT8":       [2005, 2014],
    },
    "300 SRT": {
      "Any Trim": [2005, 2014],
      "SRT8":     [2005, 2014],
    },
    "200": {
      "Any Trim":   [2011, 2017],
      "LX":         [2011, 2017],
      "Touring":    [2011, 2017],
      "Limited":    [2011, 2017],
      "S":          [2015, 2017],
      "C":          [2015, 2017],
    },
    "Pacifica": {
      "Any Trim":   [2017, 2026],
      "Touring":    [2017, 2026],
      "Touring L":  [2017, 2026],
      "Limited":    [2017, 2026],
      "Pinnacle":   [2021, 2026],
    },
    "Pacifica Hybrid": {
      "Any Trim":   [2018, 2026],
      "Touring":    [2018, 2026],
      "Touring L":  [2018, 2026],
      "Limited":    [2018, 2026],
      "Pinnacle":   [2021, 2026],
    },
    "Voyager": {
      "Any Trim": [2020, 2023],
      "Base":     [2020, 2023],
      "LX":       [2020, 2023],
    },
    "Aspen": {
      "Any Trim": [2007, 2009],
      "Base":     [2007, 2009],
      "Limited":  [2007, 2009],
    },
  },
  "Lincoln": {
    "MKZ": {
      "Any Trim":       [2007, 2020],
      "Base":           [2007, 2020],
      "Select":         [2013, 2020],
      "Reserve":        [2017, 2020],
      "Black Label":    [2017, 2020],
    },
    "MKC": {
      "Any Trim":       [2015, 2019],
      "Base":           [2015, 2019],
      "Select":         [2015, 2019],
      "Reserve":        [2015, 2019],
      "Black Label":    [2017, 2019],
    },
    "MKX": {
      "Any Trim":       [2007, 2018],
      "Base":           [2007, 2018],
      "Select":         [2016, 2018],
      "Reserve":        [2016, 2018],
      "Black Label":    [2017, 2018],
    },
    "MKT": {
      "Any Trim":   [2010, 2019],
      "Base":       [2010, 2019],
      "EcoBoost":   [2010, 2019],
    },
    "Corsair": {
      "Any Trim":       [2020, 2026],
      "Standard":       [2020, 2026],
      "Reserve":        [2020, 2026],
      "Grand Touring":  [2021, 2026],
      "Black Label":    [2020, 2026],
    },
    "Nautilus": {
      "Any Trim":       [2019, 2026],
      "Standard":       [2019, 2026],
      "Reserve":        [2019, 2026],
      "Black Label":    [2019, 2026],
    },
    "Aviator": {
      "Any Trim":       [2020, 2026],
      "Standard":       [2020, 2026],
      "Reserve":        [2020, 2026],
      "Grand Touring":  [2020, 2026],
      "Black Label":    [2020, 2026],
    },
    "Aviator PHEV": {
      "Any Trim":       [2020, 2026],
      "Grand Touring":  [2020, 2026],
      "Black Label":    [2020, 2026],
    },
    "Navigator": {
      "Any Trim":       [1998, 2026],
      "Base":           [1998, 2026],
      "Reserve":        [2018, 2026],
      "Black Label":    [2018, 2026],
    },
    "Navigator L": {
      "Any Trim":       [2007, 2026],
      "Base":           [2007, 2026],
      "Reserve":        [2018, 2026],
      "Black Label":    [2018, 2026],
    },
    "Continental": {
      "Any Trim":       [2017, 2020],
      "Premiere":       [2017, 2020],
      "Select":         [2017, 2020],
      "Reserve":        [2017, 2020],
      "Black Label":    [2017, 2020],
    },
  },
  "Infiniti": {
    "G35 / G37": {
      "Any Trim":   [2003, 2013],
      "Base":       [2003, 2013],
      "Journey":    [2003, 2013],
      "Sport":      [2003, 2013],
      "IPL":        [2011, 2013],
    },
    "Q50": {
      "Any Trim":         [2014, 2026],
      "Pure":             [2014, 2026],
      "Luxe":             [2018, 2026],
      "Sensory":          [2018, 2026],
      "Sport":            [2016, 2026],
      "Red Sport 400":    [2016, 2026],
    },
    "Q60": {
      "Any Trim":       [2017, 2022],
      "Pure":           [2017, 2022],
      "Luxe":           [2017, 2022],
      "Sensory":        [2017, 2022],
      "Sport":          [2017, 2022],
      "Red Sport 400":  [2017, 2022],
    },
    "Q70": {
      "Any Trim": [2014, 2019],
      "Base":     [2014, 2019],
      "Hybrid":   [2014, 2019],
    },
    "QX30": {
      "Any Trim": [2017, 2019],
      "Base":     [2017, 2019],
      "Premium":  [2017, 2019],
      "Sport":    [2017, 2019],
      "Luxe":     [2017, 2019],
    },
    "QX50": {
      "Any Trim":   [2014, 2026],
      "Pure":       [2019, 2026],
      "Luxe":       [2019, 2026],
      "Sensory":    [2019, 2026],
      "Autograph":  [2019, 2026],
    },
    "QX55": {
      "Any Trim":   [2022, 2026],
      "Pure":       [2022, 2026],
      "Luxe":       [2022, 2026],
      "Sensory":    [2022, 2026],
      "Autograph":  [2022, 2026],
    },
    "QX60": {
      "Any Trim":   [2013, 2026],
      "Base":       [2013, 2021],
      "Pure":       [2022, 2026],
      "Luxe":       [2022, 2026],
      "Sensory":    [2022, 2026],
      "Autograph":  [2022, 2026],
    },
    "QX80": {
      "Any Trim":   [2011, 2026],
      "Base":       [2011, 2025],
      "Luxe":       [2023, 2026],
      "Sensory":    [2023, 2026],
      "Theater":    [2023, 2026],
      "Autograph":  [2023, 2026],
    },
    "Q50 Red Sport": {
      "Any Trim": [2016, 2026],
      "Base":     [2016, 2026],
    },
  },
  "Volvo": {
    "S60": {
      "Any Trim":     [2001, 2026],
      "Base":         [2001, 2018],
      "Momentum":     [2019, 2026],
      "Inscription":  [2019, 2026],
      "R-Design":     [2019, 2021],
    },
    "S60 Recharge": {
      "Any Trim":   [2022, 2026],
      "T8 Core":    [2022, 2026],
      "T8 Plus":    [2022, 2026],
      "T8 Ultimate":[2022, 2026],
    },
    "S90": {
      "Any Trim":     [2017, 2023],
      "Momentum":     [2017, 2023],
      "Inscription":  [2017, 2023],
      "R-Design":     [2017, 2020],
    },
    "XC40": {
      "Any Trim":     [2018, 2026],
      "Momentum":     [2018, 2026],
      "Inscription":  [2018, 2026],
      "R-Design":     [2018, 2023],
    },
    "XC40 Recharge": {
      "Any Trim":   [2021, 2026],
      "Core":       [2021, 2026],
      "Plus":       [2021, 2026],
      "Ultimate":   [2022, 2026],
    },
    "XC60": {
      "Any Trim":     [2010, 2026],
      "Base":         [2010, 2017],
      "Momentum":     [2018, 2026],
      "Inscription":  [2018, 2026],
      "R-Design":     [2018, 2023],
    },
    "XC60 Recharge": {
      "Any Trim":    [2022, 2026],
      "T8 Core":     [2022, 2026],
      "T8 Plus":     [2022, 2026],
      "T8 Ultimate": [2022, 2026],
    },
    "XC90": {
      "Any Trim":     [2003, 2026],
      "Base":         [2003, 2014],
      "Momentum":     [2016, 2026],
      "Inscription":  [2016, 2026],
      "R-Design":     [2016, 2022],
      "Excellence":   [2016, 2022],
    },
    "XC90 Recharge": {
      "Any Trim":    [2022, 2026],
      "T8 Core":     [2022, 2026],
      "T8 Plus":     [2022, 2026],
      "T8 Ultimate": [2022, 2026],
    },
    "V60": {
      "Any Trim":     [2015, 2026],
      "Momentum":     [2015, 2026],
      "Inscription":  [2015, 2026],
      "R-Design":     [2015, 2022],
    },
    "C40 Recharge": {
      "Any Trim":   [2022, 2026],
      "Core":       [2022, 2026],
      "Plus":       [2022, 2026],
      "Ultimate":   [2022, 2026],
    },
  },
};

const categories = ["All", ...new Set(Object.values(repairData).map(r => r.category))];

// Year multipliers based on real data:
// CCC: 2021 ADAS vehicles cost 15-19% more than 2015 non-ADAS
// BLS: repair costs up 43.6% from 2019-2025 (complexity-driven)
// Parts availability: pre-2005 parts getting harder to source
// Sweet spot: 2005-2014 — plentiful parts, no ADAS complexity
const yearRanges = [
  { label: "Any Year",  min: 0,    max: 9999, multiplier: 1.00 },
  { label: "1990",      min: 1990, max: 1990, multiplier: 1.10 },
  { label: "1991",      min: 1991, max: 1991, multiplier: 1.10 },
  { label: "1992",      min: 1992, max: 1992, multiplier: 1.10 },
  { label: "1993",      min: 1993, max: 1993, multiplier: 1.09 },
  { label: "1994",      min: 1994, max: 1994, multiplier: 1.09 },
  { label: "1995",      min: 1995, max: 1995, multiplier: 1.08 },
  { label: "1996",      min: 1996, max: 1996, multiplier: 1.06 },
  { label: "1997",      min: 1997, max: 1997, multiplier: 1.06 },
  { label: "1998",      min: 1998, max: 1998, multiplier: 1.05 },
  { label: "1999",      min: 1999, max: 1999, multiplier: 1.05 },
  { label: "2000",      min: 2000, max: 2000, multiplier: 1.04 },
  { label: "2001",      min: 2001, max: 2001, multiplier: 1.04 },
  { label: "2002",      min: 2002, max: 2002, multiplier: 1.03 },
  { label: "2003",      min: 2003, max: 2003, multiplier: 1.03 },
  { label: "2004",      min: 2004, max: 2004, multiplier: 1.02 },
  { label: "2005",      min: 2005, max: 2005, multiplier: 1.00 },
  { label: "2006",      min: 2006, max: 2006, multiplier: 1.00 },
  { label: "2007",      min: 2007, max: 2007, multiplier: 1.00 },
  { label: "2008",      min: 2008, max: 2008, multiplier: 1.00 },
  { label: "2009",      min: 2009, max: 2009, multiplier: 1.00 },
  { label: "2010",      min: 2010, max: 2010, multiplier: 1.00 },
  { label: "2011",      min: 2011, max: 2011, multiplier: 1.00 },
  { label: "2012",      min: 2012, max: 2012, multiplier: 1.00 },
  { label: "2013",      min: 2013, max: 2013, multiplier: 1.00 },
  { label: "2014",      min: 2014, max: 2014, multiplier: 1.00 },
  { label: "2015",      min: 2015, max: 2015, multiplier: 1.04 },
  { label: "2016",      min: 2016, max: 2016, multiplier: 1.05 },
  { label: "2017",      min: 2017, max: 2017, multiplier: 1.06 },
  { label: "2018",      min: 2018, max: 2018, multiplier: 1.07 },
  { label: "2019",      min: 2019, max: 2019, multiplier: 1.10 },
  { label: "2020",      min: 2020, max: 2020, multiplier: 1.11 },
  { label: "2021",      min: 2021, max: 2021, multiplier: 1.12 },
  { label: "2022",      min: 2022, max: 2022, multiplier: 1.13 },
  { label: "2023",      min: 2023, max: 2023, multiplier: 1.15 },
  { label: "2024",      min: 2024, max: 2024, multiplier: 1.15 },
  { label: "2025",      min: 2025, max: 2025, multiplier: 1.15 },
  { label: "2026",      min: 2026, max: 2026, multiplier: 1.15 },
];

const getYearMult = (year) => {
  if (!year || year === "Any Year") return 1.00;
  const entry = yearRanges.find(r => r.label === year);
  return entry ? entry.multiplier : 1.00;
};

// Repairs where model year affects cost (ADAS recalibration, electrical complexity)
// Based on CCC/AAA data — NOT applied to commodity services
const yearSensitiveRepairs = new Set([
  "Wheel Alignment",
  "Shock Absorbers (pair)",
  "Strut Assembly (pair)",
  "Ball Joint",
  "Tie Rod End",
  "Alternator",
  "Starter Motor",
  "Battery Replacement",
  "Oxygen Sensor",
  "Mass Air Flow Sensor",
  "Ignition Coil",
  "AC Compressor",
  "Spark Plugs",
  "Timing Belt",
  "Timing Chain",
  "Head Gasket",
  "Valve Cover Gasket",
  "CV Axle/Halfshaft",
  "Windshield Replacement",
  "Radiator Replacement",
]);

// Trim multipliers per model — stacks on top of make × model multiplier
// Format: { "Make": { "Model": [["Trim", multiplier], ...] } }
const trimData = {
  "Acura": {
    "ILX":      [["Any Trim",1.00],["Base",0.97],["Premium",1.00],["Technology",1.03],["A-Spec",1.05]],
    "Integra":  [["Any Trim",1.00],["Base",0.97],["Standard",1.00],["Technology",1.03],["A-Spec",1.05],["Type S",1.15]],
    "TL":       [["Any Trim",1.00],["Base",0.97],["Technology",1.00],["SH-AWD",1.05],["SH-AWD Tech",1.08]],
    "TLX":      [["Any Trim",1.00],["Base",0.97],["Standard",1.00],["Technology",1.03],["A-Spec",1.05],["SH-AWD",1.07],["Type S",1.15]],
    "RL":       [["Any Trim",1.00],["Base",0.97],["Technology",1.02]],
    "RLX":      [["Any Trim",1.00],["Base",0.97],["Technology",1.00],["Sport Hybrid",1.10],["Sport Hybrid Advance",1.12]],
    "RDX":      [["Any Trim",1.00],["Base",0.97],["Technology",1.00],["A-Spec",1.05],["Advance",1.07],["PMC Edition",1.10]],
    "MDX":      [["Any Trim",1.00],["Base",0.97],["Technology",1.00],["SH-AWD",1.05],["Advance",1.08],["Type S",1.15],["Type S Advance",1.18]],
    "ZDX":      [["Any Trim",1.00],["A-Spec",1.00],["Type S",1.12]],
    "NSX":      [["Any Trim",1.00],["Base",1.00],["Type S",1.15]],
  },
  "Audi": {
    "A3":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "A4":  [["Any Trim",1.00],["1.8T",0.97],["2.8",1.00],["3.0",1.00],["3.2",1.05],["2.0T",0.97],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["allroad Premium",1.03],["allroad Prestige",1.08]],
    "A5":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["Sportback Premium",1.00],["Cabriolet Premium",1.05]],
    "A6":  [["Any Trim",1.00],["Base",0.97],["2.7T",1.00],["4.2",1.08],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["3.0T Prestige",1.08],["4.2 Prestige",1.12],["allroad Premium",1.03]],
    "A7":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.08]],
    "A8":  [["Any Trim",1.00],["Base",0.97],["A8",1.00],["A8 L",1.05],["A8 L 60 TFSI e",1.10]],
    "Q3":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "Q5":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["PHEV Premium",1.08],["Sportback Premium",1.03]],
    "Q7":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["3.0T Premium",0.97],["4.2 Premium",1.08]],
    "Q8":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.10]],
    "TT":  [["Any Trim",1.00],["2.0T",0.97],["Coupe",1.00],["Roadster",1.05],["3.2",1.08],["TTS",1.10],["TTRS",1.20]],
    "R8":  [["Any Trim",1.00],["V8",1.00],["V10",1.05],["V10 RWD",1.00],["V10 Performance",1.10],["V10 Plus",1.12],["V10 GT RWD",1.20]],
    "S3":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "S4":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "S5":  [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["Sportback Premium",1.03]],
    "S6":  [["Any Trim",1.00],["Premium Plus",1.00],["Prestige",1.08]],
    "S7":  [["Any Trim",1.00],["Premium Plus",1.00],["Prestige",1.10]],
    "S8":  [["Any Trim",1.00],["S8",1.00]],
    "SQ5": [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "RS3": [["Any Trim",1.00],["Premium",1.00],["Prestige",1.08]],
    "RS4": [["Any Trim",1.00],["Base",1.00]],
    "RS5": [["Any Trim",1.00],["Coupe",1.00],["Sportback",1.03]],
    "RS6": [["Any Trim",1.00],["Avant",1.00]],
    "RS7": [["Any Trim",1.00],["Base",1.00]],
    "e-tron":    [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05],["S",1.12]],
    "e-tron GT": [["Any Trim",1.00],["e-tron GT",1.00],["RS e-tron GT",1.12]],
    "Q4 e-tron": [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
    "Q8 e-tron": [["Any Trim",1.00],["Premium",0.97],["Premium Plus",1.00],["Prestige",1.05]],
  },
  "BMW": {
    "1 Series":  [["Any Trim",1.00],["128i",0.97],["135i",1.08],["M",1.20]],
    "2 Series":  [["Any Trim",1.00],["228i",0.97],["228i xDrive",1.00],["230i",0.97],["230i xDrive",1.00],["M235i",1.10],["M240i",1.10],["M240i xDrive",1.12]],
    "3 Series":  [["Any Trim",1.00],["318i",0.95],["323i",0.97],["325i",0.97],["325xi",0.97],["325Ci",0.97],["328i",1.00],["328i xDrive",1.02],["328d",1.00],["330i",1.00],["330xi",1.00],["330Ci",1.00],["330e",1.05],["330e xDrive",1.05],["330i xDrive",1.00],["335i",1.08],["335i xDrive",1.10],["335d",1.05],["320i",0.95],["340i",1.08],["340i xDrive",1.10],["M340i",1.12],["M340i xDrive",1.12],["M3",1.25]],
    "4 Series":  [["Any Trim",1.00],["428i",0.97],["428i xDrive",1.00],["435i",1.05],["435i xDrive",1.08],["430i",0.97],["430i xDrive",1.00],["440i",1.05],["440i xDrive",1.08],["M440i xDrive",1.12]],
    "5 Series":  [["Any Trim",1.00],["525i",0.95],["528i",0.97],["528i xDrive",1.00],["530i",1.00],["530i xDrive",1.00],["530e",1.05],["530e xDrive",1.05],["535i",1.05],["535i xDrive",1.05],["535d",1.05],["540i",1.05],["540i xDrive",1.08],["545i",1.08],["550i",1.10],["550i xDrive",1.12],["M550i xDrive",1.15],["M5",1.25]],
    "6 Series":  [["Any Trim",1.00],["640i",0.97],["640i xDrive",1.00],["650i",1.05],["650i xDrive",1.08],["M6",1.20]],
    "7 Series":  [["Any Trim",1.00],["740i",0.97],["740Li",0.97],["740e",1.05],["750i",1.08],["750Li",1.08],["750Li xDrive",1.10],["760Li",1.15],["760i",1.15],["M760i xDrive",1.20],["M760Li xDrive",1.22]],
    "8 Series":  [["Any Trim",1.00],["840i",0.97],["840i Gran Coupe",1.00],["840i xDrive",1.00],["850i",1.10],["M850i",1.15],["M850i xDrive",1.15]],
    "X1":        [["Any Trim",1.00],["sDrive28i",0.97],["xDrive28i",1.00],["xDrive28d",1.00],["sDrive18i",0.97],["xDrive23i",1.00],["M35i",1.10]],
    "X2":        [["Any Trim",1.00],["sDrive28i",0.97],["xDrive28i",1.00],["M35i",1.10]],
    "X3":        [["Any Trim",1.00],["2.5i",0.95],["3.0i",1.00],["3.0si",1.05],["xDrive28i",0.97],["xDrive35i",1.08],["sDrive30i",0.97],["xDrive30i",1.00],["xDrive30e",1.05],["M40i",1.10]],
    "X4":        [["Any Trim",1.00],["xDrive28i",0.97],["xDrive35i",1.08],["xDrive30i",0.97],["M40i",1.10]],
    "X5":        [["Any Trim",1.00],["4.4i",1.05],["3.0i",0.95],["4.6is",1.10],["4.8is",1.12],["3.0si",0.95],["4.8i",1.08],["xDrive30i",0.95],["xDrive48i",1.08],["xDrive35i",1.00],["xDrive35d",1.00],["xDrive50i",1.12],["sDrive35i",0.95],["xDrive40e",1.05],["sDrive40i",0.97],["xDrive40i",1.00],["xDrive45e",1.08],["xDrive50e",1.08],["M50i",1.15],["M60i",1.15]],
    "X6":        [["Any Trim",1.00],["xDrive35i",1.00],["xDrive50i",1.12],["sDrive35i",0.97],["sDrive40i",0.97],["xDrive40i",1.00],["M50i",1.15],["M60i",1.15]],
    "X7":        [["Any Trim",1.00],["xDrive40i",0.97],["xDrive50i",1.08],["M50i",1.15],["M60i",1.15]],
    "Z4":        [["Any Trim",1.00],["2.5i",0.95],["3.0i",1.00],["3.0si",1.05],["M Roadster",1.20],["sDrive30i",0.97],["sDrive28i",0.97],["sDrive35i",1.05],["sDrive35is",1.10],["M40i",1.12]],
    "M2":        [["Any Trim",1.00],["Base",1.00],["Competition",1.08],["CS",1.15]],
    "M3":        [["Any Trim",1.00],["Base",1.00],["Competition",1.08],["CS",1.18],["CSL",1.25]],
    "M4":        [["Any Trim",1.00],["Base",1.00],["Competition",1.08],["CS",1.18],["CSL",1.25]],
    "M5":        [["Any Trim",1.00],["Base",1.00],["Competition",1.08],["CS",1.18]],
    "M6":        [["Any Trim",1.00],["Base",1.00],["Gran Coupe",1.05],["Competition",1.10]],
    "M8":        [["Any Trim",1.00],["Base",1.00],["Gran Coupe",1.05],["Competition",1.10]],
    "X3 M":      [["Any Trim",1.00],["Base",1.00],["Competition",1.10]],
    "X4 M":      [["Any Trim",1.00],["Base",1.00],["Competition",1.10]],
    "X5 M":      [["Any Trim",1.00],["Base",1.00],["Competition",1.10]],
    "X6 M":      [["Any Trim",1.00],["Base",1.00],["Competition",1.10]],
    "i3":        [["Any Trim",1.00],["Base",1.00],["s",1.05]],
    "i4":        [["Any Trim",1.00],["eDrive35",0.97],["eDrive40",1.00],["M50",1.10]],
    "i5":        [["Any Trim",1.00],["eDrive40",0.97],["xDrive40",1.00],["M60",1.12]],
    "i7":        [["Any Trim",1.00],["eDrive50",0.97],["xDrive60",1.05],["M70",1.15]],
    "iX":        [["Any Trim",1.00],["xDrive50",1.00],["M60",1.12]],
  },
  "Buick": {
    "Encore":     [["Any Trim",1.00],["Base",0.95],["Preferred",1.00],["Essence",1.05],["Sport Touring",1.05]],
    "Encore GX":  [["Any Trim",1.00],["Select",0.95],["Preferred",1.00],["Essence",1.05],["Sport Touring",1.05],["Avenir",1.12]],
    "Envision":   [["Any Trim",1.00],["Preferred",0.95],["Essence",1.00],["Avenir",1.10]],
    "Envista":    [["Any Trim",1.00],["Base",0.95],["Preferred",1.00],["Essence",1.05]],
    "Enclave":    [["Any Trim",1.00],["Preferred",0.95],["Essence",1.00],["Avenir",1.12]],
    "LaCrosse":   [["Any Trim",1.00],["Base",0.95],["Preferred",1.00],["Essence",1.05],["Premium",1.08]],
    "Regal":      [["Any Trim",1.00],["Preferred",0.97],["Essence",1.00],["GS",1.08]],
    "Verano":     [["Any Trim",1.00],["Base",0.97],["Convenience",1.00],["Leather",1.03],["Premium",1.08]],
  },
  "Cadillac": {
    "ATS":               [["Any Trim",1.00],["Base",0.95],["Luxury",1.00],["Performance",1.05],["Premium",1.08],["V",1.18]],
    "CT4":               [["Any Trim",1.00],["Luxury",0.95],["Premium Luxury",1.00],["Sport",1.05],["V-Series",1.12],["V-Series Blackwing",1.22]],
    "CT5":               [["Any Trim",1.00],["Luxury",0.95],["Premium Luxury",1.00],["Sport",1.05],["V-Series",1.12],["V-Series Blackwing",1.25]],
    "CTS":               [["Any Trim",1.00],["Base",0.95],["Luxury",1.00],["Performance",1.05],["Vsport",1.12],["V",1.22]],
    "XTS":               [["Any Trim",1.00],["Luxury",0.95],["Platinum",1.08],["Vsport",1.15]],
    "XT4":               [["Any Trim",1.00],["Luxury",0.95],["Premium Luxury",1.00],["Sport",1.05]],
    "XT5":               [["Any Trim",1.00],["Luxury",0.95],["Premium Luxury",1.00],["Sport",1.05],["Platinum",1.10]],
    "XT6":               [["Any Trim",1.00],["Luxury",0.95],["Premium Luxury",1.00],["Sport",1.05],["Platinum",1.12]],
    "Escalade":          [["Any Trim",1.00],["Base",0.95],["Luxury",1.00],["Premium Luxury",1.08],["Sport Platinum",1.12],["Platinum",1.15]],
    "Escalade ESV":      [["Any Trim",1.00],["Base",0.95],["Luxury",1.00],["Premium Luxury",1.08],["Platinum",1.15]],
    "CT4-V Blackwing":   [["Any Trim",1.00],["Base",1.00]],
    "CT5-V Blackwing":   [["Any Trim",1.00],["Base",1.00]],
    "Lyriq":             [["Any Trim",1.00],["Luxury",0.97],["Sport",1.00],["Luxury AWD",1.05]],
  },
  "Chevrolet": {
    "Spark":          [["Any Trim",1.00],["LS",0.93],["1LT",0.97],["2LT",1.00],["ACTIV",1.03]],
    "Sonic":          [["Any Trim",1.00],["LS",0.93],["LT",1.00],["Premier",1.05]],
    "Trax":           [["Any Trim",1.00],["LS",0.93],["LT",1.00],["ACTIV",1.05],["RS",1.05],["Premier",1.08]],
    "Trailblazer":    [["Any Trim",1.00],["LS",0.93],["LT",1.00],["ACTIV",1.05],["RS",1.05],["Premier",1.08]],
    "Equinox":        [["Any Trim",1.00],["LS",0.93],["LT",1.00],["RS",1.05],["Premier",1.08]],
    "Malibu":         [["Any Trim",1.00],["LS",0.93],["RS",1.00],["LT",1.00],["Premier",1.08]],
    "Blazer":         [["Any Trim",1.00],["LT",0.95],["RS",1.00],["Premier",1.05]],
    "Traverse":       [["Any Trim",1.00],["LS",0.93],["LT",1.00],["RS",1.05],["Premier",1.08],["High Country",1.12]],
    "Tahoe":          [["Any Trim",1.00],["LS",0.93],["LT",1.00],["Z71",1.03],["RST",1.05],["Premier",1.08],["High Country",1.15]],
    "Suburban":       [["Any Trim",1.00],["LS",0.93],["LT",1.00],["Z71",1.03],["RST",1.05],["Premier",1.08],["High Country",1.15]],
    "Colorado":       [["Any Trim",1.00],["WT",0.93],["LT",1.00],["Z71",1.05],["ZR2",1.15],["Trail Boss",1.10]],
    "Silverado 1500": [["Any Trim",1.00],["WT",0.93],["Custom",0.97],["LT",1.00],["RST",1.03],["LTZ",1.07],["Trail Boss",1.10],["High Country",1.15],["ZR2",1.20]],
    "Silverado 2500HD":[["Any Trim",1.00],["WT",0.93],["Custom",0.97],["LT",1.00],["LTZ",1.07],["High Country",1.15]],
    "Silverado 3500HD":[["Any Trim",1.00],["WT",0.93],["LT",1.00],["LTZ",1.07],["High Country",1.15]],
    "Express":        [["Any Trim",1.00],["Cargo",0.97],["1500",1.00],["2500",1.05],["3500",1.10]],
    "Camaro":         [["Any Trim",1.00],["LS",0.93],["LT",1.00],["LT1",1.05],["SS",1.12],["ZL1",1.25],["ZL1 1LE",1.30]],
    "Camaro SS":      [["Any Trim",1.00],["Base",1.00],["1LE",1.10]],
    "Camaro ZL1":     [["Any Trim",1.00],["Base",1.00],["1LE",1.10]],
    "Corvette Stingray": [["Any Trim",1.00],["1LT",0.97],["2LT",1.00],["3LT",1.05]],
    "Corvette Z06":   [["Any Trim",1.00],["1LZ",0.97],["2LZ",1.00],["3LZ",1.05],["70th Anniversary",1.08]],
    "Corvette ZR1":   [["Any Trim",1.00],["Base",1.00],["ZTK",1.08]],
    "Bolt EV":        [["Any Trim",1.00],["LT",0.97],["Premier",1.05]],
    "Bolt EUV":       [["Any Trim",1.00],["LT",0.97],["Premier",1.05]],
    "Blazer EV":      [["Any Trim",1.00],["LT",0.95],["2LT",1.00],["RS",1.05],["SS",1.12]],
    "Silverado EV":   [["Any Trim",1.00],["WT",0.95],["LT",1.00],["RST",1.05],["4ST",1.10]],
  },
  "Chrysler": {
    "200":             [["Any Trim",1.00],["LX",0.93],["Touring",0.97],["Limited",1.00],["S",1.05],["C",1.08]],
    "300":             [["Any Trim",1.00],["Touring",0.93],["Touring L",0.97],["Limited",1.00],["S",1.05],["C",1.08],["SRT8",1.20]],
    "300 SRT":         [["Any Trim",1.00],["SRT8",1.00]],
    "Pacifica":        [["Any Trim",1.00],["Touring",0.93],["Touring L",0.97],["Limited",1.00],["Pinnacle",1.08]],
    "Pacifica Hybrid": [["Any Trim",1.00],["Touring",0.97],["Touring L",1.00],["Limited",1.05],["Pinnacle",1.12]],
    "Voyager":         [["Any Trim",1.00],["Base",0.97],["LX",1.00]],
    "Aspen":           [["Any Trim",1.00],["Base",0.95],["Limited",1.05]],
  },
  "Dodge": {
    "Dart":              [["Any Trim",1.00],["SE",0.92],["SXT",0.97],["Aero",1.00],["GT",1.05],["R/T",1.08]],
    "Neon":              [["Any Trim",1.00],["Base",0.93],["SXT",1.00],["SRT-4",1.15]],
    "Avenger":           [["Any Trim",1.00],["SE",0.93],["SXT",0.97],["R/T",1.05]],
    "Charger":           [["Any Trim",1.00],["SE",0.92],["SXT",0.95],["SXT AWD",0.97],["GT",1.00],["R/T",1.05],["R/T Scat Pack",1.12],["SRT8",1.18],["SRT 392",1.18],["SRT Hellcat",1.25],["SRT Hellcat Redeye",1.28],["Daytona",1.08]],
    "Charger R/T":       [["Any Trim",1.00],["Base",1.00],["Road & Track",1.05]],
    "Charger Scat Pack": [["Any Trim",1.00],["Base",1.00],["Widebody",1.08]],
    "Charger Hellcat":   [["Any Trim",1.00],["Base",1.00],["Widebody",1.08],["Redeye",1.12],["Jailbreak",1.15]],
    "Charger SRT 392":   [["Any Trim",1.00],["Base",1.00]],
    "Challenger":        [["Any Trim",1.00],["SE",0.92],["SXT",0.95],["GT",1.00],["R/T",1.05],["R/T Scat Pack",1.12],["T/A",1.08],["T/A 392",1.15],["SRT8",1.18],["SRT 392",1.18],["SRT Hellcat",1.25],["SRT Hellcat Redeye",1.28],["SRT Demon",1.35],["SRT Demon 170",1.38]],
    "Challenger R/T":    [["Any Trim",1.00],["Base",1.00],["Classic",1.03],["T/A",1.05],["T/A 392",1.10]],
    "Challenger Scat Pack":[["Any Trim",1.00],["Base",1.00],["Widebody",1.08],["1320",1.10]],
    "Challenger Hellcat":[["Any Trim",1.00],["Base",1.00],["Widebody",1.08],["Redeye",1.12],["Redeye Widebody",1.15],["Jailbreak",1.18],["Super Stock",1.20]],
    "Challenger Demon":  [["Any Trim",1.00],["170",1.00]],
    "Durango":           [["Any Trim",1.00],["Base",0.92],["Sport",0.93],["SXT",0.93],["SLT",0.97],["GT",0.97],["R/T",1.05],["Citadel",1.08],["Limited",1.05],["SRT8",1.18],["SRT 392",1.18],["SRT Hellcat",1.25]],
    "Durango SRT":       [["Any Trim",1.00],["392",1.00]],
    "Durango Hellcat":   [["Any Trim",1.00],["Base",1.00]],
    "Journey":           [["Any Trim",1.00],["SE",0.92],["SXT",0.97],["Crossroad",1.00],["GT",1.05]],
    "Grand Caravan":     [["Any Trim",1.00],["SE",0.92],["C/V",0.92],["SE Plus",0.97],["SXT",1.00],["GT",1.05],["R/T",1.08]],
    "Viper":             [["Any Trim",1.00],["Base",1.00],["GTS",1.08],["ACR",1.20],["TA 2.0",1.15]],
  },
  "Ford": {
    "Fiesta":       [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00],["Titanium",1.05],["ST",1.10]],
    "Focus":        [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00],["Titanium",1.05],["ST",1.12],["RS",1.20]],
    "Fusion":       [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00],["Titanium",1.05],["Platinum",1.10],["Sport",1.08],["V6 Sport",1.10]],
    "Taurus":       [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["Limited",1.00],["SHO",1.12]],
    "Escape":       [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00],["Titanium",1.05],["ST-Line",1.05],["PHEV SE",1.08],["PHEV Titanium",1.12]],
    "Edge":         [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["Titanium",1.00],["ST",1.10],["ST-Line",1.05]],
    "Explorer":     [["Any Trim",1.00],["Base",0.92],["XLT",0.97],["Limited",1.00],["ST",1.10],["Platinum",1.12],["King Ranch",1.12],["Timberline",1.08]],
    "Expedition":   [["Any Trim",1.00],["XLT",0.95],["Limited",1.00],["Timberline",1.05],["King Ranch",1.10],["Platinum",1.15],["Max XLT",1.00],["Max Platinum",1.18]],
    "Maverick":     [["Any Trim",1.00],["XL",0.92],["XLT",0.97],["Lariat",1.00],["Tremor",1.08]],
    "Ranger":       [["Any Trim",1.00],["XL",0.92],["XLT",0.97],["Lariat",1.00],["Tremor",1.08],["Raptor",1.18]],
    "F-150":        [["Any Trim",1.00],["XL",0.93],["XLT",0.97],["Lariat",1.00],["King Ranch",1.07],["Platinum",1.10],["Limited",1.12],["Tremor",1.08]],
    "F-150 Raptor": [["Any Trim",1.00],["Base",1.00],["Raptor R",1.15]],
    "F-250 Super Duty":[["Any Trim",1.00],["XL",0.93],["XLT",0.97],["Lariat",1.00],["King Ranch",1.07],["Platinum",1.10],["Limited",1.15],["Tremor",1.10]],
    "F-350 Super Duty":[["Any Trim",1.00],["XL",0.93],["XLT",0.97],["Lariat",1.00],["King Ranch",1.07],["Platinum",1.10],["Limited",1.15]],
    "Bronco Sport": [["Any Trim",1.00],["Base",0.93],["Big Bend",0.97],["Outer Banks",1.00],["Badlands",1.05],["Wildtrak",1.08],["Heritage",1.08]],
    "Bronco":       [["Any Trim",1.00],["Base",0.93],["Big Bend",0.97],["Black Diamond",1.00],["Outer Banks",1.03],["Badlands",1.08],["Wildtrak",1.10],["Everglades",1.12],["Raptor",1.20],["Heritage",1.08]],
    "EcoSport":     [["Any Trim",1.00],["S",0.92],["SE",0.97],["SES",1.00],["Titanium",1.05]],
    "Mustang EcoBoost":[["Any Trim",1.00],["Base",0.95],["Premium",1.00],["High Performance",1.05]],
    "Mustang GT":   [["Any Trim",1.00],["Base",0.97],["Premium",1.00],["California Special",1.05]],
    "Mustang GT500":[["Any Trim",1.00],["Base",1.00],["Carbon Fiber Track Pack",1.08]],
    "Mustang Mach 1":[["Any Trim",1.00],["Base",1.00],["Handling Package",1.05]],
    "Mustang Dark Horse":[["Any Trim",1.00],["Base",1.00],["Performance Package",1.05]],
    "Mustang Mach-E":[["Any Trim",1.00],["Select",0.95],["California Route 1",1.00],["Premium",1.05],["GT",1.12],["GT Performance",1.18]],
    "F-150 Lightning":[["Any Trim",1.00],["Pro",0.95],["XLT",1.00],["Lariat",1.05],["Platinum",1.10],["Black Ops",1.15]],
    "Transit":      [["Any Trim",1.00],["Base",0.95],["XL",1.00],["XLT",1.05]],
  },
  "GMC": {
    "Terrain":    [["Any Trim",1.00],["SL",0.92],["SLE",0.97],["SLT",1.00],["AT4",1.05],["Denali",1.12]],
    "Envoy":      [["Any Trim",1.00],["SL",0.92],["SLE",0.97],["SLT",1.00],["Denali",1.10]],
    "Acadia":     [["Any Trim",1.00],["SLE",0.93],["SLT",0.97],["AT4",1.05],["Denali",1.12]],
    "Envista":    [["Any Trim",1.00],["ST",0.93],["SLE",0.97],["SLT",1.00],["Denali",1.08]],
    "Canyon":     [["Any Trim",1.00],["Base",0.92],["Elevation",0.97],["AT4",1.05],["Denali",1.12],["AT4X",1.18]],
    "Sierra 1500":[["Any Trim",1.00],["Base",0.92],["SLE",0.97],["SLT",1.00],["AT4",1.05],["Denali",1.12],["AT4X",1.15],["Denali Ultimate",1.18]],
    "Sierra 2500HD":[["Any Trim",1.00],["Base",0.92],["SLE",0.97],["SLT",1.00],["AT4",1.05],["Denali",1.12]],
    "Sierra 3500HD":[["Any Trim",1.00],["Base",0.92],["SLE",0.97],["SLT",1.00],["AT4",1.05],["Denali",1.12]],
    "Yukon":      [["Any Trim",1.00],["SLE",0.92],["SLT",0.97],["AT4",1.05],["Denali",1.12]],
    "Yukon XL":   [["Any Trim",1.00],["SLE",0.92],["SLT",0.97],["AT4",1.05],["Denali",1.12]],
    "Sierra Denali":[["Any Trim",1.00],["Base",1.00]],
    "Yukon Denali":[["Any Trim",1.00],["Base",1.00]],
    "Hummer EV":  [["Any Trim",1.00],["Edition 1",1.05],["EV3X",1.00],["EV2X",0.97],["EV2",0.93]],
  },
  "Honda": {
    "Fit":        [["Any Trim",1.00],["Base",0.93],["LX",0.93],["Sport",0.97],["EX",1.00],["EX-L",1.05]],
    "HR-V":       [["Any Trim",1.00],["LX",0.93],["Sport",0.97],["EX",1.00],["EX-L",1.05]],
    "Civic":      [["Any Trim",1.00],["Base",0.92],["DX",0.92],["LX",0.93],["EX",1.00],["EX-L",1.03],["Sport",0.97],["Touring",1.05],["Si",1.08]],
    "Accord":     [["Any Trim",1.00],["Base",0.92],["DX",0.92],["LX",0.93],["SE",0.97],["EX",0.97],["Sport",0.97],["EX-L",1.00],["V6 Sport",1.03],["Touring",1.05],["Hybrid Sport",1.05],["Hybrid Touring",1.10]],
    "Insight":    [["Any Trim",1.00],["Base",0.93],["LX",0.93],["EX",0.97],["Touring",1.05]],
    "CR-V":       [["Any Trim",1.00],["Base",0.92],["LX",0.93],["SE",0.97],["EX",0.97],["EX-L",1.00],["Touring",1.05],["Sport",1.03]],
    "CR-V Hybrid":[["Any Trim",1.00],["Sport",0.97],["EX-L",1.00],["Touring",1.08]],
    "Passport":   [["Any Trim",1.00],["Sport",0.95],["EX-L",1.00],["TrailSport",1.05],["Elite",1.08]],
    "Pilot":      [["Any Trim",1.00],["LX",0.93],["EX",0.97],["EX-L",1.00],["Sport",0.97],["TrailSport",1.05],["Touring",1.07],["Elite",1.10],["Black Edition",1.12]],
    "Ridgeline":  [["Any Trim",1.00],["RT",0.93],["Sport",0.95],["RTL",1.00],["RTL-E",1.05],["Black Edition",1.10]],
    "Odyssey":    [["Any Trim",1.00],["Base",0.92],["LX",0.93],["EX",0.97],["EX-L",1.00],["Touring",1.05],["Elite",1.10]],
    "Civic Type R":[["Any Trim",1.00],["Base",1.00],["Limited Edition",1.08]],
    "Accord Hybrid":[["Any Trim",1.00],["Base",0.95],["Sport",0.97],["EX-L",1.00],["Sport-L Hybrid",1.05],["Touring",1.08]],
    "Prologue EV":[["Any Trim",1.00],["EX-L",0.97],["Touring",1.00]],
  },
  "Hyundai": {
    "Accent":      [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["Limited",1.05]],
    "Venue":       [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["Denim",1.00],["Limited",1.05]],
    "Elantra":     [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["Limited",1.00],["Sport",1.05],["N Line",1.08]],
    "Elantra N":   [["Any Trim",1.00],["Base",1.00]],
    "Sonata":      [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["SEL Plus",1.00],["Limited",1.05],["N Line",1.08]],
    "Sonata Hybrid":[["Any Trim",1.00],["Blue",0.93],["SE",0.97],["SEL",1.00],["Limited",1.08]],
    "Tucson":      [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["N Line",1.00],["Limited",1.05],["XRT",1.03]],
    "Tucson Hybrid":[["Any Trim",1.00],["Blue",0.93],["SEL",0.97],["N Line",1.00],["Limited",1.08]],
    "Santa Fe":    [["Any Trim",1.00],["SE",0.92],["SEL",0.97],["XRT",1.00],["Limited",1.05],["Calligraphy",1.10]],
    "Santa Fe Hybrid":[["Any Trim",1.00],["Blue",0.93],["SEL Premium",1.00],["Limited",1.08],["Calligraphy",1.12]],
    "Palisade":    [["Any Trim",1.00],["SE",0.93],["SEL",0.97],["XRT",1.00],["Limited",1.05],["Calligraphy",1.10]],
    "Kona":        [["Any Trim",1.00],["SE",0.93],["SEL",0.97],["N Line",1.00],["Limited",1.05]],
    "Kona Electric":[["Any Trim",1.00],["SE",0.95],["SEL",1.00],["Limited",1.08]],
    "Ioniq 5":     [["Any Trim",1.00],["SE Standard Range",0.93],["SE",0.97],["SEL",1.00],["Limited",1.08],["N Line",1.05],["N",1.15]],
    "Ioniq 6":     [["Any Trim",1.00],["SE Standard Range",0.93],["SE",0.97],["SEL",1.00],["Limited",1.08]],
    "Ioniq 9":     [["Any Trim",1.00],["SE",0.95],["SEL",1.00],["Limited",1.08]],
    "Veloster N":  [["Any Trim",1.00],["Base",1.00],["Performance Package",1.08]],
    "Santa Cruz":  [["Any Trim",1.00],["SE",0.93],["SEL",0.97],["SEL Premium",1.00],["Limited",1.05]],
  },
  "Infiniti": {
    "G35 / G37":  [["Any Trim",1.00],["Base",0.95],["Journey",0.97],["Sport",1.00],["IPL",1.10]],
    "Q50":        [["Any Trim",1.00],["Pure",0.93],["Luxe",0.97],["Sensory",1.00],["Sport",1.05],["Red Sport 400",1.12]],
    "Q60":        [["Any Trim",1.00],["Pure",0.93],["Luxe",0.97],["Sensory",1.00],["Sport",1.05],["Red Sport 400",1.12]],
    "Q70":        [["Any Trim",1.00],["Base",0.95],["Hybrid",1.08]],
    "QX30":       [["Any Trim",1.00],["Base",0.95],["Premium",1.00],["Sport",1.05],["Luxe",1.08]],
    "QX50":       [["Any Trim",1.00],["Pure",0.93],["Luxe",0.97],["Sensory",1.00],["Autograph",1.08]],
    "QX55":       [["Any Trim",1.00],["Pure",0.95],["Luxe",1.00],["Sensory",1.05],["Autograph",1.10]],
    "QX60":       [["Any Trim",1.00],["Pure",0.93],["Luxe",0.97],["Sensory",1.00],["Autograph",1.08]],
    "QX80":       [["Any Trim",1.00],["Base",0.93],["Luxe",0.97],["Sensory",1.00],["Theater",1.05],["Autograph",1.10]],
    "Q50 Red Sport":[["Any Trim",1.00],["Base",1.00]],
  },
  "Jeep": {
    "Renegade":          [["Any Trim",1.00],["Sport",0.92],["Latitude",0.97],["Altitude",1.00],["Limited",1.05],["Trailhawk",1.08]],
    "Compass":           [["Any Trim",1.00],["Sport",0.92],["Latitude",0.97],["Latitude Lux",1.00],["Limited",1.05],["Trailhawk",1.08],["High Altitude",1.08]],
    "Cherokee":          [["Any Trim",1.00],["Base",0.92],["Sport",0.92],["Country",0.97],["Classic",0.97],["Latitude",0.97],["Limited",1.05],["Trailhawk",1.08],["Overland",1.10],["High Altitude",1.08]],
    "Grand Cherokee":    [["Any Trim",1.00],["SE",0.92],["Laredo",0.92],["Laredo X",0.95],["Altitude",0.97],["Limited",1.00],["High Altitude",1.08],["Overland",1.05],["Trailhawk",1.05],["Summit",1.10],["Summit Reserve",1.15],["Orvis",1.08],["SRT8",1.20],["SRT",1.20],["Trackhawk",1.25],["Sterling Edition",1.10]],
    "Grand Cherokee L":  [["Any Trim",1.00],["Laredo",0.92],["Altitude",0.97],["Limited",1.00],["Overland",1.05],["Summit",1.10],["Summit Reserve",1.15]],
    "Grand Cherokee 4xe":[["Any Trim",1.00],["Base",1.00],["Limited",1.05],["Trailhawk",1.08],["Overland",1.10],["Summit",1.15]],
    "Wrangler":          [["Any Trim",1.00],["S",0.92],["Base",0.92],["X",0.95],["Sport",0.92],["Sport S",0.95],["Unlimited Sport",0.95],["Renegade",0.97],["Sahara",1.00],["Freedom",1.00],["Altitude",1.00],["Islander",1.00],["Willys",1.03],["Willys Wheeler",1.03],["Xtreme Recon",1.05],["Rubicon",1.10],["4xe",1.08],["392",1.20]],
    "Wrangler 4xe":      [["Any Trim",1.00],["Sahara",1.00],["Willys",1.03],["Rubicon",1.10]],
    "Wrangler Rubicon":  [["Any Trim",1.00],["Base",1.00],["392",1.15]],
    "Gladiator":         [["Any Trim",1.00],["Sport",0.92],["Sport S",0.95],["Willys",1.00],["Overland",1.05],["Mojave",1.08],["Rubicon",1.10],["High Altitude",1.08]],
    "Grand Wagoneer":    [["Any Trim",1.00],["Series I",0.95],["Series II",1.00],["Series III",1.08]],
    "Trackhawk":         [["Any Trim",1.00],["Base",1.00]],
    "Commander":         [["Any Trim",1.00],["Sport",0.93],["Limited",1.00],["Overland",1.07]],
  },
  "Kia": {
    "Rio":       [["Any Trim",1.00],["LX",0.92],["S",0.97],["EX",1.00]],
    "Soul":      [["Any Trim",1.00],["LX",0.92],["S",0.97],["EX",1.00],["GT-Line",1.05],["Turbo",1.08]],
    "Forte":     [["Any Trim",1.00],["FE",0.92],["LXS",0.97],["GT-Line",1.00],["GT",1.08],["GT2",1.10]],
    "K5":        [["Any Trim",1.00],["LXS",0.92],["EX",0.97],["GT-Line",1.00],["GT",1.10],["GT1",1.08],["GT2",1.12]],
    "Stinger":   [["Any Trim",1.00],["Base",0.95],["GT-Line",1.00],["GT1",1.05],["GT2",1.10]],
    "Stinger GT":[["Any Trim",1.00],["Base",1.00],["GT2",1.08]],
    "Seltos":    [["Any Trim",1.00],["LX",0.93],["S",0.97],["EX",1.00],["SX",1.05],["X-Pro",1.08]],
    "Sportage":  [["Any Trim",1.00],["LX",0.93],["EX",0.97],["X-Pro",1.00],["SX Turbo",1.05],["SX Prestige",1.08]],
    "Sorento":   [["Any Trim",1.00],["LX",0.93],["S",0.97],["EX",1.00],["SX",1.05],["SX Prestige",1.08]],
    "Sorento Hybrid":[["Any Trim",1.00],["S",0.97],["EX",1.00],["SX Prestige",1.10]],
    "Telluride": [["Any Trim",1.00],["LX",0.93],["S",0.97],["EX",1.00],["SX",1.05],["X-Pro",1.08],["X-Line",1.05],["SX Prestige",1.10]],
    "Carnival":  [["Any Trim",1.00],["LX",0.93],["EX",0.97],["SX",1.00],["SX Prestige",1.08]],
    "Niro":      [["Any Trim",1.00],["FE",0.93],["LX",0.97],["EX",1.00],["Touring",1.05]],
    "Niro EV":   [["Any Trim",1.00],["Wind",0.95],["Wave",1.00],["GT-Line",1.05]],
    "EV6":       [["Any Trim",1.00],["Light",0.93],["Wind",0.97],["Air",1.00],["GT-Line",1.05],["GT",1.18]],
    "EV6 GT":    [["Any Trim",1.00],["Base",1.00]],
    "EV9":       [["Any Trim",1.00],["Light",0.95],["Wind",1.00],["Land",1.08]],
  },
  "Lexus": {
    "CT 200h":  [["Any Trim",1.00],["Base",0.97],["F Sport",1.05]],
    "IS":       [["Any Trim",1.00],["IS 300",0.97],["IS 350",1.00],["IS 500",1.15],["F Sport",1.05]],
    "ES":       [["Any Trim",1.00],["ES 250",0.97],["ES 300h",1.00],["ES 350",1.00],["F Sport",1.05],["Ultra Luxury",1.12]],
    "GS":       [["Any Trim",1.00],["GS 200t",0.95],["GS 300",0.97],["GS 350",1.00],["GS 450h",1.08],["GS F",1.22]],
    "LS":       [["Any Trim",1.00],["LS 500",0.97],["LS 500h",1.05],["LS 500 F Sport",1.05]],
    "RC":       [["Any Trim",1.00],["RC 300",0.97],["RC 350",1.00],["RC F",1.20]],
    "LC":       [["Any Trim",1.00],["LC 500",1.00],["LC 500h",1.08],["LC 500 Inspiration",1.12]],
    "UX":       [["Any Trim",1.00],["UX 200",0.95],["UX 250h",1.00],["F Sport",1.05]],
    "NX":       [["Any Trim",1.00],["NX 250",0.95],["NX 350",1.00],["NX 350h",1.05],["NX 450h+",1.10],["F Sport",1.05]],
    "RX":       [["Any Trim",1.00],["RX 350",0.97],["RX 350h",1.05],["RX 450h",1.08],["RX 500h F Sport",1.15],["F Sport",1.05]],
    "GX":       [["Any Trim",1.00],["Premium",0.97],["Luxury",1.00],["Overtrail",1.05],["F Sport",1.08]],
    "LX":       [["Any Trim",1.00],["Base",0.95],["Luxury",1.00],["F Sport",1.08],["Ultra Luxury",1.15]],
    "IS F":     [["Any Trim",1.00],["Base",1.00]],
    "RC F":     [["Any Trim",1.00],["Base",1.00],["Track Edition",1.12]],
    "GS F":     [["Any Trim",1.00],["Base",1.00]],
    "LC F":     [["Any Trim",1.00],["Base",1.00]],
    "RZ EV":    [["Any Trim",1.00],["Premium",0.97],["Luxury",1.00],["F Sport",1.08]],
  },
  "Lincoln": {
    "MKZ":       [["Any Trim",1.00],["Base",0.95],["Select",0.97],["Reserve",1.00],["Black Label",1.10]],
    "MKC":       [["Any Trim",1.00],["Base",0.95],["Select",0.97],["Reserve",1.00],["Black Label",1.10]],
    "MKX":       [["Any Trim",1.00],["Base",0.95],["Select",0.97],["Reserve",1.00],["Black Label",1.10]],
    "MKT":       [["Any Trim",1.00],["Base",0.95],["EcoBoost",1.00]],
    "Corsair":   [["Any Trim",1.00],["Standard",0.95],["Reserve",1.00],["Grand Touring",1.10],["Black Label",1.12]],
    "Nautilus":  [["Any Trim",1.00],["Standard",0.95],["Reserve",1.00],["Black Label",1.12]],
    "Aviator":   [["Any Trim",1.00],["Standard",0.95],["Reserve",1.00],["Grand Touring",1.12],["Black Label",1.15]],
    "Aviator PHEV":[["Any Trim",1.00],["Grand Touring",1.00],["Black Label",1.12]],
    "Navigator": [["Any Trim",1.00],["Standard",0.95],["Reserve",1.00],["Black Label",1.15]],
    "Navigator L":[["Any Trim",1.00],["Standard",0.95],["Reserve",1.00],["Black Label",1.15]],
    "Continental":[["Any Trim",1.00],["Premiere",0.95],["Select",0.97],["Reserve",1.00],["Black Label",1.12]],
  },
  "Mazda": {
    "Mazda2":       [["Any Trim",1.00],["Sport",0.95],["Touring",1.00],["Grand Touring",1.05]],
    "Mazda3":       [["Any Trim",1.00],["Select",0.93],["Preferred",0.97],["Premium",1.00],["Carbon Edition",1.05]],
    "Mazda3 Turbo": [["Any Trim",1.00],["Premium",1.00],["Premium Plus",1.05]],
    "Mazda6":       [["Any Trim",1.00],["Sport",0.93],["Touring",0.97],["Grand Touring",1.00],["Signature",1.08]],
    "CX-3":         [["Any Trim",1.00],["Sport",0.93],["Touring",0.97],["Grand Touring",1.05]],
    "CX-30":        [["Any Trim",1.00],["Select",0.93],["Preferred",0.97],["Premium",1.00],["Turbo Premium",1.08]],
    "CX-5":         [["Any Trim",1.00],["Sport",0.93],["Select",0.97],["Preferred",1.00],["Carbon Edition",1.05],["Signature",1.08],["Turbo",1.05]],
    "CX-50":        [["Any Trim",1.00],["Select",0.93],["Preferred",0.97],["Premium",1.00],["Premium Plus",1.05],["Turbo Premium Plus",1.10]],
    "CX-60":        [["Any Trim",1.00],["Select",0.95],["Preferred",1.00],["Premium",1.05],["Premium Plus",1.10]],
    "CX-70":        [["Any Trim",1.00],["Preferred",0.97],["Premium",1.00],["Premium Plus",1.08]],
    "CX-80":        [["Any Trim",1.00],["Select",0.95],["Preferred",1.00],["Premium Plus",1.08],["Signature",1.12]],
    "CX-90":        [["Any Trim",1.00],["Select",0.93],["Preferred",0.97],["Premium",1.00],["Premium Plus",1.05],["Signature",1.10],["PHEV Premium",1.08]],
    "CX-9":         [["Any Trim",1.00],["Sport",0.93],["Touring",0.97],["Grand Touring",1.00],["Signature",1.08]],
    "MX-5 Miata":   [["Any Trim",1.00],["Sport",0.95],["Club",1.00],["Grand Touring",1.05]],
    "MX-5 RF":      [["Any Trim",1.00],["Club",1.00],["Grand Touring",1.05]],
    "MX-30 EV":     [["Any Trim",1.00],["Base",1.00]],
  },
  "Mercedes-Benz": {
    "A-Class":  [["Any Trim",1.00],["A 220",0.97],["A 220 4MATIC",1.00]],
    "B-Class":  [["Any Trim",1.00],["B 250e",1.00]],
    "C-Class":  [["Any Trim",1.00],["C 220",0.95],["C 230",0.97],["C 240",0.97],["C 280",1.00],["C 300",0.97],["C 300 4MATIC",1.00],["C 320",1.00],["C 350",1.05],["C 350 4MATIC",1.05],["C 350e",1.05],["AMG C 43",1.12],["AMG C 55",1.18],["AMG C 63",1.20],["C 43 AMG",1.12],["C 63 AMG",1.20],["AMG C 63 S",1.22],["C 63 S AMG",1.22],["AMG C 63 S E Performance",1.25]],
    "E-Class":  [["Any Trim",1.00],["E 300",0.97],["E 320",0.97],["E 350",0.95],["E 350 4MATIC",1.00],["E 400",1.05],["E 430",1.05],["E 450",1.00],["E 450 4MATIC",1.03],["E 500",1.08],["E 550",1.10],["E 53 AMG",1.12],["AMG E 55",1.20],["AMG E 63",1.20],["E 63 AMG",1.20],["AMG E 63 S",1.22],["E 63 S AMG",1.25]],
    "S-Class":  [["Any Trim",1.00],["S 320",0.97],["S 420",1.00],["S 430",0.97],["S 450",0.97],["S 500",0.97],["S 550",1.00],["S 560",1.05],["S 580",1.00],["S 580 4MATIC",1.05],["S 600",1.15],["S 680",1.10],["AMG S 63",1.18],["S 63 AMG",1.18],["AMG S 65",1.25],["Maybach S 560",1.20],["Maybach S 580",1.20],["Maybach S 650",1.40],["Maybach S 680",1.25]],
    "CLA":      [["Any Trim",1.00],["CLA 250",0.95],["CLA 250 4MATIC",1.00],["CLA 45 AMG",1.18],["AMG CLA 35",1.10]],
    "CLS":      [["Any Trim",1.00],["CLS 450",0.97],["CLS 450 4MATIC",1.00],["CLS 53 AMG",1.15],["CLS 500",1.00],["CLS 550",1.05]],
    "GLA":      [["Any Trim",1.00],["GLA 250",0.95],["GLA 250 4MATIC",1.00],["GLA 35 AMG",1.10],["GLA 45 AMG",1.18],["AMG GLA 35",1.10],["AMG GLA 45",1.18]],
    "GLB":      [["Any Trim",1.00],["GLB 250",0.95],["GLB 250 4MATIC",1.00],["GLB 35 AMG",1.12]],
    "GLC":      [["Any Trim",1.00],["GLC 300",0.95],["GLC 300 4MATIC",1.00],["GLC 350e",1.05],["GLC 43 AMG",1.12],["AMG GLC 43",1.12],["GLC 63 AMG",1.25],["AMG GLC 63",1.20],["AMG GLC 63 S",1.22],["AMG GLC 63 S E Performance",1.25]],
    "GLK":      [["Any Trim",1.00],["GLK 250 BlueTEC",0.97],["GLK 350",1.00],["GLK 350 4MATIC",1.02]],
    "GLE":      [["Any Trim",1.00],["GLE 300d",0.97],["GLE 350",0.95],["GLE 350 4MATIC",1.00],["GLE 350d",1.00],["GLE 400",1.05],["GLE 450",1.00],["GLE 450e",1.08],["GLE 450 AMG",1.10],["GLE 53 AMG",1.12],["AMG GLE 53",1.12],["GLE 580",1.10],["GLE 63 AMG",1.25],["AMG GLE 63",1.20],["AMG GLE 63 S",1.22]],
    "GLS":      [["Any Trim",1.00],["GLS 450",0.95],["GLS 580",1.00],["Maybach GLS 600",1.30],["AMG GLS 63",1.25]],
    "ML-Class": [["Any Trim",1.00],["ML 320",0.95],["ML 320 CDI",0.97],["ML 350",1.00],["ML 350 BlueTEC",1.00],["ML 430",1.00],["ML 500",1.05],["ML 550",1.08],["AMG ML 55",1.15],["AMG ML 63",1.18]],
    "G-Class":  [["Any Trim",1.00],["G 550",1.00],["G 63 AMG",1.28],["G 580 EQ",1.15]],
    "SL":       [["Any Trim",1.00],["SL 43",0.97],["SL 500",1.00],["SL 550",1.05],["SL 55 AMG",1.05],["SL 63 AMG",1.15],["SL 65 AMG",1.20]],
    "SLC":      [["Any Trim",1.00],["SLC 300",0.97],["SLC 43 AMG",1.10]],
    "AMG C 63": [["Any Trim",1.00],["Base",1.00],["S",1.08],["S E Performance",1.15]],
    "AMG E 63": [["Any Trim",1.00],["Base",1.00],["S",1.08]],
    "AMG S 63": [["Any Trim",1.00],["Base",1.00]],
    "AMG GT":   [["Any Trim",1.00],["AMG GT",0.97],["AMG GT S",1.05],["AMG GT R",1.15],["AMG GT Black Series",1.30]],
    "AMG GT 63":[["Any Trim",1.00],["Base",1.00],["S",1.08]],
    "AMG G 63": [["Any Trim",1.00],["Base",1.00]],
    "EQB":      [["Any Trim",1.00],["EQB 250+",0.95],["EQB 300 4MATIC",1.00],["EQB 350 4MATIC",1.05]],
    "EQC":      [["Any Trim",1.00],["EQC 400 4MATIC",1.00]],
    "EQE":      [["Any Trim",1.00],["EQE 350+",0.97],["EQE 350 4MATIC",1.00],["EQE 500 4MATIC",1.05],["AMG EQE 43",1.15],["AMG EQE 53",1.20]],
    "EQS":      [["Any Trim",1.00],["EQS 450+",0.97],["EQS 450 4MATIC",1.00],["EQS 580 4MATIC",1.08],["AMG EQS 53",1.22]],
  },
  "Mitsubishi": {
    "Mirage":            [["Any Trim",1.00],["ES",0.93],["LE",0.97],["SE",1.00],["SEL",1.05]],
    "Mirage G4":         [["Any Trim",1.00],["ES",0.93],["LE",0.97],["SE",1.00],["SEL",1.05]],
    "Galant":            [["Any Trim",1.00],["DE",0.93],["ES",0.97],["SE",1.00],["Ralliart",1.10]],
    "Lancer":            [["Any Trim",1.00],["ES",0.93],["SE",0.97],["SEL",1.00],["GT",1.05],["Ralliart",1.10]],
    "Eclipse Cross":     [["Any Trim",1.00],["ES",0.93],["LE",0.97],["SE",1.00],["SEL",1.05]],
    "Eclipse Cross PHEV":[["Any Trim",1.00],["SE",1.00],["SEL",1.05]],
    "Outlander Sport":   [["Any Trim",1.00],["ES",0.93],["LE",0.97],["BE",1.00],["SE",1.00],["SEL",1.05]],
    "Outlander":         [["Any Trim",1.00],["ES",0.93],["LE",0.97],["SE",1.00],["SEL",1.05],["SEL Touring",1.08]],
    "Outlander PHEV":    [["Any Trim",1.00],["SE",1.00],["SEL",1.05],["SEL Touring",1.10]],
    "Endeavor":          [["Any Trim",1.00],["LS",0.95],["Limited",1.00]],
    "3000GT":            [["Any Trim",1.00],["Base",0.95],["SL",1.00],["VR-4",1.15]],
    "Lancer Evolution":  [["Any Trim",1.00],["GSR",1.00],["MR",1.10],["Final Edition",1.20]],
  },
  "Nissan": {
    "Versa":     [["Any Trim",1.00],["S",0.92],["S Plus",0.95],["SV",0.97],["SR",1.00]],
    "Kicks":     [["Any Trim",1.00],["S",0.93],["SV",0.97],["SR",1.00]],
    "Sentra":    [["Any Trim",1.00],["S",0.93],["SV",0.97],["SR",1.00]],
    "Altima":    [["Any Trim",1.00],["S",0.93],["SV",0.97],["SR",1.00],["SL",1.03],["Platinum",1.07]],
    "Maxima":    [["Any Trim",1.00],["S",0.95],["SV",1.00],["SR",1.03],["Platinum",1.08]],
    "Rogue Sport":[["Any Trim",1.00],["S",0.93],["SV",0.97],["SL",1.00]],
    "Rogue":     [["Any Trim",1.00],["S",0.93],["SV",0.97],["SL",1.00],["Platinum",1.07]],
    "Murano":    [["Any Trim",1.00],["S",0.95],["SV",1.00],["SL",1.03],["Platinum",1.08]],
    "Pathfinder":[["Any Trim",1.00],["S",0.93],["SV",0.97],["SL",1.00],["Rock Creek",1.05],["Platinum",1.08]],
    "Armada":    [["Any Trim",1.00],["S",0.93],["SV",0.97],["SL",1.00],["Platinum",1.08]],
    "Frontier":  [["Any Trim",1.00],["S",0.93],["SV",0.97],["Pro-4X",1.05],["PRO-X",1.08]],
    "Titan":     [["Any Trim",1.00],["S",0.93],["SV",0.97],["SL",1.00],["Pro-4X",1.05],["Platinum",1.08],["Platinum Reserve",1.12]],
    "370Z":      [["Any Trim",1.00],["Base",0.97],["Sport",1.00],["Touring",1.05],["NISMO",1.15]],
    "400Z":      [["Any Trim",1.00],["Sport",0.97],["Performance",1.00],["Proto Spec",1.08]],
    "GT-R":      [["Any Trim",1.00],["Premium",1.00],["Track Edition",1.12],["NISMO",1.25]],
    "Leaf":      [["Any Trim",1.00],["S",0.93],["SV",0.97],["SV Plus",1.00],["SL Plus",1.05]],
    "Ariya EV":  [["Any Trim",1.00],["Engage",0.93],["Evolve+",1.00],["Empower+",1.05],["Platinum+",1.10]],
  },
  "RAM": {
    "ProMaster City": [["Any Trim",1.00],["Tradesman",0.95],["Wagon",1.00],["SLT",1.05]],
    "ProMaster":      [["Any Trim",1.00],["Cargo",0.95],["Window Van",1.00],["Cutaway",1.05]],
    "1500":           [["Any Trim",1.00],["Tradesman",0.92],["HFE",0.95],["Big Horn",0.97],["Lone Star",0.97],["Laramie",1.00],["Rebel",1.05],["Laramie Longhorn",1.08],["Limited",1.12],["Limited Longhorn",1.15],["TRX",1.32]],
    "1500 Classic":   [["Any Trim",1.00],["Tradesman",0.93],["SLT",0.97],["Express",1.00],["Big Horn",1.00],["Warlock",1.03]],
    "1500 TRX":       [["Any Trim",1.00],["Base",1.00],["Launch Edition",1.08]],
    "2500":           [["Any Trim",1.00],["Tradesman",0.92],["Big Horn",0.97],["Laramie",1.00],["Power Wagon",1.10],["Laramie Longhorn",1.08],["Limited",1.12]],
    "3500":           [["Any Trim",1.00],["Tradesman",0.92],["Big Horn",0.97],["Laramie",1.00],["Laramie Longhorn",1.08],["Limited",1.12]],
    "4500 / 5500":    [["Any Trim",1.00],["Tradesman",0.95],["SLT",1.00],["Laramie",1.08]],
  },
  "Subaru": {
    "Impreza":        [["Any Trim",1.00],["Base",0.93],["Premium",0.97],["Sport",1.00],["Limited",1.05]],
    "Crosstrek":      [["Any Trim",1.00],["Base",0.93],["Premium",0.97],["Sport",1.00],["Limited",1.05],["Wilderness",1.08]],
    "Crosstrek Hybrid":[["Any Trim",1.00],["Limited",1.00]],
    "Legacy":         [["Any Trim",1.00],["Base",0.93],["Premium",0.97],["Sport",1.00],["Limited",1.05],["Limited XT",1.08]],
    "Outback":        [["Any Trim",1.00],["Base",0.93],["Premium",0.97],["Limited",1.00],["Limited XT",1.05],["Touring",1.08],["Touring XT",1.10],["Wilderness",1.08]],
    "Forester":       [["Any Trim",1.00],["Base",0.93],["Premium",0.97],["Sport",1.00],["Limited",1.05],["Touring",1.08],["Wilderness",1.08]],
    "Ascent":         [["Any Trim",1.00],["Base",0.95],["Premium",1.00],["Limited",1.05],["Touring",1.10]],
    "BRZ":            [["Any Trim",1.00],["Premium",0.97],["Limited",1.00],["tS",1.10]],
    "WRX":            [["Any Trim",1.00],["Base",0.97],["Premium",1.00],["GT",1.05],["Series.White",1.08]],
    "WRX STI":        [["Any Trim",1.00],["Base",1.00],["Limited",1.08],["S209",1.25],["Series.Grey",1.12]],
    "Solterra EV":    [["Any Trim",1.00],["Premium",0.97],["Limited",1.00],["Touring",1.05]],
  },
  "Tesla": {
    "Model 3 RWD":         [["Any Trim",1.00],["Standard Range",0.97],["Long Range",1.00]],
    "Model 3 Long Range":  [["Any Trim",1.00],["AWD",1.00],["Performance",1.08]],
    "Model 3 Performance": [["Any Trim",1.00],["Base",1.00]],
    "Model Y RWD":         [["Any Trim",1.00],["Standard Range",0.97],["Long Range",1.00]],
    "Model Y Long Range":  [["Any Trim",1.00],["AWD",1.00],["Performance",1.08]],
    "Model Y Performance": [["Any Trim",1.00],["Base",1.00]],
    "Model S":             [["Any Trim",1.00],["Long Range",0.97],["Plaid",1.12]],
    "Model S Plaid":       [["Any Trim",1.00],["Base",1.00]],
    "Model X":             [["Any Trim",1.00],["Long Range",0.97],["Plaid",1.12]],
    "Model X Plaid":       [["Any Trim",1.00],["Base",1.00]],
    "Cybertruck":          [["Any Trim",1.00],["RWD",0.93],["AWD",1.00],["Cyberbeast",1.12]],
    "Roadster":            [["Any Trim",1.00],["Base",1.00]],
  },
  "Toyota": {
    "Yaris":          [["Any Trim",1.00],["L",0.92],["LE",0.97],["SE",1.00]],
    "Corolla":        [["Any Trim",1.00],["Base",0.92],["CE",0.92],["L",0.92],["LE",0.97],["S",0.97],["SE",1.00],["XRS",1.05],["XLE",1.03],["XSE",1.05]],
    "Corolla Cross":  [["Any Trim",1.00],["L",0.93],["LE",0.97],["XLE",1.00],["XSE",1.05]],
    "Corolla GR":     [["Any Trim",1.00],["Core",1.00],["Circuit Edition",1.08],["Morizo Edition",1.15]],
    "Camry":          [["Any Trim",1.00],["Base",0.92],["CE",0.92],["LE",0.93],["SE",0.97],["XLE",1.00],["XSE",1.03],["TRD",1.08]],
    "Camry Hybrid":   [["Any Trim",1.00],["LE",0.93],["SE",0.97],["XLE",1.00],["XSE",1.03]],
    "Avalon":         [["Any Trim",1.00],["XL",0.93],["XLS",0.97],["XLE",0.95],["TRD",1.00],["Touring",1.03],["Limited",1.08]],
    "Venza":          [["Any Trim",1.00],["LE",0.95],["XLE",1.00],["Limited",1.08]],
    "RAV4":           [["Any Trim",1.00],["Base",0.92],["LE",0.93],["XLE",0.97],["XLE Premium",1.00],["TRD Off-Road",1.05],["Adventure",1.05],["Limited",1.08],["SE",1.00]],
    "RAV4 Hybrid":    [["Any Trim",1.00],["LE",0.93],["XLE",0.97],["XLE Premium",1.00],["SE",1.03],["Limited",1.08]],
    "RAV4 Prime":     [["Any Trim",1.00],["SE",0.97],["XSE",1.00],["XSE Premium",1.05]],
    "Highlander":     [["Any Trim",1.00],["Base",0.92],["L",0.92],["LE",0.97],["Sport",0.97],["SE",0.97],["XLE",1.00],["Limited",1.05],["Platinum",1.10]],
    "Highlander Hybrid":[["Any Trim",1.00],["LE",0.95],["XLE",1.00],["Limited",1.05],["Platinum",1.10]],
    "4Runner":        [["Any Trim",1.00],["Base",0.92],["SR5",0.93],["Sport",0.97],["Limited",1.05],["TRD Sport",0.97],["TRD Off-Road",1.00],["TRD Pro",1.12],["Trailhunter",1.15]],
    "Sequoia":        [["Any Trim",1.00],["SR5",0.93],["Limited",1.00],["Platinum",1.05],["Capstone",1.12],["TRD Pro",1.10]],
    "Sequoia Hybrid": [["Any Trim",1.00],["SR5",0.95],["Limited",1.00],["Capstone",1.10]],
    "Tacoma":         [["Any Trim",1.00],["Base",0.92],["SR",0.92],["SR5",0.97],["PreRunner",0.97],["TRD Sport",1.00],["TRD Off-Road",1.05],["Limited",1.07],["TRD Pro",1.12],["Trailhunter",1.15]],
    "Tundra":         [["Any Trim",1.00],["Base",0.92],["SR",0.92],["SR5",0.97],["Limited",1.00],["Platinum",1.05],["1794",1.08],["Capstone",1.12],["TRD Pro",1.10]],
    "Tundra Hybrid":  [["Any Trim",1.00],["SR5",0.95],["Limited",1.00],["Platinum",1.05],["Capstone",1.12],["TRD Pro",1.10]],
    "Sienna":         [["Any Trim",1.00],["Base",0.92],["CE",0.92],["LE",0.93],["XLE",0.97],["SE",1.00],["XSE",1.00],["Limited",1.05],["Platinum",1.10]],
    "Land Cruiser":   [["Any Trim",1.00],["Base",0.97],["1958",1.00],["First Edition",1.05]],
    "GR86":           [["Any Trim",1.00],["Base",0.97],["Premium",1.00]],
    "GR Corolla":     [["Any Trim",1.00],["Core",1.00],["Circuit Edition",1.08],["Morizo Edition",1.15]],
    "GR Supra":       [["Any Trim",1.00],["2.0",0.93],["3.0",1.00],["3.0 Premium",1.05],["A91",1.12],["A91-CF",1.15]],
    "Prius":          [["Any Trim",1.00],["Standard",0.93],["Two",0.93],["Three",0.97],["Four",1.00],["LE",0.93],["XLE",0.97],["Limited",1.00]],
    "Prius Prime":    [["Any Trim",1.00],["Plus",0.97],["Premium",1.00],["Advanced",1.05],["SE",0.97],["XSE",1.00],["XSE Premium",1.05]],
    "bZ4X EV":        [["Any Trim",1.00],["XLE",0.97],["Limited",1.05]],
    "Mirai (Hydrogen)":[["Any Trim",1.00],["XLE",0.95],["Limited",1.05]],
  },
  "Volkswagen": {
    "Polo":          [["Any Trim",1.00],["Trendline",0.93],["Comfortline",0.97],["Highline",1.00]],
    "Jetta":         [["Any Trim",1.00],["S",0.92],["Sport",0.97],["SE",1.00],["SEL",1.05],["SEL Premium",1.08]],
    "Jetta GLI":     [["Any Trim",1.00],["S",0.97],["Autobahn",1.00],["35th Anniversary",1.05]],
    "Passat":        [["Any Trim",1.00],["S",0.93],["SE",0.97],["SEL",1.00],["SEL Premium",1.05]],
    "Arteon":        [["Any Trim",1.00],["SE",0.95],["SEL",1.00],["SEL R-Line",1.05],["SEL Premium",1.08]],
    "Golf":          [["Any Trim",1.00],["S",0.93],["SE",0.97],["SEL",1.00]],
    "GTI":           [["Any Trim",1.00],["S",0.97],["SE",1.00],["Autobahn",1.05],["35th Anniversary",1.08],["Clubsport",1.10]],
    "Golf R":        [["Any Trim",1.00],["Base",1.00],["20th Anniversary",1.08]],
    "Taos":          [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00]],
    "Tiguan":        [["Any Trim",1.00],["S",0.92],["SE",0.97],["SEL",1.00],["SEL Premium",1.08],["SEL R-Line",1.05]],
    "Atlas":         [["Any Trim",1.00],["S",0.92],["SE",0.97],["SE Technology",1.00],["SEL",1.05],["SEL Premium",1.10]],
    "Atlas Cross Sport":[["Any Trim",1.00],["S",0.92],["SE",0.97],["SE Technology",1.00],["SEL",1.05],["SEL Premium",1.10]],
    "ID.4":          [["Any Trim",1.00],["Standard",0.93],["Pro",0.97],["Pro S",1.00],["Pro S Plus",1.05],["GTX",1.10]],
    "ID.Buzz":       [["Any Trim",1.00],["Pro",0.97],["Pro S",1.00],["Pro S Plus",1.05]],
  },
  "Volvo": {
    "S40":           [["Any Trim",1.00],["Base",0.93],["2.4i",0.97],["T5",1.00]],
    "S60":           [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05],["T8 Polestar",1.15]],
    "S60 Recharge":  [["Any Trim",1.00],["T8 Core",0.97],["T8 Plus",1.00],["T8 Ultimate",1.08]],
    "S90":           [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05]],
    "S90 Recharge":  [["Any Trim",1.00],["T8 Core",0.97],["T8 Plus",1.00],["T8 Ultimate",1.10]],
    "V60":           [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05]],
    "V60 Cross Country":[["Any Trim",1.00],["T5",0.97],["T6",1.00]],
    "V90":           [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00]],
    "V90 Cross Country":[["Any Trim",1.00],["T5",0.97],["T6",1.00]],
    "XC40":          [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05]],
    "XC40 Recharge": [["Any Trim",1.00],["Core",0.95],["Plus",1.00],["Ultimate",1.08]],
    "XC60":          [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05],["Polestar Engineered",1.12]],
    "XC60 Recharge": [["Any Trim",1.00],["T8 Core",0.97],["T8 Plus",1.00],["T8 Ultimate",1.08]],
    "XC90":          [["Any Trim",1.00],["Momentum",0.95],["Inscription",1.00],["R-Design",1.05],["Excellence",1.15]],
    "XC90 Recharge": [["Any Trim",1.00],["T8 Core",0.97],["T8 Plus",1.00],["T8 Ultimate",1.10]],
    "C40 Recharge":  [["Any Trim",1.00],["Core",0.95],["Plus",1.00],["Ultimate",1.08]],
    "Polestar 1":    [["Any Trim",1.00],["Base",1.00]],
    "Polestar 2":    [["Any Trim",1.00],["Standard Range Single Motor",0.95],["Long Range Single Motor",1.00],["Long Range Dual Motor",1.05],["Performance",1.12]],
  },
};
const catColor = c => ({"Maintenance":"#22c55e","Brakes":"#ef4444","Electrical":"#f59e0b","Drivetrain":"#8b5cf6","Engine":"#f97316","HVAC":"#06b6d4","Suspension":"#3b82f6","EV Systems":"#34d399"}[c] || "#6b7280");

// EV models — used to filter iceOnly repairs and surface EV-specific repairs
const evModels = new Set([
  // Tesla — all models are EV
  "Any Model","Model 3 RWD","Model 3 Long Range","Model 3 Performance",
  "Model Y RWD","Model Y Long Range","Model Y Performance",
  "Model S","Model S Plaid","Model X","Model X Plaid","Cybertruck","Roadster",
  // Nissan
  "Leaf","Ariya EV",
  // Hyundai
  "Ioniq 5","Ioniq 6","Ioniq 9","Kona Electric",
  // Kia
  "EV6","EV6 GT","EV9","Niro EV",
  // Chevrolet
  "Bolt EV","Bolt EUV","Blazer EV","Silverado EV",
  // Ford
  "Mustang Mach-E","F-150 Lightning",
  // VW
  "ID.4","ID.Buzz",
  // Lexus
  "RZ EV",
  // Toyota
  "bZ4X EV",
  // Honda
  "Prologue EV",
  // Acura
  "ZDX",
  // Cadillac
  "Lyriq",
  // BMW
  "i3","i4","i5","i7","iX",
  // Volvo
  "XC40 Recharge","C40 Recharge","XC60 Recharge","XC90 Recharge","S60 Recharge",
  // Audi
  "e-tron","e-tron GT","Q4 e-tron","Q8 e-tron",
  // Subaru
  "Solterra EV",
]);


const labelColor = l => ({"Very High Cost":"#ef4444","High Cost":"#f97316","Above Average":"#f59e0b","Average":"#22c55e","Below Average":"#06b6d4"}[l] || "#888");

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const remainder = rating % 1;
  const half = remainder >= 0.25 && remainder < 0.75;
  const roundUp = remainder >= 0.75;
  const fullCount = roundUp ? full + 1 : full;
  const empty = 5 - fullCount - (half ? 1 : 0);
  return (
    <span style={{ fontSize:"13px", letterSpacing:"1px" }}>
      <span style={{ color:"#c9a84c" }}>{"★".repeat(fullCount)}</span>
      {half && (
        <span style={{ display:"inline-block", position:"relative", width:"0.65em" }}>
          <span style={{ color:"#555" }}>★</span>
          <span style={{ color:"#c9a84c", position:"absolute", left:0, top:0, width:"50%", overflow:"hidden" }}>★</span>
        </span>
      )}
      <span style={{ color:"#555" }}>{"★".repeat(empty)}</span>
      <span style={{ color:"#555", marginLeft:"5px", letterSpacing:"0" }}>{rating.toFixed(1)}</span>
    </span>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────

function TierPickerPopover({ tierPicker, data, adj, onClose, onPick }) {
  const tiers = Object.entries(data.costs);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:998 }} />
      <div style={{ position:"fixed", top: tierPicker.top, right: tierPicker.right, zIndex:999, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"10px", padding:"12px", minWidth:"220px", boxShadow:"0 12px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize:"11px", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
          Choose service tier
        </div>
        {tiers.map(([tierName, vals]) => {
          const lo = adj(vals.low,  data, tierPicker.name);
          const hi = adj(vals.high, data, tierPicker.name);
          return (
            <button key={tierName} onClick={() => onPick(tierPicker.name, tierName)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", background:"#111", border:"1px solid #222", borderRadius:"6px", padding:"9px 12px", marginBottom:"6px", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
              <span style={{ fontSize:"13px", color:"#ccc" }}>{tierName}</span>
              <span style={{ fontSize:"13px", color:"#c9a84c", fontWeight:"500" }}>${lo.toLocaleString()} – ${hi.toLocaleString()}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function BasketModal({ basket, repairData, adj, catColor, make, model, year, zip, onClose, onRemove, onClear, RepairIcon, shareURL, handleShare, handlePrint, buildPrintHTML }) {
  const [shopType, setShopType] = useState("both");
  const shopMult = shopType === "dealer" ? 1.18 : shopType === "independent" ? 0.80 : 1.0;

  const items = Array.from(basket.entries()).map(([name, tierName]) => {
    const d = repairData[name];
    if (!d) return null;
    const tier = d.costs[tierName];
    if (!tier) return null;
    return {
      name, tierName, data: d,
      low:  Math.round(adj(tier.low,  d, name) * shopMult),
      high: Math.round(adj(tier.high, d, name) * shopMult),
    };
  }).filter(Boolean);

  const totalLow  = items.reduce((s, i) => s + i.low,  0);
  const totalHigh = items.reduce((s, i) => s + i.high, 0);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div onClick={e => e.stopPropagation()} className="basket-print-target" style={{ background:"#161616", border:"1px solid #2a2a2a", borderRadius:"14px", width:"100%", maxWidth:"560px", maxHeight:"85vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div style={{ padding:"24px 24px 16px", borderBottom:"1px solid #1e1e1e" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
            <div>
              <div style={{ fontWeight:"600", fontSize:"18px", letterSpacing:"-0.02em", marginBottom:"4px" }}>Repair Estimate</div>
              <div style={{ fontSize:"12px", color:"#555" }}>
                {make !== "Any Make" ? `${year !== "Any Year" ? year + " " : ""}${make}${model !== "Any Model" ? " " + model : ""}` : "All vehicles"}
                {zip ? ` · ${zip}` : ""}
              </div>
            </div>
            <button onClick={onClose} style={{ background:"#222", border:"1px solid #2a2a2a", borderRadius:"6px", width:"30px", height:"30px", cursor:"pointer", color:"#888", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>✕</button>
          </div>

          {/* Shop type toggle */}
          <div style={{ display:"flex", gap:"6px" }}>
            {[["both","Both"], ["independent","Independent"], ["dealer","Dealer"]].map(([val, label]) => (
              <button key={val} onClick={() => setShopType(val)}
                style={{ flex:1, padding:"6px 0", fontSize:"11px", fontWeight:"500", fontFamily:"inherit", borderRadius:"6px", cursor:"pointer", letterSpacing:"0.04em", border:`1px solid ${shopType===val ? "#c9a84c" : "#2a2a2a"}`, background: shopType===val ? "#c9a84c18" : "transparent", color: shopType===val ? "#c9a84c" : "#555", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          {shopType !== "both" && (
            <div style={{ fontSize:"11px", color:"#555", marginTop:"8px", fontStyle:"italic" }}>
              {shopType === "independent" ? "⬇ ~20% below average — independents have lower overhead and flexible pricing" : "⬆ ~18% above average — dealers charge more for factory-trained techs and OEM parts"}
            </div>
          )}
        </div>

        {/* Line items */}
        <div style={{ padding:"16px 24px" }}>
          {items.map(({ name, tierName, data, low: iLow, high: iHigh }) => {
            const cc = catColor(data.category);
            return (
              <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <RepairIcon icon={data.icon} size={18} />
                  <div>
                    <div style={{ fontSize:"14px", fontWeight:"500" }}>{name}</div>
                    <div style={{ display:"flex", gap:"4px", marginTop:"2px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"10px", color:cc, background:`${cc}18`, padding:"2px 6px", borderRadius:"10px", letterSpacing:"0.06em", textTransform:"uppercase" }}>{data.category}</span>
                      <span style={{ fontSize:"10px", color:"#666", background:"#1e1e1e", padding:"2px 6px", borderRadius:"10px" }}>{tierName}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
                  <div style={{ fontSize:"14px", color:"#c9a84c", textAlign:"right" }}>
                    ${iLow.toLocaleString()} – ${iHigh.toLocaleString()}
                  </div>
                  <button onClick={e => onRemove(e, name)} style={{ background:"transparent", border:"1px solid #2a2a2a", borderRadius:"4px", width:"22px", height:"22px", cursor:"pointer", color:"#555", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>✕</button>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0 8px" }}>
            <div style={{ fontWeight:"600", fontSize:"15px" }}>Total Estimate</div>
            <div style={{ fontSize:"22px", fontWeight:"300", letterSpacing:"-0.02em", color:"#c9a84c" }}>
              ${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize:"11px", color:"#444", marginBottom:"20px" }}>Parts + labor · Adjusted for {zip || "national average"} · Actual quotes may vary</div>

          <button style={{ width:"100%", background:"#c9a84c", border:"none", borderRadius:"8px", padding:"12px", fontSize:"12px", fontWeight:"700", color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Get Shop Quotes →
          </button>
          <div className="no-print" style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
            <button onClick={() => handleShare(shareURL, "RepairIQ Estimate")} style={{ flex:1, background:"transparent", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
              🔗 Share
            </button>
            <button onClick={() => handlePrint(buildPrintHTML({
                title: "Repair Estimate",
                subtitle: [make !== "Any Make" ? `${year !== "Any Year" ? year + " " : ""}${make}${model !== "Any Model" ? " " + model : ""}` : "All vehicles", zip ? `ZIP ${zip}` : ""].filter(Boolean).join(" · "),
                items,
                totalLow,
                totalHigh,
                footerNote: `Parts + labor · ${shopType === "dealer" ? "Dealer estimate (~18% above avg)" : shopType === "independent" ? "Independent shop estimate (~20% below avg)" : "Blended average"} · Actual quotes may vary`
              }))} style={{ flex:1, background:"transparent", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
              🖨️ Print
            </button>
          </div>
          <button onClick={onClear} style={{ width:"100%", background:"transparent", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", color:"#555", cursor:"pointer", fontFamily:"inherit", marginTop:"8px" }}>
            Clear All &amp; Start Over
          </button>
        </div>
      </div>
    </div>
  );
}


function RepairIcon({ icon, size = 20 }) {
  if (icon.startsWith("<svg")) {
    return (
      <span
        style={{ display:"inline-flex", width:size, height:size, alignItems:"center", justifyContent:"center" }}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  }
  return <span style={{ fontSize: size }}>{icon}</span>;
}


function ModalContent({ name, data, onClose, adj, catColor, zip, loadingShops, shops, votes, handleVote, Stars, shareURL, handleShare, handlePrint, buildPrintHTML }) {
  const [shopType, setShopType] = useState("both"); // "both" | "dealer" | "independent"
  const shopMult = shopType === "dealer" ? 1.18 : shopType === "independent" ? 0.80 : 1.0;
  const sadj = (v, d, n) => Math.round(adj(v, d, n) * shopMult);

  const tiers = Object.entries(data.costs);
  const cc = catColor(data.category);
  const loLow  = sadj(Math.min(...tiers.map(([,v]) => v.low)), data, name);
  const hiHigh = sadj(Math.max(...tiers.map(([,v]) => v.high)), data, name);
  return (
    <div onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div onClick={e => e.stopPropagation()}
        className="modal-print-target" style={{ background:"#161616", border:"1px solid #2a2a2a", borderRadius:"14px", width:"100%", maxWidth:"520px", maxHeight:"85vh", overflowY:"auto", position:"relative", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>

        {/* Color bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:cc, borderRadius:"14px 14px 0 0" }} />

        {/* Header */}
        <div style={{ padding:"24px 24px 16px", borderBottom:"1px solid #1e1e1e" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ marginBottom:"6px" }}><RepairIcon icon={data.icon} size={24} /></div>
              <div style={{ fontWeight:"600", fontSize:"18px", letterSpacing:"-0.02em", marginBottom:"4px" }}>{name}</div>
              <span style={{ fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cc, background:`${cc}18`, padding:"3px 8px", borderRadius:"20px" }}>{data.category}</span>
            </div>
            <button onClick={onClose}
              style={{ background:"#222", border:"1px solid #2a2a2a", borderRadius:"6px", width:"30px", height:"30px", cursor:"pointer", color:"#888", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"inherit" }}>
              ✕
            </button>
          </div>
          <div style={{ marginTop:"16px" }}>
            <div style={{ fontSize:"28px", fontWeight:"300", letterSpacing:"-0.03em" }}>
              ${loLow.toLocaleString()} – ${hiHigh.toLocaleString()}
            </div>
            <div style={{ fontSize:"12px", color:"#444", display:"flex", gap:"12px", marginTop:"4px" }}>
              <span>⏱ {data.labor}</span>
              <span style={{ color:"#333" }}>parts + labor</span>
            </div>
          </div>

          {/* Shop type toggle */}
          <div style={{ display:"flex", gap:"6px", marginTop:"14px" }}>
            {[["both","Both"], ["independent","Independent"], ["dealer","Dealer"]].map(([val, label]) => (
              <button key={val} onClick={() => setShopType(val)}
                style={{ flex:1, padding:"6px 0", fontSize:"11px", fontWeight:"500", fontFamily:"inherit", borderRadius:"6px", cursor:"pointer", letterSpacing:"0.04em", border:`1px solid ${shopType===val ? "#c9a84c" : "#2a2a2a"}`, background: shopType===val ? "#c9a84c18" : "transparent", color: shopType===val ? "#c9a84c" : "#555", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          {shopType !== "both" && (
            <div style={{ fontSize:"11px", color:"#555", marginTop:"8px", fontStyle:"italic" }}>
              {shopType === "independent" ? "⬇ ~20% below average — independents have lower overhead and flexible pricing" : "⬆ ~18% above average — dealers charge more for factory-trained techs and OEM parts"}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:"20px 24px" }}>

          {/* Tier breakdown */}
          <div style={{ fontSize:"11px", color:"#555", marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.08em" }}>By Service Tier</div>
          {tiers.map(([tier, vals]) => (
            <div key={tier} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a1a", fontSize:"13px" }}>
              <span style={{ color:"#888" }}>{tier}</span>
              <span style={{ color:"#c9a84c", fontWeight:"500" }}>${sadj(vals.low, data, name).toLocaleString()} – ${sadj(vals.high, data, name).toLocaleString()}</span>
            </div>
          ))}

          {/* Notes */}
          <div style={{ marginTop:"16px", background:"#111", borderRadius:"8px", padding:"12px 14px", fontSize:"12px", color:"#555", lineHeight:"1.7", fontStyle:"italic" }}>
            💡 {data.notes}
          </div>

          {/* Nearby shops */}
          <div style={{ marginTop:"20px" }}>
            <div style={{ fontSize:"11px", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
              {zip ? `Shops Near ${zip}` : "Nearby Shops"}
            </div>
            {!zip ? (
              <div style={{ background:"#111", border:"1px dashed #222", borderRadius:"8px", padding:"16px", textAlign:"center", fontSize:"12px", color:"#444" }}>
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
              </div>
            )}
          </div>

          {/* Vote */}
          <div style={{ marginTop:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"12px", color:"#555" }}>Were these prices helpful?</span>
            <button onClick={e => handleVote(e, name, "up")} style={{ background: votes[name]==="up" ? "#22c55e22" : "transparent", border:`1px solid ${votes[name]==="up" ? "#22c55e" : "#2a2a2a"}`, borderRadius:"6px", padding:"5px 12px", fontSize:"13px", color: votes[name]==="up" ? "#22c55e" : "#555", cursor: votes[name] ? "default" : "pointer", fontFamily:"inherit" }}>
              👍 {votes[name]==="up" ? "Thanks!" : "Yes"}
            </button>
            <button onClick={e => handleVote(e, name, "down")} style={{ background: votes[name]==="down" ? "#ef444422" : "transparent", border:`1px solid ${votes[name]==="down" ? "#ef4444" : "#2a2a2a"}`, borderRadius:"6px", padding:"5px 12px", fontSize:"13px", color: votes[name]==="down" ? "#ef4444" : "#555", cursor: votes[name] ? "default" : "pointer", fontFamily:"inherit" }}>
              👎 {votes[name]==="down" ? "Got it" : "No"}
            </button>
          </div>

          <button style={{ marginTop:"16px", width:"100%", background:"#c9a84c", color:"#0f0f0f", border:"none", borderRadius:"8px", padding:"12px", fontSize:"12px", fontWeight:"700", fontFamily:"inherit", cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Get Free Quotes →
          </button>
          <div className="no-print" style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
            <button onClick={() => handleShare(shareURL, `${name} — RepairIQ Estimate`)} style={{ flex:1, background:"transparent", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
              🔗 Share
            </button>
            <button onClick={() => {
                const tiers = Object.entries(data.costs);
                handlePrint(buildPrintHTML({
                  title: name,
                  subtitle: zip ? `Near ${zip}` : "National average estimate",
                  items: tiers.map(([tier, vals]) => ({ name: tier, tierName: tier, low: adj(vals.low, data, name), high: adj(vals.high, data, name) })),
                  totalLow: adj(Math.min(...tiers.map(([,v]) => v.low)), data, name),
                  totalHigh: adj(Math.max(...tiers.map(([,v]) => v.high)), data, name),
                  footerNote: "Parts + labor · Prices vary by location and shop"
                }));
              }} style={{ flex:1, background:"transparent", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function RepairIQ() {
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("All");
  const [make, setMake]                   = useState("Any Make");
  const [model, setModel]                 = useState("Any Model");
  const [trim, setTrim]                   = useState("Any Trim");
  const [year, setYear]                   = useState("Any Year");
  const [zipInput, setZipInput]           = useState("");
  const [zip, setZip]                     = useState("");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [shops, setShops]                 = useState([]);
  const [loadingShops, setLoadingShops]   = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState(null);
  const [votes, setVotes]                 = useState({});
  const [basket, setBasket]               = useState(new Map()); // name → tierName
  const [showBasket, setShowBasket]       = useState(false);
  const [tierPicker, setTierPicker]       = useState(null); // { name, x, y } or null
  const [appMode, setAppMode]             = useState("costs"); // "costs" | "buyside"

// ── URL STATE SYNC ────────────────────────────────────────────────────────
  // Parse URL params on first render to restore shared state
  useState(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("make"))  { setMake(p.get("make")); }
    if (p.get("model")) { setModel(p.get("model")); }
    if (p.get("trim"))  { setTrim(p.get("trim")); }
    if (p.get("year"))  { setYear(p.get("year")); }
    if (p.get("zip"))   { setZip(p.get("zip")); setZipInput(p.get("zip")); }
    if (p.get("repair")) { setSelectedRepair(p.get("repair")); }
    if (p.get("repairs")) {
      try {
        const restored = new Map();
        p.get("repairs").split(",").forEach(pair => {
          const [name, tier] = pair.split(":").map(decodeURIComponent);
          if (name && tier) restored.set(name, tier);
        });
        if (restored.size > 0) setBasket(restored);
      } catch {}
    }
  });

// Production year ranges — verified manufacturer data (start year, end year)
const modelYears = {
  "Acura": {
    "ILX": [2013, 2022],
    "Integra": [2023, 2026],
    "TL": [1995, 2014],
    "TLX": [2015, 2026],
    "RL": [1996, 2012],
    "RLX": [2014, 2020],
    "RDX": [2007, 2026],
    "MDX": [2001, 2026],
    "ZDX": [2024, 2026],
    "NSX": [1991, 2005],
  },
  "Audi": {
    "A3": [1997, 2026],
    "A4": [1995, 2026],
    "A5": [2008, 2026],
    "A6": [1994, 2026],
    "A7": [2012, 2026],
    "A8": [1994, 2026],
    "Q3": [2013, 2026],
    "Q5": [2009, 2026],
    "Q7": [2007, 2026],
    "Q8": [2019, 2026],
    "TT": [1999, 2023],
    "R8": [2008, 2023],
    "S3": [2015, 2026],
    "S4": [1992, 2026],
    "S5": [2008, 2026],
    "S6": [1995, 2026],
    "S7": [2013, 2026],
    "S8": [1994, 2026],
    "RS3": [2017, 2026],
    "RS4": [2001, 2026],
    "RS5": [2010, 2026],
    "RS6": [2003, 2026],
    "RS7": [2014, 2026],
    "e-tron": [2019, 2024],
    "e-tron GT": [2022, 2026],
    "Q4 e-tron": [2022, 2026],
  },
  "BMW": {
    "1 Series": [2008, 2013],
    "2 Series": [2014, 2026],
    "3 Series": [1992, 2026],
    "4 Series": [2014, 2026],
    "5 Series": [1990, 2026],
    "6 Series": [2004, 2019],
    "7 Series": [1990, 2026],
    "8 Series": [2019, 2026],
    "X1": [2013, 2026],
    "X2": [2018, 2024],
    "X3": [2004, 2026],
    "X4": [2015, 2026],
    "X5": [2000, 2026],
    "X6": [2008, 2026],
    "X7": [2019, 2026],
    "Z4": [2003, 2026],
    "M2": [2016, 2026],
    "M3": [1990, 2026],
    "M4": [2014, 2026],
    "M5": [1990, 2026],
    "M6": [2006, 2018],
    "M8": [2020, 2026],
    "X3 M": [2020, 2026],
    "X4 M": [2020, 2026],
    "X5 M": [2010, 2026],
    "X6 M": [2010, 2026],
    "i3": [2014, 2021],
    "i4": [2022, 2026],
    "i5": [2024, 2026],
    "i7": [2023, 2026],
    "iX": [2022, 2026],
  },
  "Buick": {
    "Encore": [2013, 2023],
    "Encore GX": [2020, 2026],
    "Envision": [2016, 2026],
    "Envista": [2024, 2026],
    "Enclave": [2008, 2026],
    "LaCrosse": [2005, 2019],
    "Regal": [1990, 2020],
    "Verano": [2012, 2017],
  },
  "Cadillac": {
    "ATS": [2013, 2019],
    "CT4": [2020, 2026],
    "CT5": [2020, 2026],
    "CTS": [2003, 2019],
    "XTS": [2013, 2019],
    "XT4": [2019, 2026],
    "XT5": [2017, 2026],
    "XT6": [2020, 2026],
    "Escalade": [1999, 2026],
    "Escalade ESV": [2003, 2026],
    "CT4-V Blackwing": [2022, 2026],
    "CT5-V Blackwing": [2022, 2026],
    "Lyriq": [2023, 2026],
  },
  "Chevrolet": {
    "Spark": [2013, 2022],
    "Sonic": [2012, 2020],
    "Trax": [2013, 2026],
    "Trailblazer": [2021, 2026],
    "Equinox": [2005, 2026],
    "Malibu": [1997, 2024],
    "Blazer": [2019, 2026],
    "Traverse": [2009, 2026],
    "Tahoe": [1995, 2026],
    "Suburban": [1990, 2026],
    "Colorado": [2004, 2026],
    "Silverado 1500": [1999, 2026],
    "Silverado 2500HD": [2001, 2026],
    "Silverado 3500HD": [2001, 2026],
    "Express": [1996, 2026],
    "Camaro": [1990, 2024],
    "Camaro SS": [1990, 2024],
    "Camaro ZL1": [2012, 2024],
    "Corvette Stingray": [2014, 2026],
    "Corvette Z06": [2023, 2026],
    "Corvette ZR1": [2025, 2026],
    "Bolt EV": [2017, 2023],
    "Bolt EUV": [2022, 2023],
    "Blazer EV": [2024, 2026],
    "Silverado EV": [2024, 2026],
  },
  "Chrysler": {
    "200": [2011, 2017],
    "300": [2005, 2023],
    "300 SRT": [2005, 2014],
    "Pacifica": [2017, 2026],
    "Pacifica Hybrid": [2017, 2026],
    "Voyager": [1990, 2023],
    "Aspen": [2007, 2009],
  },
  "Dodge": {
    "Dart": [2013, 2016],
    "Neon": [1995, 2005],
    "Avenger": [2008, 2014],
    "Charger": [2006, 2023],
    "Charger R/T": [2006, 2023],
    "Charger Scat Pack": [2015, 2023],
    "Charger Hellcat": [2015, 2023],
    "Charger SRT 392": [2012, 2023],
    "Challenger": [2008, 2023],
    "Challenger R/T": [2008, 2023],
    "Challenger Scat Pack": [2015, 2023],
    "Challenger Hellcat": [2015, 2023],
    "Challenger Demon": [2018, 2023],
    "Durango": [1998, 2026],
    "Durango SRT": [2018, 2023],
    "Durango Hellcat": [2021, 2021],
    "Journey": [2009, 2020],
    "Grand Caravan": [1990, 2020],
    "Viper": [1992, 2017],
  },
  "Ford": {
    "Fiesta": [2011, 2019],
    "Focus": [2000, 2018],
    "Fusion": [2006, 2020],
    "Taurus": [1990, 2019],
    "Escape": [2001, 2026],
    "Edge": [2007, 2024],
    "Explorer": [1990, 2026],
    "Expedition": [1997, 2026],
    "Maverick": [2022, 2026],
    "Ranger": [1990, 2026],
    "F-150": [1990, 2026],
    "F-150 Raptor": [2010, 2026],
    "F-250 Super Duty": [1999, 2026],
    "F-350 Super Duty": [1999, 2026],
    "Bronco Sport": [2021, 2026],
    "Bronco": [2021, 2026],
    "EcoSport": [2018, 2022],
    "Mustang EcoBoost": [2015, 2026],
    "Mustang GT": [1990, 2026],
    "Mustang GT500": [2020, 2026],
    "Mustang Mach 1": [2021, 2023],
    "Mustang Dark Horse": [2024, 2026],
    "Mustang Mach-E": [2021, 2026],
    "F-150 Lightning": [2022, 2026],
    "Transit": [2015, 2026],
  },
  "GMC": {
    "Terrain": [2010, 2026],
    "Envoy": [1998, 2009],
    "Acadia": [2007, 2026],
    "Envista": [2024, 2026],
    "Canyon": [2004, 2026],
    "Sierra 1500": [1999, 2026],
    "Sierra 2500HD": [2001, 2026],
    "Sierra 3500HD": [2001, 2026],
    "Yukon": [1992, 2026],
    "Yukon XL": [2000, 2026],
    "Sierra Denali": [2000, 2026],
    "Yukon Denali": [2000, 2026],
    "Hummer EV": [2022, 2026],
  },
  "Honda": {
    "Fit": [2007, 2020],
    "HR-V": [2016, 2026],
    "Civic": [1990, 2026],
    "Accord": [1990, 2026],
    "Insight": [2000, 2022],
    "CR-V": [1997, 2026],
    "CR-V Hybrid": [2020, 2026],
    "Passport": [2019, 2026],
    "Pilot": [2003, 2026],
    "Ridgeline": [2006, 2026],
    "Odyssey": [1995, 2026],
    "Civic Type R": [2017, 2026],
    "Accord Hybrid": [2014, 2026],
    "Prologue EV": [2024, 2026],
  },
  "Hyundai": {
    "Accent": [1995, 2023],
    "Venue": [2020, 2026],
    "Elantra": [1991, 2026],
    "Elantra N": [2022, 2026],
    "Sonata": [1990, 2026],
    "Sonata Hybrid": [2011, 2026],
    "Tucson": [2005, 2026],
    "Tucson Hybrid": [2022, 2026],
    "Santa Fe": [2001, 2026],
    "Santa Fe Hybrid": [2022, 2026],
    "Palisade": [2020, 2026],
    "Kona": [2018, 2026],
    "Kona Electric": [2019, 2026],
    "Ioniq 5": [2022, 2026],
    "Ioniq 6": [2023, 2026],
    "Ioniq 9": [2026, 2026],
    "Veloster N": [2019, 2022],
    "Santa Cruz": [2022, 2026],
  },
  "Infiniti": {
    "G35 / G37": [2003, 2013],
    "Q50": [2014, 2026],
    "Q60": [2017, 2022],
    "Q70": [2014, 2019],
    "QX30": [2017, 2019],
    "QX50": [2014, 2026],
    "QX55": [2022, 2026],
    "QX60": [2013, 2026],
    "QX80": [2011, 2026],
    "Q50 Red Sport": [2016, 2026],
  },
  "Jeep": {
    "Renegade": [2015, 2026],
    "Compass": [2007, 2026],
    "Cherokee": [1990, 2023],
    "Grand Cherokee": [1993, 2026],
    "Grand Cherokee L": [2021, 2026],
    "Grand Cherokee 4xe": [2022, 2026],
    "Wrangler": [1990, 2026],
    "Wrangler 4xe": [2021, 2026],
    "Wrangler Rubicon": [2003, 2026],
    "Gladiator": [2020, 2026],
    "Grand Wagoneer": [2022, 2026],
    "Trackhawk": [2018, 2021],
    "Commander": [2006, 2010],
  },
  "Kia": {
    "Rio": [2001, 2026],
    "Soul": [2010, 2026],
    "Forte": [2010, 2026],
    "K5": [2021, 2026],
    "Stinger": [2018, 2023],
    "Stinger GT": [2018, 2023],
    "Seltos": [2021, 2026],
    "Sportage": [1995, 2026],
    "Sorento": [2003, 2026],
    "Sorento Hybrid": [2022, 2026],
    "Telluride": [2020, 2026],
    "Carnival": [2022, 2026],
    "Niro": [2017, 2026],
    "Niro EV": [2019, 2026],
    "EV6": [2022, 2026],
    "EV6 GT": [2023, 2026],
    "EV9": [2024, 2026],
  },
  "Lexus": {
    "CT 200h": [2011, 2020],
    "IS": [1999, 2026],
    "ES": [1990, 2026],
    "GS": [1993, 2020],
    "LS": [1990, 2026],
    "RC": [2015, 2026],
    "LC": [2018, 2026],
    "UX": [2019, 2026],
    "NX": [2015, 2026],
    "RX": [1998, 2026],
    "GX": [2003, 2026],
    "LX": [1996, 2026],
    "IS F": [2008, 2014],
    "RC F": [2015, 2026],
    "GS F": [2016, 2020],
    "LC F": [2022, 2026],
    "RZ EV": [2023, 2026],
  },
  "Lincoln": {
    "MKZ": [2007, 2020],
    "MKC": [2015, 2019],
    "MKX": [2007, 2018],
    "MKT": [2010, 2019],
    "Corsair": [2020, 2026],
    "Nautilus": [2019, 2026],
    "Aviator": [2020, 2026],
    "Aviator PHEV": [2020, 2026],
    "Navigator": [1998, 2026],
    "Navigator L": [2007, 2026],
    "Continental": [2017, 2020],
  },
  "Mazda": {
    "Mazda2": [2011, 2014],
    "Mazda3": [2004, 2026],
    "Mazda3 Turbo": [2021, 2026],
    "Mazda6": [2003, 2021],
    "CX-3": [2016, 2021],
    "CX-30": [2020, 2026],
    "CX-5": [2013, 2026],
    "CX-50": [2023, 2026],
    "CX-60": [2023, 2026],
    "CX-70": [2025, 2026],
    "CX-80": [2025, 2026],
    "CX-90": [2024, 2026],
    "CX-9": [2007, 2023],
    "MX-5 Miata": [1990, 2026],
    "MX-5 RF": [2017, 2026],
    "MX-30 EV": [2022, 2023],
  },
  "Mercedes-Benz": {
    "A-Class": [2019, 2023],
    "B-Class": [2014, 2023],
    "C-Class": [1994, 2026],
    "E-Class": [1994, 2026],
    "S-Class": [1990, 2026],
    "CLA": [2014, 2026],
    "CLS": [2006, 2023],
    "GLA": [2015, 2026],
    "GLB": [2020, 2026],
    "GLC": [2016, 2026],
    "GLE": [2016, 2026],
    "GLS": [2017, 2026],
    "G-Class": [1990, 2026],
    "SL": [1990, 2026],
    "SLC": [2017, 2020],
    "AMG C 63": [2008, 2026],
    "AMG E 63": [2007, 2026],
    "AMG S 63": [2007, 2026],
    "AMG GT": [2016, 2026],
    "AMG GT 63": [2019, 2026],
    "AMG G 63": [2013, 2026],
    "EQB": [2022, 2026],
    "EQC": [2020, 2022],
    "EQE": [2023, 2026],
    "EQS": [2022, 2026],
  },
  "Mitsubishi": {
    "Mirage": [2014, 2026],
    "Mirage G4": [2017, 2026],
    "Galant": [1990, 2012],
    "Lancer": [2002, 2017],
    "Eclipse Cross": [2018, 2026],
    "Eclipse Cross PHEV": [2023, 2026],
    "Outlander Sport": [2011, 2023],
    "Outlander": [2003, 2026],
    "Outlander PHEV": [2018, 2026],
    "Endeavor": [2004, 2011],
    "3000GT": [1990, 1999],
    "Lancer Evolution": [2003, 2015],
  },
  "Nissan": {
    "Versa": [2007, 2026],
    "Kicks": [2018, 2026],
    "Sentra": [1990, 2026],
    "Altima": [1993, 2026],
    "Maxima": [1990, 2023],
    "Rogue Sport": [2017, 2022],
    "Rogue": [2008, 2026],
    "Murano": [2003, 2026],
    "Pathfinder": [1990, 2026],
    "Armada": [2004, 2026],
    "Frontier": [1998, 2026],
    "Titan": [2004, 2026],
    "370Z": [2009, 2021],
    "400Z": [2023, 2026],
    "GT-R": [2009, 2023],
    "Leaf": [2011, 2026],
    "Ariya EV": [2023, 2026],
  },
  "RAM": {
    "ProMaster City": [2015, 2023],
    "ProMaster": [2014, 2026],
    "1500": [2009, 2026],
    "1500 Classic": [2019, 2023],
    "1500 TRX": [2021, 2024],
    "2500": [2010, 2026],
    "3500": [2010, 2026],
    "4500 / 5500": [2011, 2026],
  },
  "Subaru": {
    "Impreza": [1993, 2026],
    "Crosstrek": [2013, 2026],
    "Crosstrek Hybrid": [2019, 2026],
    "Legacy": [1990, 2025],
    "Outback": [1995, 2026],
    "Forester": [1998, 2026],
    "Ascent": [2019, 2026],
    "BRZ": [2013, 2026],
    "WRX": [2002, 2026],
    "WRX STI": [2004, 2021],
    "Solterra EV": [2023, 2026],
  },
  "Tesla": {
    "Model 3 RWD": [2017, 2026],
    "Model 3 Long Range": [2017, 2026],
    "Model 3 Performance": [2018, 2026],
    "Model Y RWD": [2020, 2026],
    "Model Y Long Range": [2020, 2026],
    "Model Y Performance": [2020, 2026],
    "Model S": [2012, 2026],
    "Model S Plaid": [2021, 2026],
    "Model X": [2015, 2026],
    "Model X Plaid": [2021, 2026],
    "Cybertruck": [2024, 2026],
    "Roadster": [2008, 2012],
  },
  "Toyota": {
    "Yaris": [2007, 2020],
    "Corolla": [1990, 2026],
    "Corolla Cross": [2022, 2026],
    "Corolla GR": [2023, 2026],
    "Camry": [1990, 2026],
    "Camry Hybrid": [2007, 2026],
    "Avalon": [1995, 2022],
    "Venza": [2021, 2026],
    "RAV4": [1996, 2026],
    "RAV4 Hybrid": [2016, 2026],
    "RAV4 Prime": [2021, 2026],
    "Highlander": [2001, 2026],
    "Highlander Hybrid": [2006, 2026],
    "4Runner": [1990, 2026],
    "Sequoia": [2001, 2026],
    "Sequoia Hybrid": [2023, 2026],
    "Tacoma": [1995, 2026],
    "Tundra": [2000, 2026],
    "Tundra Hybrid": [2022, 2026],
    "Sienna": [1998, 2026],
    "Land Cruiser": [1990, 2026],
    "GR86": [2022, 2026],
    "GR Corolla": [2023, 2026],
    "GR Supra": [2020, 2026],
    "Prius": [2001, 2026],
    "Prius Prime": [2017, 2026],
    "bZ4X EV": [2023, 2026],
    "Mirai (Hydrogen)": [2016, 2026],
  },
  "Volkswagen": {
    "Polo": [2018, 2026],
    "Jetta": [1990, 2026],
    "Jetta GLI": [1990, 2026],
    "Passat": [1990, 2022],
    "Arteon": [2019, 2023],
    "Golf": [1990, 2026],
    "GTI": [1990, 2026],
    "Golf R": [2004, 2026],
    "Taos": [2022, 2026],
    "Tiguan": [2009, 2026],
    "Atlas": [2018, 2026],
    "Atlas Cross Sport": [2020, 2026],
    "ID.4": [2021, 2026],
    "ID.Buzz": [2024, 2026],
  },
  "Volvo": {
    "S40": [2005, 2011],
    "S60": [2001, 2026],
    "S60 Recharge": [2020, 2026],
    "S90": [2017, 2024],
    "S90 Recharge": [2020, 2023],
    "V60": [2015, 2026],
    "V60 Cross Country": [2016, 2026],
    "V90": [2017, 2022],
    "V90 Cross Country": [2017, 2022],
    "XC40": [2018, 2026],
    "XC40 Recharge": [2021, 2026],
    "XC60": [2009, 2026],
    "XC60 Recharge": [2021, 2026],
    "XC90": [2003, 2026],
    "XC90 Recharge": [2021, 2026],
    "C40 Recharge": [2022, 2026],
    "Polestar 1": [2020, 2022],
    "Polestar 2": [2021, 2026],
  },
}; // { "Oil Change": "up" | "down" }

  const handleVote = async (e, repairName, direction) => {
    e.stopPropagation();
    if (votes[repairName]) return; // already voted
    setVotes(v => ({ ...v, [repairName]: direction }));
    await supabase.from("votes").insert({
      repair_name: repairName,
      vote:        direction,
      zip_code:    zip || null,
    });
  };

  // Community submission form state
  const [formRepair, setFormRepair]       = useState("");
  const [formVehicle, setFormVehicle]     = useState("");
  const [formAmount, setFormAmount]       = useState("");
  const [formZip, setFormZip]             = useState("");

  // Feedback form state
  const [feedbackText, setFeedbackText]   = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSent, setFeedbackSent]   = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const handleFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    setFeedbackError(null);
    const { error } = await supabase.from("feedback").insert({
      message: feedbackText.trim(),
      email:   feedbackEmail.trim() || null,
      page_context: make !== "Any Make" ? `${year !== "Any Year" ? year + " " : ""}${make}${model !== "Any Model" ? " " + model : ""}` : null,
    });
    setFeedbackSending(false);
    if (error) { setFeedbackError("Something went wrong. Please try again."); return; }
    setFeedbackSent(true);
    setFeedbackText("");
    setFeedbackEmail("");
  };

  const handleSubmission = async () => {
    if (!formRepair || !formAmount) return;
    setSubmitting(true);
    setSubmitError(null);
    // Parse vehicle string into make + year (best effort)
    const yearMatch = formVehicle.match(/\b(19|20)\d{2}\b/);
    const vehicleYear = yearMatch ? parseInt(yearMatch[0]) : null;
    const vehicleMake = formVehicle.replace(/\b(19|20)\d{2}\b/, "").trim() || null;
    const { error } = await supabase.from("submissions").insert({
      repair_name:  formRepair,
      vehicle_make: vehicleMake,
      vehicle_year: vehicleYear,
      zip_code:     formZip || zip || null,
      amount_paid:  parseFloat(formAmount),
      shop_type:    null,
      notes:        null,
    });
    setSubmitting(false);
    if (error) { setSubmitError("Something went wrong. Please try again."); return; }
    setSubmitted(true);
  };

  const region     = getRegion(zip);
  const makeMult   = makeMultipliers[make] || 1;
  const modelTierList = modelTiers[make] || [];
  const modelMult  = (modelTierList.find(([m]) => m === model) || [null, 1])[1];
  const trimList   = (trimData[make] && trimData[make][model]) || [];
  // Validate trim against year — reset to Any Trim if not available in selected year
  const trimValidForYear = trim === "Any Trim" || year === "Any Year" ||
    !(trimYears[make] && trimYears[make][model] && trimYears[make][model][trim]) ||
    (parseInt(year) >= trimYears[make][model][trim][0] && parseInt(year) <= trimYears[make][model][trim][1]);
  const effectiveTrim = trimValidForYear ? trim : "Any Trim";
  const trimMult   = (trimList.find(([t]) => t === effectiveTrim) || [null, 1])[1];
  // Validate year against model production range
  const modelYearRange = (make !== "Any Make" && model !== "Any Model" && modelYears[make]) ? modelYears[make][model] : null;
  const validYear = year === "Any Year" || !modelYearRange || (parseInt(year) >= modelYearRange[0] && parseInt(year) <= modelYearRange[1]) ? year : "Any Year";
  const yearMult   = getYearMult(validYear);
  const regMult    = region ? region.multiplier : 1;
  const baseMult   = makeMult * modelMult * regMult;
  const totalMult  = makeMult * modelMult * trimMult * regMult;
  // adj applies trim multiplier only for trim-sensitive repairs
  // adj applies year multiplier only for year-sensitive repairs
  const adj = (v, data, repairName) => {
    let mult = data?.trimSensitive ? totalMult : baseMult;
    if (repairName && yearSensitiveRepairs.has(repairName)) mult *= yearMult;
    return Math.round(v * mult);
  };

  const handleZip = e => {
    e.preventDefault();
    if (/^\d{5}$/.test(zipInput)) { setZip(zipInput); setShops([]); setSelectedRepair(null); }
  };

  const handleCard = async name => {
    if (selectedRepair === name) { setSelectedRepair(null); setShops([]); return; }
    setSelectedRepair(name);
    if (zip.length === 5) {
      setLoadingShops(true);
      try {
        const res = await fetch(`/api/shops?zip=${zip}&repair=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          setShops(data.length > 0 ? data : getMockShops(zip, name));
        } else {
          setShops(getMockShops(zip, name));
        }
      } catch {
        setShops(getMockShops(zip, name));
      }
      setLoadingShops(false);
    }
  };

  const openTierPicker = (e, name) => {
    e.stopPropagation();
    if (basket.has(name)) {
      // Already in basket — remove it
      setBasket(prev => { const next = new Map(prev); next.delete(name); return next; });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setTierPicker({ name, top: rect.bottom + window.scrollY + 6, right: window.innerWidth - rect.right });
  };

  const pickTier = (repairName, tierName) => {
    setBasket(prev => { const next = new Map(prev); next.set(repairName, tierName); return next; });
    setTierPicker(null);
  };

  const removeFromBasket = (e, name) => {
    e.stopPropagation();
    setBasket(prev => { const next = new Map(prev); next.delete(name); return next; });
  };

  const basketTotal = () => {
    let low = 0, high = 0;
    basket.forEach((tierName, name) => {
      const d = repairData[name];
      if (!d) return;
      const tier = d.costs[tierName];
      if (!tier) return;
      low  += adj(tier.low,  d, name);
      high += adj(tier.high, d, name);
    });
    return { low, high };
  };

  const buildShareURL = (opts = {}) => {
    const p = new URLSearchParams();
    const m = opts.make  ?? make;
    const mo = opts.model ?? model;
    const tr = opts.trim  ?? trim;
    const yr = opts.year  ?? year;
    const z  = opts.zip   ?? zip;
    if (m  !== "Any Make")  p.set("make",  m);
    if (mo !== "Any Model") p.set("model", mo);
    if (tr !== "Any Trim")  p.set("trim",  tr);
    if (yr !== "Any Year")  p.set("year",  yr);
    if (z)                  p.set("zip",   z);
    if (opts.repair)        p.set("repair", opts.repair);
    if (opts.basket && opts.basket.size > 0) {
      const encoded = Array.from(opts.basket.entries())
        .map(([n, t]) => `${encodeURIComponent(n)}:${encodeURIComponent(t)}`)
        .join(",");
      p.set("repairs", encoded);
    }
    const base = window.location.origin + window.location.pathname;
    return p.toString() ? `${base}?${p.toString()}` : base;
  };

  const handleShare = async (url, title = "RepairIQ Estimate") => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: "Check out this repair cost estimate", url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handlePrint = (html) => {
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) { alert("Please allow popups for repairiqhq.com to print."); return; }
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>RepairIQ Estimate</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; background: white; padding: 32px; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #666; margin-bottom: 24px; }
    .item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eee; gap: 16px; }
    .item-name { font-size: 15px; font-weight: 500; }
    .item-tier { font-size: 11px; color: #888; margin-top: 2px; }
    .item-cost { font-size: 15px; font-weight: 600; color: #b8860b; white-space: nowrap; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 8px; }
    .total-label { font-size: 16px; font-weight: 600; }
    .total-cost { font-size: 24px; font-weight: 300; color: #b8860b; }
    .footer { font-size: 11px; color: #aaa; margin-top: 8px; }
    .logo { font-size: 13px; color: #aaa; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  ${html}
  <div class="logo">Generated by RepairIQ · repairiqhq.com</div>
</body>
</html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  const buildPrintHTML = ({ title, subtitle, items, totalLow, totalHigh, footerNote }) => {
    const rows = items.map(({ name, tierName, low, high }) => `
      <div class="item">
        <div><div class="item-name">${name}</div><div class="item-tier">${tierName}</div></div>
        <div class="item-cost">$${low.toLocaleString()} – $${high.toLocaleString()}</div>
      </div>`).join("");
    return `
      <h1>${title}</h1>
      <div class="subtitle">${subtitle}</div>
      ${rows}
      <div class="total-row">
        <div class="total-label">Total Estimate</div>
        <div class="total-cost">$${totalLow.toLocaleString()} – $${totalHigh.toLocaleString()}</div>
      </div>
      <div class="footer">${footerNote}</div>`;
  };

  const isEV = make === "Tesla" || (model !== "Any Model" && evModels.has(model));

  const filtered = useMemo(() =>
    Object.entries(repairData).filter(([n, d]) => {
      if (!n.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "All" && d.category !== category) return false;
      if (isEV && d.iceOnly) return false;
      if (!isEV && d.evOnly) return false;
      return true;
    }), [search, category, isEV]);

  // Cross-reference known issues to repair cards for cost lookup
  const issueToRepair = {
    "head gasket": "Head Gasket",
    "timing chain": "Timing Chain",
    "timing belt": "Timing Belt",
    "water pump": "Water Pump",
    "valve cover": "Valve Cover Gasket",
    "oil consumption": "Oil Change",
    "transmission": "Transmission Fluid",
    "cvt": "Transmission Fluid",
    "spark plug": "Spark Plugs",
    "alternator": "Alternator",
    "starter": "Starter Motor",
    "oxygen sensor": "Oxygen Sensor",
    "ignition coil": "Ignition Coil",
    "ac compressor": "AC Compressor",
    "air suspension": "Shock Absorbers (pair)",
    "strut": "Strut Assembly (pair)",
    "shock": "Shock Absorbers (pair)",
    "ball joint": "Ball Joint",
    "control arm": "Ball Joint",
    "tie rod": "Tie Rod End",
    "sway bar": "Sway Bar Links",
    "brake": "Brake Pads (Front)",
    "battery": isEV ? "EV: HV Battery Diagnostic" : "Battery Replacement",
    "catalytic": "Catalytic Converter",
    "wheel bearing": "Wheel Bearing / Hub Assembly",
    "hub assembly": "Wheel Bearing / Hub Assembly",
    "fuel pump": "Fuel Pump Replacement",
    "serpentine": "Serpentine Belt",
    "windshield": "Windshield Replacement",
    "radiator": "Radiator Replacement",
    "rack and pinion": "Power Steering Rack (Rack & Pinion)",
    "control arm": "Control Arm Replacement",
    "transmission": "Transmission Rebuild / Replacement",
    "charge port": "EV: Charging Port Repair",
    "charging port": "EV: Charging Port Repair",
    "12v battery": "EV: 12V Battery",
    "drive unit": "EV: Drive Motor / Inverter",
    "coolant": "Coolant Flush",
    "thermostat": "Thermostat Replacement",
    "cv axle": "CV Axle/Halfshaft",
    "differential": "Differential Fluid",
    "maf sensor": "Mass Air Flow Sensor",
    "blend door": "Blend Door Actuator",
  };

  const getLinkedRepair = (issueText) => {
    const lower = issueText.toLowerCase();
    for (const [keyword, repairName] of Object.entries(issueToRepair)) {
      if (lower.includes(keyword)) return repairName;
    }
    return null;
  };

  const getYearIssues = () => {
    if (!knownIssues[make] || !knownIssues[make][model]) return [];
    return knownIssues[make][model].filter(item => {
      // Filter by year
      if (year !== "Any Year") {
        const match = item.years.match(/(\d{4})[–\-](\d{4})/);
        if (match) {
          const yr = parseInt(year);
          if (yr < parseInt(match[1]) || yr > parseInt(match[2])) return false;
        }
      }
      // Filter by trim — if issue has trims array, only show if selected trim matches
      if (item.trims && trim !== "Any Trim") {
        return item.trims.some(t => trim.includes(t) || t.includes(trim));
      }
      return true;
    });
  };

  const yearIssues = getYearIssues();
  const highCount  = yearIssues.filter(i => i.severity === "High").length;
  const medCount   = yearIssues.filter(i => i.severity === "Medium").length;
  const riskScore  = highCount * 3 + medCount * 1;
  const riskLabel  = riskScore === 0 ? "Low Risk" : riskScore <= 2 ? "Moderate Risk" : riskScore <= 5 ? "Elevated Risk" : "High Risk";
  const riskColor  = riskScore === 0 ? "#22c55e" : riskScore <= 2 ? "#f59e0b" : riskScore <= 5 ? "#f97316" : "#ef4444";

  return (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:"#0f0f0f", minHeight:"100vh", color:"#f0ede6" }}>



      {/* Header */}
      <header style={{ maxWidth:"900px", margin:"0 auto", padding:"40px 24px 28px", borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"6px" }}>Repair Cost Intelligence</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <h1 style={{ fontSize:"clamp(36px,6vw,56px)", fontWeight:"400", margin:"0 0 8px", lineHeight:1, letterSpacing:"-0.02em" }}>
              Repair<span style={{ color:"#c9a84c", fontStyle:"italic" }}>IQ</span>
            </h1>
            <p style={{ color:"#555", fontSize:"14px", margin:0, fontStyle:"italic" }}>Real-world cost ranges — adjusted for your location &amp; vehicle.</p>
          </div>
          <div style={{ display:"flex", gap:"4px", background:"#111", border:"1px solid #1e1e1e", borderRadius:"8px", padding:"4px" }}>
            <button onClick={() => setAppMode("costs")} style={{ padding:"8px 16px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"500", background: appMode === "costs" ? "#c9a84c" : "transparent", color: appMode === "costs" ? "#0f0f0f" : "#666", transition:"all 0.15s" }}>
              💰 Repair Costs
            </button>
            <button onClick={() => setAppMode("buyside")} style={{ padding:"8px 16px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"500", background: appMode === "buyside" ? "#c9a84c" : "transparent", color: appMode === "buyside" ? "#0f0f0f" : "#666", transition:"all 0.15s" }}>
              🔍 Before You Buy
            </button>
          </div>
        </div>
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

        {/* Search + Make + Model + Trim + Year + Category */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto auto auto", gap:"10px" }}>
          <input placeholder="Search repairs…" value={search} onChange={e => setSearch(e.target.value)} style={IS} />
          <select value={make} onChange={e => { setMake(e.target.value); setModel("Any Model"); setTrim("Any Trim"); setYear("Any Year"); }} style={IS}>
            {makes.map(m => <option key={m}>{m}</option>)}
          </select>
          {make !== "Any Make" && modelTiers[make] && (
            <select value={model} onChange={e => { setModel(e.target.value); setTrim("Any Trim"); setYear("Any Year"); }} style={IS}>
              {modelTiers[make].map(([m]) => <option key={m}>{m}</option>)}
            </select>
          )}
          {make !== "Any Make" && model !== "Any Model" && trimData[make] && trimData[make][model] && (
            <select value={trim} onChange={e => setTrim(e.target.value)} style={IS}>
            {(() => {
                const yr = year === "Any Year" ? null : parseInt(year);
                const allTrims = trimData[make][model];
                const filtered = allTrims.filter(([t]) => {
                  if (t === "Any Trim") return true;
                  if (!yr) return true;
                  if (trimYears[make] && trimYears[make][model] && trimYears[make][model][t]) {
                    const [start, end] = trimYears[make][model][t];
                    return yr >= start && yr <= end;
                  }
                  return true; // no trimYears data = always show
                });
                // If filtering removed everything except Any Trim, show all trims instead
                const toShow = filtered.length <= 1 ? allTrims : filtered;
                return toShow.map(([t]) => <option key={t}>{t}</option>);
              })()}
            </select>
          )}
          <select value={year} onChange={e => setYear(e.target.value)} style={IS}>
            {yearRanges.filter(r => {
              if (r.label === "Any Year") return true;
              const yr = parseInt(r.label);
              if (make !== "Any Make" && model !== "Any Model" && modelYears[make] && modelYears[make][model]) {
                const [start, end] = modelYears[make][model];
                return yr >= start && yr <= end;
              }
              return yr >= 1990;
            }).map(r => <option key={r.label}>{r.label}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} style={IS}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Combined modifier callout */}
        {(make !== "Any Make" || zip || year !== "Any Year") && (
          <div style={{ marginTop:"10px", background:"#1a1a0a", border:"1px solid #3a3010", borderRadius:"6px", padding:"9px 14px", fontSize:"12px", color:"#c9a84c" }}>
            📊 Estimates adjusted for{make !== "Any Make" ? ` ${make}${model !== "Any Model" ? ` ${model}` : ""}${effectiveTrim !== "Any Trim" ? ` ${effectiveTrim}` : ""}` : ""}${year !== "Any Year" ? ` ${year}` : ""}{zip && region ? ` + ${region.name.split(",")[0]} labor rates` : ""} — base modifier: {totalMult>1?"+":""}{Math.round((totalMult-1)*100)}%{year !== "Any Year" && yearMult !== 1 ? `, year: +${Math.round((yearMult-1)*100)}% on applicable repairs` : ""}
          </div>
        )}
      </div>

      {/* Known Issues Section — costs mode only */}
      {appMode === "costs" && make !== "Any Make" && model !== "Any Model" && knownIssues[make] && knownIssues[make][model] && (
        <section style={{ maxWidth:"900px", margin:"20px auto 0", padding:"0 24px" }}>
          <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
              <span style={{ fontSize:"18px" }}>⚠️</span>
              <h2 style={{ margin:0, fontSize:"15px", fontWeight:"600", letterSpacing:"-0.01em" }}>
                Known Issues — {make} {model}
              </h2>
              <span style={{ fontSize:"11px", color:"#555", marginLeft:"auto" }}>
                Sources: RepairPal · CarComplaints · NHTSA
              </span>
            </div>
            <div style={{ display:"grid", gap:"10px" }}>
              {knownIssues[make][model].map((item, i) => {
                const severityColor = item.severity === "High" ? "#ef4444" : item.severity === "Medium" ? "#f59e0b" : "#22c55e";
                const severityBg = item.severity === "High" ? "#ef444418" : item.severity === "Medium" ? "#f59e0b18" : "#22c55e18";
                return (
                  <div key={i} style={{ display:"flex", gap:"12px", padding:"12px", background:"#0e0e0e", borderRadius:"8px", border:"1px solid #1a1a1a" }}>
                    <div style={{ flexShrink:0, marginTop:"2px" }}>
                      <span style={{ display:"inline-block", width:"8px", height:"8px", borderRadius:"50%", background:severityColor, marginTop:"4px" }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"13px", lineHeight:"1.5", color:"#ccc" }}>{item.issue}</div>
                      <div style={{ display:"flex", gap:"8px", marginTop:"6px", flexWrap:"wrap" }}>
                        <span style={{ fontSize:"11px", color:"#777" }}>📅 {item.years}</span>
                        <span style={{ fontSize:"11px", padding:"1px 7px", borderRadius:"20px", background:severityBg, color:severityColor }}>{item.severity} severity</span>
                        <span style={{ fontSize:"11px", color:"#555" }}>{item.source}</span>
                        {item.trims && <span style={{ fontSize:"11px", color:"#3b82f6", background:"#3b82f618", padding:"1px 7px", borderRadius:"20px" }}>⚙️ {item.trims.slice(0,3).join(", ")}{item.trims.length > 3 ? "…" : ""} only</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── REPAIR COSTS MODE ─────────────────────────────────────────────── */}
      {appMode === "costs" && (
      <main style={{ maxWidth:"900px", margin:"20px auto", padding:`0 24px ${basket.size > 0 ? "100px" : "20px"}`, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"14px", alignItems:"start" }}>
        {filtered.map(([name, data]) => {
          const tiers     = Object.entries(data.costs);
          const loLow     = adj(Math.min(...tiers.map(([,v]) => v.low)), data, name);
          const hiHigh    = adj(Math.max(...tiers.map(([,v]) => v.high)), data, name);
          const cc        = catColor(data.category);
          const isSel     = selectedRepair === name;

          return (
            <div key={name} onClick={() => handleCard(name)} style={{ background:"#161616", border:`1px solid ${isSel?"#c9a84c44":"#1e1e1e"}`, borderRadius:"10px", padding:"20px", cursor:"pointer", transition:"border-color 0.2s", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:cc, opacity:0.7 }} />

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                <div>
                  <div style={{ marginBottom:"4px" }}><RepairIcon icon={data.icon} size={20} /></div>
                  <div style={{ fontWeight:"600", fontSize:"15px", letterSpacing:"-0.01em" }}>{name}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" }}>
                  <span style={{ fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cc, background:`${cc}18`, padding:"3px 8px", borderRadius:"20px", whiteSpace:"nowrap" }}>{data.category}</span>
                  <button
                    onClick={e => openTierPicker(e, name)}
                    title={basket.has(name) ? "Remove from estimate" : "Add to estimate"}
                    style={{ background: basket.has(name) ? "#c9a84c" : "#1e1e1e", border:`1px solid ${basket.has(name) ? "#c9a84c" : "#2a2a2a"}`, borderRadius:"6px", width:"24px", height:"24px", cursor:"pointer", color: basket.has(name) ? "#0f0f0f" : "#555", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, fontFamily:"inherit", flexShrink:0 }}>
                    {basket.has(name) ? "✓" : "+"}
                  </button>
                </div>
              </div>

              <div style={{ fontSize:"22px", fontWeight:"300", letterSpacing:"-0.02em", marginBottom:"4px" }}>
                ${loLow.toLocaleString()} – ${hiHigh.toLocaleString()}
              </div>
              <div style={{ fontSize:"12px", color:"#444", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>⏱ {data.labor}</span>
                <span style={{ fontSize:"10px", color:"#555", letterSpacing:"0.04em" }}>parts + labor</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"#333", fontStyle:"italic" }}>
            No repairs found for "{search}"
          </div>
        )}
      </main>

      )} {/* end costs mode */}

      {/* ── TIER PICKER POPOVER ───────────────────────────────────────────── */}
      {tierPicker && repairData[tierPicker.name] && (
        <TierPickerPopover
          tierPicker={tierPicker}
          data={repairData[tierPicker.name]}
          adj={adj}
          onClose={() => setTierPicker(null)}
          onPick={pickTier}
        />
      )}

      {/* ── BASKET BAR ────────────────────────────────────────────────────── */}
      {basket.size > 0 && (() => {
        const { low, high } = basketTotal();
        return (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:900, background:"#111", borderTop:"1px solid #2a2a2a", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", backdropFilter:"blur(8px)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
              <div style={{ background:"#c9a84c", color:"#0f0f0f", borderRadius:"20px", padding:"2px 10px", fontSize:"12px", fontWeight:"700" }}>
                {basket.size} repair{basket.size > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize:"20px", fontWeight:"300", letterSpacing:"-0.02em" }}>
                ${low.toLocaleString()} – ${high.toLocaleString()}
              </div>
              <div style={{ fontSize:"11px", color:"#444" }}>combined estimate</div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => setBasket(new Map())} style={{ background:"transparent", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"8px 14px", fontSize:"12px", color:"#555", cursor:"pointer", fontFamily:"inherit" }}>
                Clear
              </button>
              <button onClick={() => setShowBasket(true)} style={{ background:"#c9a84c", border:"none", borderRadius:"6px", padding:"8px 18px", fontSize:"12px", fontWeight:"700", color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                View Estimate →
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── BASKET MODAL ──────────────────────────────────────────────────── */}
      {showBasket && (
        <BasketModal
          basket={basket}
          repairData={repairData}
          adj={adj}
          catColor={catColor}
          make={make}
          model={model}
          year={year}
          zip={zip}
          onClose={() => setShowBasket(false)}
          onRemove={removeFromBasket}
          onClear={() => { setBasket(new Map()); setShowBasket(false); }}
          RepairIcon={RepairIcon}
          shareURL={buildShareURL({ basket })}
          handleShare={handleShare}
          handlePrint={handlePrint}
          buildPrintHTML={buildPrintHTML}
        />
      )}

      {/* ── REPAIR DETAIL MODAL ───────────────────────────────────────────── */}
      {selectedRepair && repairData[selectedRepair] && (
        <ModalContent
          name={selectedRepair}
          data={repairData[selectedRepair]}
          onClose={() => { setSelectedRepair(null); setShops([]); }}
          adj={adj}
          catColor={catColor}
          zip={zip}
          loadingShops={loadingShops}
          shops={shops}
          votes={votes}
          handleVote={handleVote}
          Stars={Stars}
          shareURL={buildShareURL({ repair: selectedRepair })}
          handleShare={handleShare}
          handlePrint={handlePrint}
          buildPrintHTML={buildPrintHTML}
        />
      )}

      {/* ── BEFORE YOU BUY MODE ───────────────────────────────────────────── */}
      {appMode === "buyside" && (
        <section style={{ maxWidth:"900px", margin:"20px auto", padding:"0 24px" }}>
          {make === "Any Make" || model === "Any Model" ? (
            <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"48px 24px", textAlign:"center" }}>
              <div style={{ fontSize:"40px", marginBottom:"16px" }}>🔍</div>
              <div style={{ fontSize:"18px", fontWeight:"400", marginBottom:"8px", letterSpacing:"-0.01em" }}>Select a Make &amp; Model to Begin</div>
              <div style={{ color:"#555", fontSize:"13px", fontStyle:"italic" }}>Choose a vehicle above to see known issues, risk profile, and what to inspect before buying.</div>
            </div>
          ) : (
            <div style={{ display:"grid", gap:"16px" }}>

              {/* Risk Summary Card */}
              <div style={{ background:"#161616", border:`1px solid ${riskColor}33`, borderRadius:"10px", padding:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
                  <div>
                    <div style={{ fontSize:"11px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#555", marginBottom:"6px" }}>Pre-Purchase Risk Assessment</div>
                    <div style={{ fontSize:"22px", fontWeight:"400", letterSpacing:"-0.02em" }}>
                      {make} {model}{year !== "Any Year" ? ` — ${year}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"24px", fontWeight:"600", color:riskColor }}>{riskLabel}</div>
                    <div style={{ fontSize:"12px", color:"#555", marginTop:"2px" }}>
                      {yearIssues.length === 0 ? "No documented issues" : `${yearIssues.length} known issue${yearIssues.length !== 1 ? "s" : ""} · ${highCount} high severity`}
                    </div>
                  </div>
                </div>
                {yearIssues.length > 0 && (
                  <div style={{ marginTop:"16px", display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {highCount > 0 && <span style={{ fontSize:"12px", padding:"3px 10px", borderRadius:"20px", background:"#ef444418", color:"#ef4444" }}>⚠️ {highCount} High Severity</span>}
                    {medCount > 0 && <span style={{ fontSize:"12px", padding:"3px 10px", borderRadius:"20px", background:"#f59e0b18", color:"#f59e0b" }}>⚡ {medCount} Medium Severity</span>}
                    {yearIssues.filter(i => i.severity === "Low").length > 0 && <span style={{ fontSize:"12px", padding:"3px 10px", borderRadius:"20px", background:"#22c55e18", color:"#22c55e" }}>ℹ️ {yearIssues.filter(i => i.severity === "Low").length} Low Severity</span>}
                    {year === "Any Year" && <span style={{ fontSize:"12px", color:"#555", fontStyle:"italic" }}>Select a year to filter issues by model year</span>}
                  </div>
                )}
              </div>

              {/* Known Issues with Cost Links */}
              {yearIssues.length > 0 ? (
                <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"24px" }}>
                  <div style={{ fontSize:"11px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"16px" }}>Known Issues &amp; Repair Costs</div>
                  <div style={{ display:"grid", gap:"12px" }}>
                    {yearIssues.map((item, i) => {
                      const severityColor = item.severity === "High" ? "#ef4444" : item.severity === "Medium" ? "#f59e0b" : "#22c55e";
                      const severityBg    = item.severity === "High" ? "#ef444418" : item.severity === "Medium" ? "#f59e0b18" : "#22c55e18";
                      const linked        = getLinkedRepair(item.issue);
                      const repData       = linked ? repairData[linked] : null;
                      const costLow       = repData ? adj(Math.min(...Object.values(repData.costs).map(v => v.low)), repData, linked) : null;
                      const costHigh      = repData ? adj(Math.max(...Object.values(repData.costs).map(v => v.high)), repData, linked) : null;
                      return (
                        <div key={i} style={{ padding:"16px", background:"#0e0e0e", borderRadius:"8px", border:`1px solid ${severityColor}22` }}>
                          <div style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                            <span style={{ display:"inline-block", width:"8px", height:"8px", borderRadius:"50%", background:severityColor, flexShrink:0, marginTop:"5px" }} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:"13px", lineHeight:"1.5", color:"#ccc", marginBottom:"8px" }}>{item.issue}</div>
                              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
                                <span style={{ fontSize:"11px", color:"#777" }}>📅 {item.years}</span>
                                <span style={{ fontSize:"11px", padding:"1px 7px", borderRadius:"20px", background:severityBg, color:severityColor }}>{item.severity}</span>
                                <span style={{ fontSize:"11px", color:"#555" }}>{item.source}</span>
                                {item.trims && <span style={{ fontSize:"11px", color:"#3b82f6", background:"#3b82f618", padding:"1px 7px", borderRadius:"20px" }}>⚙️ {item.trims.slice(0,3).join(", ")}{item.trims.length > 3 ? "…" : ""} only</span>}
                                {costLow && (
                                  <span style={{ fontSize:"12px", color:"#c9a84c", marginLeft:"auto", fontWeight:"500" }}>
                                    Est. repair: ${costLow.toLocaleString()}–${costHigh.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"24px", textAlign:"center" }}>
                  <div style={{ fontSize:"24px", marginBottom:"8px" }}>✅</div>
                  <div style={{ fontSize:"15px", color:"#ccc" }}>No documented issues{year !== "Any Year" ? ` for the ${year} model year` : ""}</div>
                  <div style={{ fontSize:"13px", color:"#555", marginTop:"4px", fontStyle:"italic" }}>This doesn't guarantee a problem-free vehicle — always get a pre-purchase inspection.</div>
                </div>
              )}

              {/* Inspection Checklist */}
              {(() => {
                const vehicleWarnings = yearIssues.filter(i => i.severity === "High").map(issue => {
                  const lower = issue.issue.toLowerCase();
                  if (lower.includes("head gasket") || lower.includes("coolant"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — check for white exhaust smoke, milky oil on dipstick, coolant loss`, severity:"High" };
                  if (lower.includes("timing chain") || lower.includes("timing belt"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — listen for metallic rattle on cold start, ask for service records`, severity:"High" };
                  if (lower.includes("engine") || lower.includes("oil consumption") || lower.includes("lifter") || lower.includes("bearing"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — check oil level and color, listen for knocking or ticking`, severity:"High" };
                  if (lower.includes("transmission") || lower.includes("cvt") || lower.includes("gearbox"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — test all gears, feel for slipping or shudder`, severity:"High" };
                  if (lower.includes("air suspension"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — park on flat surface and inspect all four corners for level ride height`, severity:"High" };
                  if (lower.includes("turbo"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — listen for whining or lag, check for oil smoke on hard acceleration`, severity:"High" };
                  if (lower.includes("rust") || lower.includes("frame"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — inspect frame, underbody, and wheel wells carefully`, severity:"High" };
                  if (lower.includes("brake"))
                    return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — test brakes hard from 40mph, feel for pulsation or pulling`, severity:"High" };
                  if (lower.includes("recall"))
                    return { text: `⚠️ Known recall: ${issue.issue.split("—")[0].trim()} — verify recall was completed via NHTSA.gov VIN lookup`, severity:"High" };
                  return { text: `⚠️ Known issue: ${issue.issue.split("—")[0].trim()} — verify with a pre-purchase inspection`, severity:"High" };
                }).filter(Boolean);

                const sections = [
                  {
                    title: "Engine & Fluids",
                    icon: "🛢️",
                    items: [
                      "Check oil level and color — should be amber/brown, not black, milky, or low",
                      "Check coolant level and color — should be green/orange, not rusty or milky",
                      "Check transmission fluid — should be red/pink, not brown or burnt-smelling",
                      "Inspect brake fluid reservoir — should be clear to light yellow",
                      "Start cold — listen for knocking, ticking, or rattling that fades after warmup",
                      "Check for white smoke from exhaust (coolant leak) or blue smoke (oil burning)",
                      "Look for oil leaks under the vehicle and on engine block surfaces",
                      "Check for coolant leaks around hoses, radiator, and water pump",
                    ]
                  },
                  {
                    title: "Transmission & Drivetrain",
                    icon: "⚙️",
                    items: [
                      "Test all gears — feel for hesitation, slipping, hard shifts, or shuddering",
                      "On CVT vehicles: feel for judder or surging from a stop, especially when warm",
                      "Test 4WD / AWD engagement if equipped — no grinding or hesitation",
                      "Listen for clunking or vibration under load and when coasting in gear",
                      "Check for differential or axle fluid leaks on AWD/4WD vehicles",
                    ]
                  },
                  {
                    title: "Brakes & Suspension",
                    icon: "🛑",
                    items: [
                      "Test brakes firmly from 40mph — no pulsation, pulling, or grinding",
                      "Check brake pedal feel — should be firm, not spongy or sinking to the floor",
                      "Bounce each corner of the vehicle — shocks/struts should dampen in 1–2 cycles",
                      "Listen for clunking over speed bumps and turning at low speed (ball joints, tie rods)",
                      "Check steering for excessive play or pulling to one side",
                      "Inspect tires for uneven wear — indicates alignment or suspension issues",
                      "Check tire tread depth and look for sidewall cracking",
                    ]
                  },
                  {
                    title: "Body & Exterior",
                    icon: "🪟",
                    items: [
                      "Check for rust on frame, underbody, wheel wells, and rocker panels",
                      "Inspect body panel gaps — inconsistent gaps suggest prior collision repair",
                      "Check paint for overspray on rubber trim — sign of repainted panels",
                      "Look for water stains on headliner and carpet (flood damage)",
                      "Test all windows — up, down, and ensure seals are tight",
                      "Check all exterior lights — headlights, taillights, turn signals, reverse",
                      "Inspect windshield for cracks, chips, or delamination",
                    ]
                  },
                  {
                    title: "Interior & Electronics",
                    icon: "🖥️",
                    items: [
                      "Test infotainment, Bluetooth, backup camera, and navigation",
                      "Test all power features — seats, mirrors, locks, sunroof",
                      "Check AC and heat — full temperature range and all fan speeds",
                      "Verify no warning lights are illuminated on the dashboard",
                      "Plug in an OBD-II scanner — check for stored fault codes (P, B, U, C codes)",
                      "Test horn, wipers, and all interior lighting",
                    ]
                  },
                  {
                    title: "Documents & History",
                    icon: "📋",
                    items: [
                      "Run a VIN report (Carfax or AutoCheck) — check for accidents, title brands, and odometer rollbacks",
                      "Verify all recalls are completed at NHTSA.gov/recalls using the VIN",
                      "Ask for service records — look for consistent oil change and maintenance history",
                      "Confirm title is clean — no salvage, flood, lemon law, or rebuilt brands",
                      "Check that VIN on dashboard, door jamb, and title all match",
                      "Have an independent mechanic perform a full pre-purchase inspection ($100–$200) — worth every penny",
                    ]
                  },
                ];

                const [checked, setChecked] = useState({});
                const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
                const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0) + vehicleWarnings.length;
                const checkedCount = Object.values(checked).filter(Boolean).length;

                return (
                  <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
                      <div style={{ fontSize:"11px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c" }}>
                        Pre-Purchase Inspection Checklist
                      </div>
                      <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                        <span style={{ fontSize:"12px", color:"#555" }}>{checkedCount}/{totalItems} checked</span>
                        <button onClick={() => {
                          const html = `
                            <h1>Pre-Purchase Checklist — ${make} ${model}${year !== "Any Year" ? " " + year : ""}</h1>
                            <p style="color:#666;margin-bottom:24px">${zip ? "ZIP " + zip + " · " : ""}Generated by RepairIQ</p>
                            ${vehicleWarnings.length > 0 ? `<h2 style="color:#c0392b;margin-bottom:8px">⚠️ Vehicle-Specific Warnings</h2>${vehicleWarnings.map(w => `<p style="margin:6px 0;padding:8px;background:#fff3f3;border-left:3px solid #c0392b">${w.text}</p>`).join("")}` : ""}
                            ${sections.map(sec => `
                              <h2 style="margin-top:20px;margin-bottom:8px">${sec.icon} ${sec.title}</h2>
                              ${sec.items.map(item => `<p style="margin:4px 0;padding:4px 0;border-bottom:1px solid #eee">☐ ${item}</p>`).join("")}
                            `).join("")}
                          `;
                          const w = window.open("", "_blank", "width=800,height=600");
                          if (!w) return;
                          w.document.write(`<!DOCTYPE html><html><head><title>Pre-Purchase Checklist</title><style>body{font-family:system-ui,sans-serif;padding:32px;max-width:700px;margin:0 auto;color:#111}h1{font-size:20px;margin-bottom:4px}h2{font-size:14px;font-weight:600;margin-top:20px}p{font-size:13px;line-height:1.6}@media print{body{padding:16px}}</style></head><body>${html}<p style="margin-top:32px;color:#aaa;font-size:11px;border-top:1px solid #eee;padding-top:12px">RepairIQ · repairiqhq.com</p></body></html>`);
                          w.document.close();
                          w.focus();
                          setTimeout(() => { w.print(); w.close(); }, 400);
                        }} style={{ background:"transparent", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"5px 12px", fontSize:"11px", color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
                          🖨️ Print
                        </button>
                      </div>
                    </div>

                    {/* Vehicle-specific warnings */}
                    {vehicleWarnings.length > 0 && (
                      <div style={{ marginBottom:"20px" }}>
                        <div style={{ fontSize:"11px", color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" }}>Vehicle-Specific Warnings</div>
                        {vehicleWarnings.map((w, i) => {
                          const key = `warn-${i}`;
                          return (
                            <div key={key} onClick={() => toggleCheck(key)} style={{ display:"flex", gap:"10px", padding:"10px 12px", background: checked[key] ? "#0a1a0a" : "#1a0a0a", borderRadius:"6px", marginBottom:"6px", border:`1px solid ${checked[key] ? "#22c55e33" : "#ef444433"}`, cursor:"pointer", transition:"all 0.15s" }}>
                              <span style={{ fontSize:"16px", flexShrink:0, marginTop:"1px" }}>{checked[key] ? "✅" : "☐"}</span>
                              <span style={{ fontSize:"12px", color: checked[key] ? "#555" : "#e88", lineHeight:"1.5", textDecoration: checked[key] ? "line-through" : "none" }}>{w.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sectioned checklist */}
                    {sections.map(sec => (
                      <div key={sec.title} style={{ marginBottom:"20px" }}>
                        <div style={{ fontSize:"12px", fontWeight:"500", color:"#888", marginBottom:"8px", display:"flex", alignItems:"center", gap:"6px" }}>
                          <span>{sec.icon}</span> {sec.title}
                        </div>
                        {sec.items.map((item, j) => {
                          const key = `${sec.title}-${j}`;
                          return (
                            <div key={key} onClick={() => toggleCheck(key)} style={{ display:"flex", gap:"10px", padding:"8px 10px", background: checked[key] ? "#0a120a" : "#0e0e0e", borderRadius:"6px", marginBottom:"4px", cursor:"pointer", border:`1px solid ${checked[key] ? "#22c55e22" : "transparent"}`, transition:"all 0.15s" }}>
                              <span style={{ fontSize:"15px", flexShrink:0, marginTop:"1px", color: checked[key] ? "#22c55e" : "#444" }}>{checked[key] ? "✅" : "☐"}</span>
                              <span style={{ fontSize:"12px", color: checked[key] ? "#555" : "#bbb", lineHeight:"1.5", textDecoration: checked[key] ? "line-through" : "none" }}>{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div style={{ fontSize:"11px", color:"#444", fontStyle:"italic", marginTop:"8px" }}>
                      Tap any item to check it off during your inspection.
                    </div>
                  </div>
                );
              })()}

              {/* Disclaimer */}
              <div style={{ fontSize:"11px", color:"#444", textAlign:"center", fontStyle:"italic", padding:"0 8px" }}>
                Issues sourced from RepairPal, CarComplaints.com, and NHTSA complaint database. Always get a pre-purchase inspection from a licensed mechanic.
              </div>

            </div>
          )}
        </section>
      )} {/* end buyside mode */}
      {appMode === "costs" && (
      <div style={{ maxWidth:"900px", margin:"0 auto 40px", padding:"0 24px" }}>
        <div style={{ background:"#161616", border:"1px solid #1e1e1e", borderRadius:"10px", padding:"28px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"8px" }}>Help the Community</div>
          <h2 style={{ fontSize:"20px", fontWeight:"400", margin:"0 0 8px", letterSpacing:"-0.02em" }}>Submit What You Paid</h2>
          <p style={{ color:"#444", fontSize:"13px", margin:"0 0 20px", fontStyle:"italic" }}>Real submissions keep our data accurate. All entries are anonymized.</p>
          {!submitted ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <input
                placeholder="Repair type (e.g. Brake Pads)"
                style={IS}
                value={formRepair}
                onChange={e => setFormRepair(e.target.value)}
              />
              <input
                placeholder="Your vehicle (e.g. 2020 Subaru Outback)"
                style={IS}
                value={formVehicle}
                onChange={e => setFormVehicle(e.target.value)}
              />
              <input
                placeholder="Total paid ($)"
                type="number"
                style={IS}
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
              />
              <input
                placeholder="ZIP code"
                style={IS}
                value={formZip || zip}
                onChange={e => setFormZip(e.target.value)}
              />
              {submitError && (
                <div style={{ gridColumn:"1/-1", color:"#ef4444", fontSize:"12px", textAlign:"center" }}>
                  {submitError}
                </div>
              )}
              <button
                onClick={handleSubmission}
                disabled={submitting || !formRepair || !formAmount}
                style={{ gridColumn:"1/-1", background:"transparent", border:"1px solid #c9a84c", color: (submitting || !formRepair || !formAmount) ? "#555" : "#c9a84c", borderRadius:"6px", padding:"11px", fontSize:"12px", fontFamily:"inherit", cursor: (submitting || !formRepair || !formAmount) ? "not-allowed" : "pointer", letterSpacing:"0.1em", textTransform:"uppercase" }}
              >
                {submitting ? "Saving..." : "Submit My Data →"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"20px", color:"#22c55e", fontSize:"14px" }}>
              ✓ Thanks! Your submission helps other drivers get fair prices.
            </div>
          )}
        </div>
      </div>
      )} {/* end costs mode submit form */}

      {/* ── FEEDBACK SECTION ─────────────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid #1a1a1a", padding:"32px 24px", maxWidth:"600px", margin:"0 auto" }}>
        <div style={{ fontSize:"13px", fontWeight:"500", color:"#c9a84c", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px" }}>
          Suggest a Change
        </div>
        <p style={{ fontSize:"13px", color:"#666", margin:"0 0 16px", lineHeight:"1.5" }}>
          Missing a repair? Wrong price range? Incorrect trim or year data? Let us know — every suggestion helps.
        </p>
        {!feedbackSent ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <textarea
              placeholder="What should we fix or add? (e.g. 'Timing belt for 2015 Honda CR-V is missing' or 'Brake pad range for BMW seems too low')"
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              rows={4}
              style={{ ...IS, resize:"vertical", lineHeight:"1.5" }}
            />
            <input
              placeholder="Email (optional — only if you'd like a reply)"
              value={feedbackEmail}
              onChange={e => setFeedbackEmail(e.target.value)}
              style={IS}
            />
            {feedbackError && (
              <div style={{ color:"#ef4444", fontSize:"12px" }}>{feedbackError}</div>
            )}
            <button
              onClick={handleFeedback}
              disabled={feedbackSending || !feedbackText.trim()}
              style={{ background:"transparent", border:"1px solid #c9a84c", color: (feedbackSending || !feedbackText.trim()) ? "#555" : "#c9a84c", borderRadius:"6px", padding:"11px", fontSize:"12px", fontFamily:"inherit", cursor: (feedbackSending || !feedbackText.trim()) ? "not-allowed" : "pointer", letterSpacing:"0.1em", textTransform:"uppercase" }}
            >
              {feedbackSending ? "Sending..." : "Send Feedback →"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"20px", color:"#22c55e", fontSize:"14px" }}>
            ✓ Got it — thanks for helping make RepairIQ better.
          </div>
        )}
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

      <style>{`
        select option { background: #1a1a1a; }
        @media print {
          body > *:not(#repairiq-print-root) { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// Shared input style
const IS = {
  background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px",
  padding:"10px 14px", color:"#f0ede6", fontSize:"13px", outline:"none",
  fontFamily:"inherit", width:"100%", boxSizing:"border-box",
};
