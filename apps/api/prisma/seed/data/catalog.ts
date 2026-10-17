import { PRODUCT_CATEGORIES } from "@afritrade/shared";

/** [name, description, base price in USD] — 10 per category, listed by 2 suppliers each = 120 products. */
type Tpl = [string, string, number];

export const PRODUCT_TEMPLATES: Record<
  (typeof PRODUCT_CATEGORIES)[number],
  Tpl[]
> = {
  Agriculture: [
    [
      "Raw Cashew Nuts (1 tonne)",
      "Export-grade raw cashew nuts, moisture below 10%.",
      1450,
    ],
    [
      "Cocoa Beans Grade A (1 tonne)",
      "Fermented and sun-dried cocoa beans, bean count under 100/100g.",
      3100,
    ],
    [
      "Unrefined Shea Butter (25 kg)",
      "Cold-pressed, unrefined shea butter for cosmetics manufacturers.",
      120,
    ],
    [
      "Hulled Sesame Seeds (1 tonne)",
      "99% purity hulled sesame seeds, cleaned and sorted.",
      1650,
    ],
    [
      "Dried Split Ginger (500 kg)",
      "Sun-dried split ginger, low fibre, export packed.",
      900,
    ],
    [
      "Dried Hibiscus Flower (500 kg)",
      "Deep-red dried hibiscus calyces for tea and beverage use.",
      750,
    ],
    [
      "Palm Kernel Oil (200 L drum)",
      "Crude palm kernel oil in food-safe drums.",
      420,
    ],
    [
      "Shelled Groundnuts (1 tonne)",
      "Machine-shelled groundnuts, aflatoxin tested.",
      1100,
    ],
    [
      "Export Citrus Oranges (10 tonnes)",
      "Valencia oranges, graded and waxed for shipping.",
      3800,
    ],
    [
      "Dried Mango Slices (100 kg)",
      "Preservative-free dried mango, vacuum packed.",
      650,
    ],
  ],
  Textiles: [
    [
      "Ankara Wax Print Fabric (24 yards)",
      "Colourfast 100% cotton wax print, assorted designs.",
      38,
    ],
    [
      "Kente Woven Cloth (6 yards)",
      "Hand-woven kente strips, traditional patterns.",
      160,
    ],
    [
      "Cotton Poplin Roll (100 m)",
      "Plain-weave cotton poplin for shirting.",
      210,
    ],
    ["Adire Indigo Textile (10 yards)", "Hand-dyed indigo resist cloth.", 95],
    [
      "School Uniform Fabric (50 m)",
      "Durable poly-cotton twill, multiple colours.",
      140,
    ],
    [
      "Shweshwe Printed Cotton (10 m)",
      "Classic Southern African printed cotton.",
      70,
    ],
    [
      "Bulk Cotton T-Shirts (100 pcs)",
      "Blank 180gsm cotton tees, assorted sizes.",
      380,
    ],
    [
      "Handwoven Basket Textile Set (20 pcs)",
      "Decor-grade woven fibre baskets.",
      260,
    ],
    [
      "Mudcloth-Style Upholstery Fabric (20 m)",
      "Heavy cotton upholstery fabric, geometric print.",
      240,
    ],
    [
      "Safety Workwear Overalls (50 pcs)",
      "Industrial overalls, reinforced stitching.",
      820,
    ],
  ],
  Manufacturing: [
    [
      "Plastic Food Containers (1,000 pcs)",
      "Stackable BPA-free containers with lids.",
      310,
    ],
    [
      "Corrugated Packaging Cartons (500 pcs)",
      "Triple-wall export cartons, custom sizes available.",
      280,
    ],
    [
      "Steel Roofing Sheets (200 sheets)",
      "Pre-painted galvanised roofing sheets, 0.45mm.",
      2900,
    ],
    [
      "Industrial Detergent (20 x 5 L)",
      "Concentrated multi-purpose cleaning detergent.",
      360,
    ],
    [
      "Aluminium Cookware Set (50 sets)",
      "Cast aluminium non-stick cookware.",
      1150,
    ],
    [
      "PVC Pipes 110mm (100 lengths)",
      "Pressure-rated PVC pipes, 6 m lengths.",
      1700,
    ],
    [
      "Glass Bottles 500ml (5,000 pcs)",
      "Clear glass bottles for beverage bottling.",
      950,
    ],
    ["Wooden Pallets (200 pcs)", "Heat-treated export-standard pallets.", 1400],
    [
      "Paint Emulsion 20L (100 buckets)",
      "Interior/exterior emulsion paint.",
      2200,
    ],
    [
      "Rubber Footwear Soles (2,000 pairs)",
      "Moulded rubber soles, assorted sizes.",
      880,
    ],
  ],
  Electronics: [
    [
      "Solar Panels 450W (20 units)",
      "Monocrystalline panels with 25-year output warranty.",
      3400,
    ],
    [
      "Lithium Battery Packs 5kWh (5 units)",
      "Wall-mounted LiFePO4 home storage batteries.",
      4200,
    ],
    ["LED Bulbs 9W (2,000 pcs)", "Energy-saving B22/E27 LED bulbs.", 1300],
    [
      "Solar Street Lights (30 units)",
      "All-in-one solar street lights with motion sensors.",
      2700,
    ],
    ["Inverters 3.5kVA (10 units)", "Pure sine wave hybrid inverters.", 2600],
    [
      'Android Tablets 10" (50 units)',
      "Entry-level tablets for education programmes.",
      5200,
    ],
    ["POS Receipt Printers (40 units)", "58mm thermal receipt printers.", 1900],
    [
      "Power Extension Surge Strips (500 pcs)",
      "Surge-protected 4-way strips.",
      1100,
    ],
    [
      "Mobile Phone Chargers (1,000 pcs)",
      "Fast-charge USB-C wall chargers.",
      1500,
    ],
    ["CCTV Camera Kits (25 kits)", "4-camera 1080p kits with DVR.", 3300],
  ],
  "Food & Beverage": [
    [
      "Packaged Jollof Rice Mix (500 x 200g)",
      "Ready-to-cook seasoned rice mix sachets.",
      540,
    ],
    [
      "Bottled Water 500ml (50 cartons)",
      "Purified bottled water, 24 per carton.",
      190,
    ],
    [
      "Biltong Beef Strips (50 kg)",
      "Air-dried spiced beef, vacuum sealed.",
      1250,
    ],
    [
      "Rooibos Tea Bags (5,000 pcs)",
      "Premium rooibos, individually wrapped.",
      780,
    ],
    ["Pure Honey 500g (500 jars)", "Raw forest honey, glass jars.", 1350],
    ["Cassava Flour (1 tonne)", "Fine, gluten-free cassava flour.", 640],
    [
      "Fruit Juice Concentrate (20 x 20L)",
      "Pineapple/mango concentrate for beverage makers.",
      1800,
    ],
    [
      "Instant Noodles (100 cartons)",
      "Assorted flavours, 40 packs per carton.",
      920,
    ],
    [
      "Roasted Plantain Chips (200 x 100g)",
      "Lightly salted plantain chips.",
      330,
    ],
    [
      "Chilli Pepper Sauce (24 x 5L)",
      "Bulk table sauce for food service.",
      690,
    ],
  ],
  "Building Materials": [
    ["Portland Cement 50kg (500 bags)", "42.5R Portland cement.", 2800],
    [
      "Ceramic Floor Tiles 60x60 (1,000 m²)",
      "Glazed porcelain-look ceramic tiles.",
      5600,
    ],
    ["Iron Rods 12mm (200 bars)", "High-tensile reinforcement bars.", 3200],
    [
      "Aluminium Window Frames (40 units)",
      "Powder-coated sliding window frames.",
      3900,
    ],
    [
      "Interlocking Paving Blocks (5,000 pcs)",
      "Concrete paving blocks, 60mm.",
      2100,
    ],
    ["Roofing Timber Trusses (30 units)", "Treated pine roof trusses.", 2400],
    [
      "Bitumen Waterproofing (100 drums)",
      "Industrial-grade waterproofing membrane.",
      4100,
    ],
    ["Sanitary Ware Set (60 sets)", "Close-coupled WC and basin sets.", 3700],
    [
      "Electrical Cable 2.5mm (100 rolls)",
      "Copper-core cable, 100 m rolls.",
      3030,
    ],
    [
      "Hardwood Doors (50 units)",
      "Solid hardwood interior doors, pre-hung.",
      4400,
    ],
  ],
};
