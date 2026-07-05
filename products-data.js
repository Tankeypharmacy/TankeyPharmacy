// Tankey Pharmacy — product catalog
// Prices in Naira. This is demo data for the site prototype.
const TANKEY_PRODUCTS = [
  { id: "p01", name: "Paracetamol 500mg (20 tabs)", cat: "Pain & Fever", price: 500, desc: "Fast relief for fever, headache and body pain.", rx: false },
  { id: "p02", name: "Ibuprofen 400mg (10 tabs)", cat: "Pain & Fever", price: 700, desc: "Anti-inflammatory for pain and swelling.", rx: false },
  { id: "p03", name: "Panadol Extra (12 tabs)", cat: "Pain & Fever", price: 850, desc: "Paracetamol with caffeine for stronger headaches.", rx: false },
  { id: "p04", name: "Coartem 20/120mg (24 tabs)", cat: "Antimalarials", price: 1800, desc: "Full course for uncomplicated malaria treatment.", rx: true },
  { id: "p05", name: "Fansidar (3 tabs)", cat: "Antimalarials", price: 900, desc: "Sulfadoxine-pyrimethamine for malaria prevention.", rx: true },
  { id: "p06", name: "Amoxicillin 500mg (21 caps)", cat: "Antibiotics", price: 1500, desc: "Broad-spectrum antibiotic, full course.", rx: true },
  { id: "p07", name: "Flagyl 400mg (21 tabs)", cat: "Antibiotics", price: 1200, desc: "Metronidazole for bacterial and parasitic infections.", rx: true },
  { id: "p08", name: "Vitamin C 1000mg (10 effervescent)", cat: "Vitamins & Supplements", price: 1300, desc: "Immune support, orange-flavoured.", rx: false },
  { id: "p09", name: "Multivite Syrup 200ml", cat: "Vitamins & Supplements", price: 1600, desc: "Daily multivitamin syrup for adults and teens.", rx: false },
  { id: "p10", name: "Folic Acid 5mg (30 tabs)", cat: "Vitamins & Supplements", price: 600, desc: "Supports red blood cell formation.", rx: false },
  { id: "p11", name: "Zinc + Vitamin D3 (30 tabs)", cat: "Vitamins & Supplements", price: 2200, desc: "Immune and bone health support.", rx: false },
  { id: "p12", name: "Nutrend Baby Formula 400g", cat: "Mother & Baby", price: 4200, desc: "Infant formula, stage 1.", rx: false },
  { id: "p13", name: "Gripe Water 200ml", cat: "Mother & Baby", price: 900, desc: "Relief for infant colic and wind.", rx: false },
  { id: "p14", name: "Prenatal Vitamins (30 tabs)", cat: "Mother & Baby", price: 2500, desc: "Folic acid, iron and DHA for pregnancy.", rx: false },
  { id: "p15", name: "ORS Sachets (pack of 10)", cat: "First Aid", price: 1000, desc: "Oral rehydration salts for dehydration.", rx: false },
  { id: "p16", name: "Antiseptic Wound Spray 100ml", cat: "First Aid", price: 1400, desc: "Cleans and disinfects minor cuts.", rx: false },
  { id: "p17", name: "Elastic Bandage & Plaster Kit", cat: "First Aid", price: 1800, desc: "Home first-aid essentials kit.", rx: false },
  { id: "p18", name: "Thermometer (digital)", cat: "First Aid", price: 2800, desc: "Fast, accurate digital body temperature reading.", rx: false },
  { id: "p19", name: "Calamine Lotion 100ml", cat: "Skin & Personal Care", price: 950, desc: "Soothes itching, rashes and mild sunburn.", rx: false },
  { id: "p20", name: "Medicated Soap (antibacterial)", cat: "Skin & Personal Care", price: 700, desc: "Daily antibacterial cleansing bar.", rx: false },
  { id: "p21", name: "Sunscreen SPF 50 50ml", cat: "Skin & Personal Care", price: 3500, desc: "Broad-spectrum daily sun protection.", rx: false },
  { id: "p22", name: "Hand Sanitizer 250ml", cat: "Skin & Personal Care", price: 800, desc: "70% alcohol-based, kills 99.9% of germs.", rx: false },
];

const TANKEY_CATEGORIES = ["All", ...Array.from(new Set(TANKEY_PRODUCTS.map(p => p.cat)))];
