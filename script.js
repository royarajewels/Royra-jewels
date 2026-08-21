/**
 * ROYRA JEWELS - Master JavaScript Engine
 * Luxury E-Commerce Engine with Cart, Wishlist, Search, Modals, Dynamic Filtering, and Persistence
 */

/* ==========================================================================
   CENTRALIZED PRODUCT DATA STRUCTURE (ROYRA JEWELS MASTER CATALOGUE)
   - Rings (Solitaires, Halos, Bands, Cocktails, Statements, Stackables)
   - Earrings (Studs, Drops, Chandeliers, Huggies)
   - Bracelets (Tennis bracelets, Gold cuffs, Chain bracelets, Bangles)
   - Necklaces (Solitaire pendants, Chokers, Layered necklaces, Lariats)
   ========================================================================== */

let ROYRA_PRODUCTS = [
  // --------------------------------------------------------------------------
  // RINGS (8 PIECES ACROSS SIZES, FINISHES, STONES & TYPES)
  // --------------------------------------------------------------------------
  {
    id: "royra-ring-01",
    name: "Classic Gold Solitaire Ring",
    category: "rings",
    productType: "Solitaire",
    collection: "diamond",
    price: 9600,
    oldPrice: 12800,
    badge: "Bestseller",
    badgeType: "sale",
    rating: 4.9,
    reviewsCount: 128,
    image: "assets/products/roy-wh00829.webp",
    secondImage: "assets/products/roy-untitled-3.jpg",
    gallery: [
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["4", "5", "6", "7", "8", "9", "10", "11", "12"],
    sizeType: "ring",
    material: "18K Solid Gold / 925 Sterling Silver",
    metalCode: "gold",
    plating: "18K Solid Yellow Gold & Rhodium",
    stone: "VVS-VS Certified Moissanite Diamond (1.20 Carats)",
    stoneCategory: "Diamond",
    weight: "3.20g approx",
    dimensions: "6.5mm Round Brilliant Solitaire",
    countryOfOrigin: "India",
    description: "An epitome of understated luxury. Meticulously handcrafted in 18K hallmarked gold featuring a brilliant-cut center solitaire cradled in classic four-prong architecture.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-ring-02",
    name: "Diamond Pavé Halo Ring",
    category: "rings",
    productType: "Halo",
    collection: "diamond",
    price: 14999,
    oldPrice: 18499,
    badge: "New Arrival",
    badgeType: "new",
    rating: 4.8,
    reviewsCount: 94,
    image: "assets/products/roy-untitled-3.jpg",
    secondImage: "assets/products/roy-wh00829.webp",
    gallery: [
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["4", "5", "6", "7", "8", "9", "10"],
    sizeType: "ring",
    material: "18K Rose Gold & 925 Sterling Silver",
    metalCode: "rose",
    plating: "18K Rose Gold High Polish",
    stone: "Cushion Cut Solitaire with Micro-Pavé Halo (1.50 TCW)",
    stoneCategory: "Diamond",
    weight: "3.45g approx",
    dimensions: "8mm x 8mm Cushion Halo Frame",
    countryOfOrigin: "India",
    description: "Radiant cushion-cut center stone enveloped by a shimmering halo of pavé diamonds, set on an ultra-slim 18K comfort band.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-ring-03",
    name: "Royal Emerald Cut Ring",
    category: "rings",
    productType: "Statement",
    collection: "statement",
    price: 16499,
    oldPrice: 19999,
    badge: "Limited Edition",
    badgeType: "gold",
    rating: 5.0,
    reviewsCount: 62,
    image: "assets/products/roy-2.jpg",
    secondImage: "assets/products/roy-untitled-3.jpg",
    gallery: [
      "assets/products/roy-2.jpg",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    sizeType: "ring",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Yellow Gold",
    stone: "Zambian Emerald (2.00 Carats) with Tapered Baguettes",
    stoneCategory: "Emerald",
    weight: "4.10g approx",
    dimensions: "7mm x 9mm Emerald Cut Silhouette",
    countryOfOrigin: "India",
    description: "A heritage statement of regal opulence. Featuring an emerald-cut deep green gem flanked by geometric tapered diamond baguettes.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isIconic: false
  },
  {
    id: "royra-ring-04",
    name: "Eternal Trinity Gold Band",
    category: "rings",
    productType: "Band",
    collection: "everyday",
    price: 4800,
    oldPrice: 6200,
    badge: "Under ₹5,000",
    badgeType: "sale",
    rating: 4.8,
    reviewsCount: 45,
    image: "assets/products/roy-ig-1.jpg",
    secondImage: "assets/products/roy-wh00829.webp",
    gallery: [
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-2.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["4", "5", "6", "7", "8", "9", "10", "11", "12"],
    sizeType: "ring",
    material: "18K Tri-Tone Gold & 925 Sterling Silver",
    metalCode: "gold",
    plating: "18K Triple Finish Plating",
    stone: "Hand-Set Micro Diamonds (0.45 TCW)",
    stoneCategory: "Diamond",
    weight: "2.80g approx",
    dimensions: "4mm Band Width",
    countryOfOrigin: "India",
    description: "Intertwined three-tone gold rolling bands symbolizing eternity, love, and fidelity. Fluid ergonomic styling designed for seamless daily wear.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isIconic: false
  },
  {
    id: "royra-ring-05",
    name: "Marquise Crown Stackable Ring",
    category: "rings",
    productType: "Stackable",
    collection: "diamond",
    price: 7200,
    oldPrice: 8900,
    badge: "Trending",
    badgeType: "gold",
    rating: 4.9,
    reviewsCount: 52,
    image: "assets/products/roy-wh00829.webp",
    secondImage: "assets/products/roy-2.jpg",
    gallery: [
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-2.jpg",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["4", "5", "6", "7", "8", "9", "10"],
    sizeType: "ring",
    material: "18K Yellow Gold & Sterling Silver",
    metalCode: "gold",
    plating: "18K Micro-Gold Vermeil",
    stone: "Marquise & Round Brilliant Cubic Zirconia",
    stoneCategory: "Cubic Zirconia",
    weight: "2.50g approx",
    dimensions: "3.5mm Tiara Arch",
    countryOfOrigin: "India",
    description: "A curved tiara contour engineered to nest flawlessly against solitaire engagement rings or wear as an alluring chevron statement.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: false
  },
  {
    id: "royra-ring-06",
    name: "Royal Sapphire Cocktail Ring",
    category: "rings",
    productType: "Cocktail",
    collection: "statement",
    price: 22500,
    oldPrice: 28000,
    badge: "Exclusive",
    badgeType: "gold",
    rating: 5.0,
    reviewsCount: 38,
    image: "assets/products/roy-2.jpg",
    secondImage: "assets/products/roy-ig-1.jpg",
    gallery: [
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["6", "7", "8", "9", "10", "11"],
    sizeType: "ring",
    material: "18K White Gold",
    metalCode: "white",
    plating: "18K Solid White Gold & Rhodium",
    stone: "Ceylon Royal Blue Sapphire (2.50 Carats) & Halo Diamonds",
    stoneCategory: "Sapphire",
    weight: "5.20g approx",
    dimensions: "10mm x 12mm Oval Statement",
    countryOfOrigin: "India",
    description: "A showstopping high-jewelry cocktail ring showcasing a velvety royal blue Ceylon sapphire framed by a sunburst of brilliant marquise diamonds.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isIconic: true
  },
  {
    id: "royra-ring-07",
    name: "Crimson Ruby Eternity Band",
    category: "rings",
    productType: "Band",
    collection: "statement",
    price: 11200,
    oldPrice: 14500,
    badge: "Bestseller",
    badgeType: "sale",
    rating: 4.9,
    reviewsCount: 71,
    image: "assets/products/roy-untitled-3.jpg",
    secondImage: "assets/products/roy-ig-1.jpg",
    gallery: [
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-2.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    sizeType: "ring",
    material: "18K Rose Gold",
    metalCode: "rose",
    plating: "18K Solid Rose Gold",
    stone: "Burmese Pigeon Blood Rubies (1.80 TCW)",
    stoneCategory: "Ruby",
    weight: "3.10g approx",
    dimensions: "3.2mm Full Eternity Channel",
    countryOfOrigin: "India",
    description: "A continuous ring of hand-selected vivid crimson rubies in channel setting, offering captivating color and seamless comfort.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: false
  },
  {
    id: "royra-ring-08",
    name: "Curved Oval Ring Set",
    category: "rings",
    productType: "Statement",
    collection: "diamond",
    price: 9600,
    oldPrice: 12000,
    badge: "Bestseller",
    badgeType: "sale",
    rating: 4.9,
    reviewsCount: 88,
    image: "assets/products/roy-untitled-3.jpg",
    secondImage: "assets/products/roy-wh00829.webp",
    gallery: [
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["4", "5", "6", "7", "8", "9", "10"],
    sizeType: "ring",
    material: "18K Solid Gold / 925 Sterling Silver",
    metalCode: "gold",
    plating: "18K Yellow Gold with Anti-Tarnish Coating",
    stone: "VVS-VS Certified Moissanite Diamond (1.40 Carats)",
    stoneCategory: "Diamond",
    weight: "3.80g approx",
    dimensions: "6mm x 8mm Oval Center Silhouette",
    countryOfOrigin: "India",
    description: "An alluring modern curved statement piece framing a high-clarity center stone. Handcrafted in 18K gold and hypoallergenic sterling silver, designed to stack gracefully or shine individually.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: true
  },

  // --------------------------------------------------------------------------
  // EARRINGS (4 PIECES)
  // --------------------------------------------------------------------------
  {
    id: "royra-earring-01",
    name: "Diamond Dangle Hoop Earrings",
    category: "earrings",
    productType: "Drop",
    collection: "everyday",
    price: 4999,
    oldPrice: 6499,
    badge: "New Arrival",
    badgeType: "new",
    rating: 4.8,
    reviewsCount: 76,
    image: "assets/products/roy-earring-5.jpg",
    secondImage: "assets/products/roy-earring-1.jpg",
    gallery: [
      "assets/products/roy-earring-5.jpg",
      "assets/products/roy-earring-1.jpg",
      "assets/products/roy-earring-2.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    sizeType: "earring",
    material: "18K Solid Yellow Gold & Rhodium",
    metalCode: "gold",
    plating: "18K Solid Gold Vermeil",
    stone: "Pavé Dangle Diamonds & Delicate Drops",
    stoneCategory: "Diamond",
    weight: "4.20g pair",
    dimensions: "28mm Drop Length",
    countryOfOrigin: "India",
    description: "Effortless femininity meets modern poise. Natural certified diamonds suspended gracefully from micro-pavé articulated gold hoop links.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isIconic: false
  },
  {
    id: "royra-earring-02",
    name: "Solitaire Diamond Stud Earrings",
    category: "earrings",
    productType: "Stud",
    collection: "diamond",
    price: 7499,
    oldPrice: 9999,
    badge: "Bestseller",
    badgeType: "gold",
    rating: 4.9,
    reviewsCount: 145,
    image: "assets/products/roy-earring-1.jpg",
    secondImage: "assets/products/roy-earring-2.jpg",
    gallery: [
      "assets/products/roy-earring-1.jpg",
      "assets/products/roy-earring-2.jpg",
      "assets/products/roy-earring-5.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    sizeType: "earring",
    material: "18K White Gold & 925 Sterling Silver",
    metalCode: "white",
    plating: "18K Solid White Gold",
    stone: "Round Brilliant Cut Diamonds (1.00 TCW)",
    stoneCategory: "Diamond",
    weight: "2.10g pair",
    dimensions: "5mm Solitaire Diameter",
    countryOfOrigin: "India",
    description: "The foundational jewel for every wardrobe. Four-prong crown setting engineered for maximum light refraction and everyday comfort.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-earring-03",
    name: "Grand Chandelier Diamond Earrings",
    category: "earrings",
    productType: "Statement",
    collection: "statement",
    price: 18999,
    oldPrice: 24999,
    badge: "Bestseller",
    badgeType: "gold",
    rating: 5.0,
    reviewsCount: 42,
    image: "assets/products/roy-earring-2.jpg",
    secondImage: "assets/products/roy-earring-5.jpg",
    gallery: [
      "assets/products/roy-earring-2.jpg",
      "assets/products/roy-earring-5.jpg",
      "assets/products/roy-earring-1.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    sizeType: "earring",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Gold Filigree",
    stone: "Cascading Brilliant Diamonds & Filigree Artistry",
    stoneCategory: "Diamond",
    weight: "8.40g pair",
    dimensions: "52mm Chandelier Length",
    countryOfOrigin: "India",
    description: "An arresting spectacle of movement and radiance. Intricate hand-carved filigree arches holding tier upon tier of shimmering gemstones.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-earring-04",
    name: "Celestial Gold Huggie Hoops",
    category: "earrings",
    productType: "Band",
    collection: "everyday",
    price: 5499,
    oldPrice: 7299,
    badge: "New Arrival",
    badgeType: "new",
    rating: 4.8,
    reviewsCount: 58,
    image: "assets/products/roy-earring-5.jpg",
    secondImage: "assets/products/roy-earring-2.jpg",
    gallery: [
      "assets/products/roy-earring-5.jpg",
      "assets/products/roy-earring-2.jpg",
      "assets/products/roy-earring-1.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    sizeType: "earring",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Yellow Gold",
    stone: "Pavé Set Diamonds (0.50 TCW)",
    stoneCategory: "Diamond",
    weight: "2.60g pair",
    dimensions: "12mm Huggie Hoop Diameter",
    countryOfOrigin: "India",
    description: "Sleek mini huggie hoops lined with channel-set brilliant diamonds, designed with a secure click-lock mechanism for effortless 24/7 comfort.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isIconic: false
  },

  // --------------------------------------------------------------------------
  // BRACELETS (4 PIECES)
  // --------------------------------------------------------------------------
  {
    id: "royra-bracelet-01",
    name: "Signature Tennis Bracelet",
    category: "bracelets",
    productType: "Statement",
    collection: "diamond",
    price: 15999,
    oldPrice: 19999,
    badge: "Bestseller",
    badgeType: "gold",
    rating: 5.0,
    reviewsCount: 110,
    image: "assets/products/roy-ig-1.jpg",
    secondImage: "assets/products/roy-wh00829.webp",
    gallery: [
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-2.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["6\"", "6.5\"", "7\"", "7.5\"", "8\""],
    sizeType: "bracelet",
    material: "18K White Gold & 925 Sterling Silver",
    metalCode: "white",
    plating: "High Polish Platinum Rhodium",
    stone: "Full Eternity Continuous Brilliant Diamonds (3.50 TCW)",
    stoneCategory: "Diamond",
    weight: "9.20g approx",
    dimensions: "3.2mm Articulated Tennis Link",
    countryOfOrigin: "India",
    description: "A timeless masterpiece. A continuous strand of perfectly color-matched diamonds set in individual articulating four-prong baskets with double safety lock.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-bracelet-02",
    name: "Minimalist Gold Cuff Bangle",
    category: "bracelets",
    productType: "Band",
    collection: "everyday",
    price: 8499,
    oldPrice: 10999,
    badge: "Bestseller",
    badgeType: "sale",
    rating: 4.8,
    reviewsCount: 88,
    image: "assets/products/roy-2.jpg",
    secondImage: "assets/products/roy-ig-1.jpg",
    gallery: [
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-untitled-3.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["6\"", "6.5\"", "7\"", "7.5\"", "8\""],
    sizeType: "bracelet",
    material: "18K Solid Yellow Gold",
    metalCode: "gold",
    plating: "18K Mirror Gold Polish",
    stone: "High-Polish Solid 18K Gold Finish",
    stoneCategory: "Cubic Zirconia",
    weight: "6.80g approx",
    dimensions: "4.5mm Ergonomic Oval Cuff",
    countryOfOrigin: "India",
    description: "Sleek, fluid, and versatile. Sculpted from 18K solid hallmarked gold, designed to be worn alone or layered seamlessly as an everyday signature.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: false
  },
  {
    id: "royra-bracelet-03",
    name: "Marquise Round Stone Diamond Bracelet",
    category: "bracelets",
    productType: "Statement",
    collection: "everyday",
    price: 9600,
    oldPrice: 12500,
    badge: "Trending",
    badgeType: "gold",
    rating: 4.9,
    reviewsCount: 74,
    image: "assets/products/roy-wh00829.webp",
    secondImage: "assets/products/roy-2.jpg",
    gallery: [
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-2.jpg",
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-untitled-3.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["6\"", "6.5\"", "7\"", "7.5\"", "8\""],
    sizeType: "bracelet",
    material: "18K Yellow Gold & Sterling Silver",
    metalCode: "gold",
    plating: "18K Solid Gold & Anti-Tarnish Coating",
    stone: "Marquise & Round Brilliant Diamonds (2.20 TCW)",
    stoneCategory: "Diamond",
    weight: "7.10g approx",
    dimensions: "5mm Alternating Marquise & Round Stations",
    countryOfOrigin: "India",
    description: "A rhythmic garland of alternating marquise and round brilliant-cut diamonds. Articulated links ensure a fluid, comfortable drape around the wrist.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-bracelet-04",
    name: "Heritage Kundan Gold Kada",
    category: "bracelets",
    productType: "Statement",
    collection: "statement",
    price: 21999,
    oldPrice: 26999,
    badge: "New Arrival",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 51,
    image: "assets/products/roy-untitled-3.jpg",
    secondImage: "assets/products/roy-ig-1.jpg",
    gallery: [
      "assets/products/roy-untitled-3.jpg",
      "assets/products/roy-ig-1.jpg",
      "assets/products/roy-2.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["6.5\"", "7\"", "7.5\"", "8\""],
    sizeType: "bracelet",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "22K Traditional Kundan Jadau Gold",
    stone: "Polki Uncut Diamonds with Meenakari Enameling",
    stoneCategory: "Diamond",
    weight: "14.50g approx",
    dimensions: "8mm Floral Filigree Kada",
    countryOfOrigin: "India",
    description: "Centuries of royal Indian craftsmanship captured in an openable kada bracelet, adorned with foil-backed polki gemstones and hand-painted meenakari detailing.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isIconic: true
  },

  // --------------------------------------------------------------------------
  // NECKLACES (4 PIECES)
  // --------------------------------------------------------------------------
  {
    id: "royra-necklace-01",
    name: "Floret Necklace in Morganite",
    category: "necklaces",
    productType: "Solitaire",
    collection: "everyday",
    price: 6999,
    oldPrice: 8999,
    badge: "Bestseller",
    badgeType: "sale",
    rating: 4.9,
    reviewsCount: 167,
    image: "assets/products/roy-necklace-1.jpg",
    secondImage: "assets/products/roy-necklace-3.jpg",
    gallery: [
      "assets/products/roy-necklace-1.jpg",
      "assets/products/roy-necklace-3.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-2.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["16\"", "18\"", "20\""],
    sizeType: "necklace",
    material: "18K Yellow Gold & Rose Gold",
    metalCode: "gold",
    plating: "18K Solid Gold & Diamond Cut Chain",
    stone: "Cushion Floret Morganite & Round Brilliant Accent Diamonds",
    stoneCategory: "Diamond",
    weight: "2.90g approx",
    dimensions: "6mm Floating Bezel Pendant",
    countryOfOrigin: "India",
    description: "Delicate yet striking. An adjustable gold cable chain suspending a floating floret morganite pendant framed in a beveled gold bezel.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: true,
    isIconic: false
  },
  {
    id: "royra-necklace-02",
    name: "Layered Gold Cascade Necklace",
    category: "necklaces",
    productType: "Statement",
    collection: "statement",
    price: 13999,
    oldPrice: 17499,
    badge: "Bestseller",
    badgeType: "gold",
    rating: 4.8,
    reviewsCount: 53,
    image: "assets/products/roy-necklace-3.jpg",
    secondImage: "assets/products/roy-necklace-1.jpg",
    gallery: [
      "assets/products/roy-necklace-3.jpg",
      "assets/products/roy-necklace-1.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-untitled-3.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["16\"", "18\"", "20\""],
    sizeType: "necklace",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Gold Triple Tier",
    stone: "Diamond Bar & Sunburst Medallion",
    stoneCategory: "Diamond",
    weight: "7.80g approx",
    dimensions: "16-20 Inch Multi-Tiered Layer",
    countryOfOrigin: "India",
    description: "A three-tier curated layering piece featuring a delicate choker link, a polished pavé bar, and an artisanal sunburst medallion pendant.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: true,
    isIconic: true
  },
  {
    id: "royra-necklace-03",
    name: "Royal Emerald Choker Necklace",
    category: "necklaces",
    productType: "Statement",
    collection: "statement",
    price: 24999,
    oldPrice: 31999,
    badge: "Exclusive",
    badgeType: "gold",
    rating: 5.0,
    reviewsCount: 34,
    image: "assets/products/roy-2.jpg",
    secondImage: "assets/products/roy-necklace-1.jpg",
    gallery: [
      "assets/products/roy-2.jpg",
      "assets/products/roy-necklace-1.jpg",
      "assets/products/roy-necklace-3.jpg",
      "assets/products/roy-wh00829.webp"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["16\"", "18\"", "20\""],
    sizeType: "necklace",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Yellow Gold Mesh",
    stone: "Zambian Cushion Emerald (3.20 Carats) & Halo Diamonds",
    stoneCategory: "Emerald",
    weight: "11.20g approx",
    dimensions: "12mm x 14mm Cushion Emerald Focal",
    countryOfOrigin: "India",
    description: "An extraordinary high-jewelry choker spotlighting an intense vivid green emerald framed in double halo diamonds with delicate gold collar links.",
    availability: "Almost gone! Order soon",
    inStock: true,
    isNew: false,
    isBestSeller: false,
    isIconic: true
  },
  {
    id: "royra-necklace-04",
    name: "Luminary Diamond Y-Drop Necklace",
    category: "necklaces",
    productType: "Statement",
    collection: "diamond",
    price: 11499,
    oldPrice: 14999,
    badge: "New Arrival",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 48,
    image: "assets/products/roy-necklace-1.jpg",
    secondImage: "assets/products/roy-necklace-3.jpg",
    gallery: [
      "assets/products/roy-necklace-1.jpg",
      "assets/products/roy-necklace-3.jpg",
      "assets/products/roy-wh00829.webp",
      "assets/products/roy-ig-1.jpg"
    ],
    finishes: ["Gold", "Silver", "Rose Gold"],
    sizes: ["16\"", "18\"", "20\""],
    sizeType: "necklace",
    material: "18K Yellow Gold",
    metalCode: "gold",
    plating: "18K Solid Gold & Beveled Links",
    stone: "Pear & Round Brilliant Diamonds (1.10 TCW)",
    stoneCategory: "Diamond",
    weight: "4.50g approx",
    dimensions: "18-inch with 2.5-inch Lariat Drop",
    countryOfOrigin: "India",
    description: "A sensuous lariat silhouette that dips gracefully with a pear-cut diamond droplet, capturing light with every movement.",
    availability: "In Stock - Dispatches in 24 Hours",
    inStock: true,
    isNew: true,
    isBestSeller: false,
    isIconic: false
  }
];

// EXPOSE TO GLOBAL SCOPE & SYNC WITH SUPABASE / ADMIN DATABASE
window.ROYRA_PRODUCTS = ROYRA_PRODUCTS;

function syncLiveCatalog() {
  try {
    const raw = localStorage.getItem('royra_db_products_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Active products are shown on public storefront
        ROYRA_PRODUCTS = parsed.filter(p => (p.status || 'Active').toLowerCase() === 'active');
        window.ROYRA_PRODUCTS = ROYRA_PRODUCTS;
      }
    }
  } catch (e) {
    console.warn('Sync live catalog error:', e);
  }
}

// Initial sync
syncLiveCatalog();

// Listen for updates from Admin Panel (same-tab and cross-tab storage events)
window.addEventListener('royra:products-updated', () => {
  syncLiveCatalog();
  refreshCurrentPageView();
});

window.addEventListener('storage', (e) => {
  if (e.key === 'royra_db_products_v2') {
    syncLiveCatalog();
    refreshCurrentPageView();
  }
});

function refreshCurrentPageView() {
  const path = window.location.pathname;
  if (path.endsWith('shop.html')) {
    if (typeof renderFilteredShop === 'function') renderFilteredShop();
  } else if (path.endsWith('product.html')) {
    if (typeof initProductPage === 'function') initProductPage();
  } else if (path.endsWith('cart.html')) {
    if (typeof renderCartPage === 'function') renderCartPage();
  } else if (path.endsWith('wishlist.html')) {
    if (typeof renderWishlistPage === 'function') renderWishlistPage();
  } else {
    if (typeof initHomePage === 'function') initHomePage();
  }
}

// STATE MANAGEMENT (CART & WISHLIST)
const StorageKeys = {
  CART: 'royra_cart_items',
  WISHLIST: 'royra_wishlist_items',
  APPLIED_COUPON: 'royra_applied_coupon'
};

const CartStore = {
  getItems() {
    try {
      const data = localStorage.getItem(StorageKeys.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveItems(items) {
    localStorage.setItem(StorageKeys.CART, JSON.stringify(items));
    updateGlobalBadges();
    renderCartDrawer();
  },
  addItem(productId, quantity = 1, size = null, metal = null) {
    const product = ROYRA_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const items = this.getItems();
    const chosenSize = size || (product.sizes && product.sizes[0]) || "Standard";
    const chosenMetal = metal || product.material;
    const cartItemId = `${productId}_${chosenSize}_${chosenMetal}`;

    const existingIndex = items.findIndex(item => item.cartItemId === cartItemId);
    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        size: chosenSize,
        metal: chosenMetal,
        quantity: quantity
      });
    }

    this.saveItems(items);
    showToast(`Added "${product.name}" to your shopping bag!`);
    openCartDrawer();
  },
  removeItem(cartItemId) {
    let items = this.getItems();
    items = items.filter(item => item.cartItemId !== cartItemId);
    this.saveItems(items);
    showToast("Item removed from your bag");
    if (window.location.pathname.includes("cart.html")) {
      renderCartPage();
    }
  },
  updateQuantity(cartItemId, delta) {
    const items = this.getItems();
    const item = items.find(i => i.cartItemId === cartItemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(cartItemId);
        return;
      }
      this.saveItems(items);
      if (window.location.pathname.includes("cart.html")) {
        renderCartPage();
      }
    }
  },
  getSubtotal() {
    const items = this.getItems();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  getItemCount() {
    const items = this.getItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
};

const WishlistStore = {
  getItems() {
    try {
      const data = localStorage.getItem(StorageKeys.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveItems(items) {
    localStorage.setItem(StorageKeys.WISHLIST, JSON.stringify(items));
    updateGlobalBadges();
    updateWishlistButtonStates();
  },
  toggleItem(productId) {
    const items = this.getItems();
    const product = ROYRA_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const index = items.indexOf(productId);
    if (index > -1) {
      items.splice(index, 1);
      showToast(`Removed "${product.name}" from your wishlist`);
    } else {
      items.push(productId);
      showToast(`Saved "${product.name}" to your wishlist`);
    }
    this.saveItems(items);
    if (window.location.pathname.includes("wishlist.html")) {
      renderWishlistPage();
    }
  },
  has(productId) {
    return this.getItems().includes(productId);
  },
  hasItem(productId) {
    return this.has(productId);
  }
};

// FORMAT INR CURRENCY
function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// UPDATE HEADER BADGES
function updateGlobalBadges() {
  const cartBadges = document.querySelectorAll(".cart-count-badge");
  const cartCount = CartStore.getItemCount();
  cartBadges.forEach(badge => {
    badge.textContent = cartCount;
    badge.style.display = cartCount > 0 ? "flex" : "none";
  });

  const wishlistBadges = document.querySelectorAll(".wishlist-count-badge");
  const wishlistCount = WishlistStore.getItems().length;
  wishlistBadges.forEach(badge => {
    badge.textContent = wishlistCount;
    badge.style.display = wishlistCount > 0 ? "flex" : "none";
  });
}

function updateWishlistButtonStates() {
  const buttons = document.querySelectorAll(".product-wishlist-btn[data-product-id]");
  buttons.forEach(btn => {
    const id = btn.getAttribute("data-product-id");
    if (WishlistStore.has(id)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// TOAST NOTIFICATIONS
function showToast(message) {
  let container = document.getElementById("royra-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "royra-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B08D57" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s ease";
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// GENERATE PRODUCT CARD HTML - MINIMAL LUXURY (EDITORIAL & BORDERLESS)
function createProductCardHTML(product) {
  const isWishlisted = WishlistStore.has(product.id);
  const categoryUpper = (product.category || 'JEWELLERY').toUpperCase();

  // Subtle badge only if genuinely required: "NEW" or "BEST SELLER"
  let subtleBadgeHTML = '';
  if (product.isNew) {
    subtleBadgeHTML = `<span class="luxury-badge">NEW</span>`;
  } else if (product.isBestSeller || product.badge === "Bestseller") {
    subtleBadgeHTML = `<span class="luxury-badge">BEST SELLER</span>`;
  }

  return `
    <div class="product-card" id="card-${product.id}">
      <div class="product-thumb">
        ${subtleBadgeHTML ? `<div class="product-badge-wrap">${subtleBadgeHTML}</div>` : ''}
        
        <button type="button" class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-product-id="${product.id}" onclick="WishlistStore.toggleItem('${product.id}')" title="Save to Wishlist" aria-label="Save to Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? '#1F1F1F' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>

        <a href="product.html?id=${product.id}" class="product-img-link">
          <img src="${product.image}" alt="${product.name}" class="img-main" loading="lazy" />
          ${product.secondImage ? `<img src="${product.secondImage}" alt="${product.name} alternate view" class="img-hover" loading="lazy" />` : ''}
        </a>

        <div class="product-hover-actions">
          <button type="button" class="hover-action-btn" onclick="openQuickView('${product.id}')">Quick View</button>
          <button type="button" class="hover-action-btn primary" onclick="CartStore.addItem('${product.id}', 1)">Add to Bag</button>
        </div>
      </div>

      <div class="product-info">
        <div class="product-category">${categoryUpper}</div>
        <h3 class="product-name">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-price-box">
          <span class="product-price">${formatINR(product.price)}</span>
          ${product.oldPrice && product.oldPrice > product.price ? `<span class="product-old-price">${formatINR(product.oldPrice)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// CART DRAWER INTERACTIONS
function openCartDrawer() {
  const drawer = document.getElementById("royra-cart-drawer");
  const overlay = document.getElementById("royra-drawer-overlay");
  if (drawer && overlay) {
    renderCartDrawer();
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("royra-cart-drawer");
  const overlay = document.getElementById("royra-drawer-overlay");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderCartDrawer() {
  const container = document.getElementById("cart-drawer-items");
  const subtotalEl = document.getElementById("cart-drawer-subtotal");
  const shippingBarText = document.getElementById("shipping-progress-text");
  const shippingBarFill = document.getElementById("shipping-progress-fill");
  if (!container) return;

  const items = CartStore.getItems();
  const subtotal = CartStore.getSubtotal();
  const freeShippingThreshold = 999;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B08D57" stroke-width="1.5" style="margin: 0 auto 16px;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h4 style="font-size: 18px; margin-bottom: 8px;">Your Bag is Empty</h4>
        <p style="font-size: 13px; color: #777; margin-bottom: 20px;">Explore timeless pieces to begin your curated collection.</p>
        <a href="shop.html" class="btn btn-primary" onclick="closeCartDrawer()">Shop New Arrivals</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatINR(0);
    if (shippingBarText) shippingBarText.textContent = "Add ₹999 or more for FREE insured delivery!";
    if (shippingBarFill) shippingBarFill.style.width = "0%";
    return;
  }

  let html = "";
  items.forEach(item => {
    html += `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title"><a href="product.html?id=${item.id}">${item.name}</a></h4>
          <div class="cart-item-meta">${item.metal} • Size: ${item.size}</div>
          <div class="cart-item-price">${formatINR(item.price * item.quantity)}</div>
          
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="CartStore.updateQuantity('${item.cartItemId}', -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="CartStore.updateQuantity('${item.cartItemId}', 1)">+</button>
            </div>
            <button class="cart-remove-btn" onclick="CartStore.removeItem('${item.cartItemId}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);

  if (shippingBarText && shippingBarFill) {
    if (subtotal >= freeShippingThreshold) {
      shippingBarText.innerHTML = `<span style="color: #10B981; font-weight: 700;">✓ You've unlocked FREE Insured Express Shipping!</span>`;
      shippingBarFill.style.width = "100%";
      shippingBarFill.style.backgroundColor = "#10B981";
    } else {
      const remaining = freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      shippingBarText.textContent = `Add ${formatINR(remaining)} more for FREE Insured Express Shipping!`;
      shippingBarFill.style.width = `${pct}%`;
      shippingBarFill.style.backgroundColor = "#B08D57";
    }
  }
}

// QUICK VIEW MODAL
let qvSelectedFinish = "Gold";
let qvSelectedSize = "6";

function openQuickView(productId) {
  const product = ROYRA_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("royra-quickview-modal");
  const content = document.getElementById("quickview-content");
  if (!modal || !content) return;

  qvSelectedFinish = product.finishes ? product.finishes[0] : "Gold";
  qvSelectedSize = (product.sizes && product.sizes[0]) || "Standard";

  const sizeLabel = product.sizeType === "ring" || product.category === "rings"
    ? "Ring Size"
    : (product.sizeType === "bracelet" || product.category === "bracelets"
      ? "Bracelet Size"
      : (product.sizeType === "necklace" || product.category === "necklaces"
        ? "Length"
        : "Size"));

  content.innerHTML = `
    <button class="quickview-close" onclick="closeQuickView()">✕</button>
    <div class="quickview-gallery">
      <img id="qv-main-img" src="${product.image}" alt="${product.name}" />
    </div>
    <div class="quickview-details">
      <span class="product-category-tag">${product.category}</span>
      <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.04em;">${product.name}</h2>
      
      <div class="product-rating" style="margin-bottom: 12px;">
        <span style="color: #B08D57;">★★★★★</span>
        <span class="count">${product.rating || 4.9} (${product.reviewsCount || 24} reviews)</span>
      </div>

      <div class="product-price-box" style="margin-bottom: 14px;">
        <span style="font-size: 22px; font-weight: 700; color: #171717;">${formatINR(product.price)}</span>
        ${product.oldPrice ? `<span class="product-old-price">${formatINR(product.oldPrice)}</span>` : ''}
        <span class="pdp-tax-badge" style="font-size: 11px;">Inclusive of all taxes</span>
      </div>

      <p style="font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 16px;">${product.description}</p>

      <!-- FINISH SELECTOR -->
      ${product.finishes && product.finishes.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">Finish: <strong id="qv-finish-label" style="color: #171717;">${qvSelectedFinish.toUpperCase()}</strong></label>
          <div class="finish-options-row">
            ${product.finishes.map(f => `
              <button type="button" class="finish-btn ${f === qvSelectedFinish ? 'active' : ''}" onclick="selectQuickViewFinish(this, '${f}')">${f.toUpperCase()}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- SIZE SELECTOR -->
      ${product.sizes && product.sizes.length > 1 ? `
        <div style="margin-bottom: 18px;">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">${sizeLabel}: <strong id="qv-size-label" style="color: #171717;">${qvSelectedSize}</strong></label>
          <div class="size-options-grid">
            ${product.sizes.map(s => `
              <button type="button" class="size-btn ${s === qvSelectedSize ? 'active' : ''}" onclick="selectQuickViewSize(this, '${s}')">${s}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; margin-top: auto; padding-top: 10px;">
        <button class="btn btn-primary" style="flex: 1.2;" onclick="addQuickViewToCart('${product.id}')">Add to Bag</button>
        <a href="product.html?id=${product.id}" class="btn btn-outline" style="flex: 1;">View Product</a>
      </div>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function selectQuickViewFinish(btn, finish) {
  qvSelectedFinish = finish;
  const label = document.getElementById("qv-finish-label");
  if (label) label.textContent = finish.toUpperCase();
  btn.closest(".finish-options-row").querySelectorAll(".finish-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectQuickViewSize(button, size) {
  qvSelectedSize = size;
  const label = document.getElementById("qv-size-label");
  if (label) label.textContent = size;
  button.closest(".size-options-grid").querySelectorAll(".size-btn").forEach(p => p.classList.remove("active"));
  button.classList.add("active");
}

function addQuickViewToCart(productId) {
  CartStore.addItem(productId, 1, qvSelectedSize, qvSelectedFinish);
  closeQuickView();
}

function closeQuickView() {
  const modal = document.getElementById("royra-quickview-modal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// LIVE SEARCH OVERLAY
function openSearchModal() {
  const modal = document.getElementById("royra-search-modal");
  const input = document.getElementById("royra-search-input");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (input) {
      input.value = "";
      input.focus();
      handleSearchQuery("");
    }
  }
}

function closeSearchModal() {
  const modal = document.getElementById("royra-search-modal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function handleSearchQuery(query) {
  const resultsContainer = document.getElementById("search-results-list");
  if (!resultsContainer) return;

  const clean = query.trim().toLowerCase();
  let matches = ROYRA_PRODUCTS;

  if (clean.length > 0) {
    matches = ROYRA_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(clean) ||
      p.category.toLowerCase().includes(clean) ||
      p.description.toLowerCase().includes(clean) ||
      p.collection.toLowerCase().includes(clean)
    );
  }

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p style="font-size: 15px; color: #555;">No products matching "${query}" found.</p>
        <p style="font-size: 13px; color: #888; margin-top: 6px;">Try searching for "Solitaire", "Rings", "Emerald", or "Tennis Bracelet".</p>
      </div>
    `;
    return;
  }

  let html = `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 12px;">${clean ? 'Search Results (' + matches.length + ')' : 'Trending Jewels'}</div>`;
  matches.slice(0, 6).forEach(product => {
    html += `
      <a href="product.html?id=${product.id}" class="search-item" onclick="closeSearchModal()">
        <div class="search-thumb">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="search-info">
          <div class="search-title">${product.name}</div>
          <div style="font-size: 12px; color: #666; text-transform: capitalize;">${product.category} • ${product.material}</div>
        </div>
        <div class="search-price">${formatINR(product.price)}</div>
      </a>
    `;
  });

  resultsContainer.innerHTML = html;
}

// HERO CAROUSEL CONTROLLER
let heroCurrentSlide = 0;
let heroInterval = null;

function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  if (slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
    });
    heroCurrentSlide = index;
  }

  window.setHeroSlide = function(index) {
    showSlide(index);
    resetHeroTimer();
  };

  window.nextHeroSlide = function() {
    let next = (heroCurrentSlide + 1) % slides.length;
    showSlide(next);
    resetHeroTimer();
  };

  window.prevHeroSlide = function() {
    let prev = (heroCurrentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
    resetHeroTimer();
  };

  function startHeroTimer() {
    heroInterval = setInterval(() => {
      let next = (heroCurrentSlide + 1) % slides.length;
      showSlide(next);
    }, 6000);
  }

  function resetHeroTimer() {
    clearInterval(heroInterval);
    startHeroTimer();
  }

  startHeroTimer();
}

// MOBILE DRAWER CONTROLLER
function toggleMobileMenu() {
  const drawer = document.getElementById("royra-mobile-drawer");
  const overlay = document.getElementById("royra-drawer-overlay");
  if (drawer && overlay) {
    const isOpen = drawer.classList.contains("open");
    if (isOpen) {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    } else {
      drawer.classList.add("open");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }
}

// BEST SELLERS DYNAMIC TAB FILTER
function filterBestSellers(category, button) {
  const container = document.getElementById("bestsellers-grid");
  if (!container) return;

  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  if (button) button.classList.add("active");

  let filtered = ROYRA_PRODUCTS.filter(p => p.isBestSeller);
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (filtered.length === 0) {
    filtered = ROYRA_PRODUCTS.filter(p => p.category === category);
  }

  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
  updateWishlistButtonStates();
}

// NEW & BEST TABS (HOMEPAGE)
function switchNewBestTab(tabType, button) {
  const container = document.getElementById("new-and-best-grid");
  if (!container) return;

  document.querySelectorAll(".new-best-tab").forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  if (button) {
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
  }

  let products = [];
  if (tabType === 'best') {
    products = ROYRA_PRODUCTS.filter(p => p.isBestSeller).slice(0, 8);
    if (products.length < 8) {
      const rest = ROYRA_PRODUCTS.filter(p => !products.includes(p));
      products = [...products, ...rest].slice(0, 8);
    }
  } else {
    // New Arrivals
    products = ROYRA_PRODUCTS.filter(p => p.isNew).slice(0, 8);
    if (products.length < 8) {
      const rest = ROYRA_PRODUCTS.filter(p => !products.includes(p));
      products = [...products, ...rest].slice(0, 8);
    }
  }

  container.innerHTML = products.map(p => createProductCardHTML(p)).join('');
  updateWishlistButtonStates();
}

// PAGE-SPECIFIC INITIALIZERS
function initHomePage() {
  // Homepage Dynamic New & Best Grid (8 Products)
  const newAndBestGrid = document.getElementById("new-and-best-grid");
  if (newAndBestGrid) {
    const items = ROYRA_PRODUCTS.filter(p => p.isNew).slice(0, 8);
    newAndBestGrid.innerHTML = items.map(p => createProductCardHTML(p)).join('');
  }

  // New Arrivals (8 Products)
  const newArrivalsGrid = document.getElementById("new-arrivals-grid");
  if (newArrivalsGrid) {
    const items = ROYRA_PRODUCTS.filter(p => p.isNew).slice(0, 8);
    newArrivalsGrid.innerHTML = items.map(p => createProductCardHTML(p)).join('');
  }

  // Best Sellers (8 Products)
  const bestsellersGrid = document.getElementById("bestsellers-grid");
  if (bestsellersGrid) {
    const bestsellers = ROYRA_PRODUCTS.filter(p => p.isBestSeller).slice(0, 8);
    bestsellersGrid.innerHTML = bestsellers.map(p => createProductCardHTML(p)).join('');
  }

  // Iconic Showcase Scroll
  const iconicGrid = document.getElementById("iconic-showcase-grid");
  if (iconicGrid) {
    const iconic = ROYRA_PRODUCTS.filter(p => p.isIconic || p.isBestSeller).slice(0, 8);
    iconicGrid.innerHTML = iconic.map(p => createProductCardHTML(p)).join('');
  }

  initHeroSlider();
}

// SHOP PAGE LOGIC & LUXURY COLLECTION CONTROLS
let currentGridColumns = 4;

function initShopPage() {
  const shopGrid = document.getElementById("shop-products-grid");
  if (!shopGrid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || urlParams.get("cat");
  const initialFilter = urlParams.get("filter");

  // Dynamic Editorial Collection Header
  const headingEl = document.getElementById("shop-page-heading");
  const descEl = document.getElementById("shop-page-desc");

  if (initialCategory === "rings" || !initialCategory) {
    if (headingEl) headingEl.textContent = "RINGS";
    if (descEl) descEl.textContent = "Discover timeless rings designed to be worn every day.";
    document.title = "Rings Collection | Royra Jewels";
  } else if (initialCategory === "earrings") {
    if (headingEl) headingEl.textContent = "EARRINGS";
    if (descEl) descEl.textContent = "Discover handcrafted earrings designed for subtle everyday radiance.";
    document.title = "Earrings Collection | Royra Jewels";
  } else if (initialCategory === "bracelets") {
    if (headingEl) headingEl.textContent = "BRACELETS";
    if (descEl) descEl.textContent = "Discover tennis bracelets and artisan cuffs handcrafted in pure metals.";
    document.title = "Bracelets Collection | Royra Jewels";
  } else if (initialCategory === "necklaces") {
    if (headingEl) headingEl.textContent = "NECKLACES";
    if (descEl) descEl.textContent = "Discover heirloom pendants and diamond chokers crafted for timeless luxury.";
    document.title = "Necklaces Collection | Royra Jewels";
  }

  if (initialCategory) {
    const catCheckboxes = document.querySelectorAll(`input[name="filter-cat"][value="${initialCategory}"]`);
    catCheckboxes.forEach(cb => cb.checked = true);
  }

  if (initialFilter === "bestseller") {
    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) sortSelect.value = "bestseller";
  }

  // Click outside to close dropdowns
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-dropdown-container")) {
      closeAllFilterDropdowns();
    }
  });

  renderFilteredShop();

  // Listen to filter changes
  document.querySelectorAll(".shop-filter-input").forEach(input => {
    input.addEventListener("change", () => {
      updateFilterDropdownBadges();
      renderFilteredShop();
    });
  });

  const sortSelect = document.getElementById("shop-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", renderFilteredShop);
  }
}

// Toggle Horizontal Filter Row Visibility
function toggleDesktopFilters() {
  const bar = document.getElementById("horizontal-filters-bar");
  const toggleBtn = document.getElementById("filter-toggle-btn");
  const toggleText = document.getElementById("filter-toggle-text");
  if (!bar) return;

  const isHidden = bar.classList.toggle("hidden-filters");
  if (toggleText) {
    toggleText.textContent = isHidden ? "Show Filter" : "Hide Filter";
  }
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", isHidden ? "false" : "true");
  }
  if (isHidden) {
    closeAllFilterDropdowns();
  }
}

// Toggle specific filter dropdown menu
function toggleFilterDropdown(type) {
  const container = document.getElementById(`filter-dd-${type}`);
  if (!container) return;

  const wasOpen = container.classList.contains("open");
  closeAllFilterDropdowns();

  if (!wasOpen) {
    container.classList.add("open");
  }
}

function closeAllFilterDropdowns() {
  document.querySelectorAll(".filter-dropdown-container.open").forEach(el => {
    el.classList.remove("open");
  });
}

// Grid View Column Switcher (4, 3, or 2 columns)
function setGridColumns(cols) {
  currentGridColumns = cols;
  const grid = document.getElementById("shop-products-grid");
  if (!grid) return;

  grid.classList.remove("grid-col-4", "grid-col-3", "grid-col-2");
  grid.classList.add(`grid-col-${cols}`);

  // Update view button active states
  ["2", "3", "4"].forEach(c => {
    const btn = document.getElementById(`view-col-${c}-btn`);
    if (btn) {
      if (parseInt(c) === cols) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
}

// Update badges on horizontal dropdown buttons
function updateFilterDropdownBadges() {
  const types = ["type", "finish", "stone", "size", "price"];

  types.forEach(t => {
    const checked = document.querySelectorAll(`input[name="filter-${t}"]:checked`);
    const badge = document.getElementById(`badge-count-${t}`);
    const container = document.getElementById(`filter-dd-${t}`);

    if (badge && container) {
      if (checked.length > 0) {
        badge.textContent = checked.length;
        badge.style.display = "inline-flex";
        container.classList.add("has-selected");
      } else {
        badge.style.display = "none";
        container.classList.remove("has-selected");
      }
    }
  });

  const resetLink = document.getElementById("filter-reset-link");
  const totalChecked = document.querySelectorAll('.shop-filter-input:checked:not([name="filter-instock"])').length;
  if (resetLink) {
    resetLink.style.display = totalChecked > 0 ? "inline-block" : "none";
  }
}

function renderFilteredShop() {
  const grid = document.getElementById("shop-products-grid");
  const countEl = document.getElementById("shop-product-count");
  const chipsBar = document.getElementById("active-filter-chips");
  if (!grid) return;

  // Filter values
  const selectedCats = Array.from(document.querySelectorAll('input[name="filter-cat"]:checked')).map(cb => cb.value);
  const selectedTypes = Array.from(document.querySelectorAll('input[name="filter-type"]:checked')).map(cb => cb.value);
  const selectedFinishes = Array.from(document.querySelectorAll('input[name="filter-finish"]:checked')).map(cb => cb.value);
  const selectedStones = Array.from(document.querySelectorAll('input[name="filter-stone"]:checked')).map(cb => cb.value);
  const selectedSizes = Array.from(document.querySelectorAll('input[name="filter-size"]:checked')).map(cb => cb.value);
  const selectedPriceRanges = Array.from(document.querySelectorAll('input[name="filter-price"]:checked')).map(cb => cb.value);
  const inStockOnly = document.querySelector('input[name="filter-instock"]')?.checked ?? false;

  // Update badges
  updateFilterDropdownBadges();

  // Active filter chips
  if (chipsBar) {
    let activeList = [];
    selectedCats.forEach(c => activeList.push({ label: `${c.toUpperCase()}`, name: "filter-cat", val: c }));
    selectedTypes.forEach(t => activeList.push({ label: `${t}`, name: "filter-type", val: t }));
    selectedFinishes.forEach(f => activeList.push({ label: `${f}`, name: "filter-finish", val: f }));
    selectedStones.forEach(s => activeList.push({ label: `${s}`, name: "filter-stone", val: s }));
    selectedSizes.forEach(sz => activeList.push({ label: `Size: ${sz}`, name: "filter-size", val: sz }));
    selectedPriceRanges.forEach(p => {
      let pLabel = p;
      if (p === "under-5k") pLabel = "Under ₹5,000";
      if (p === "5k-10k") pLabel = "₹5,000 – ₹10,000";
      if (p === "10k-20k") pLabel = "₹10,000 – ₹20,000";
      if (p === "above-20k") pLabel = "Above ₹20,000";
      activeList.push({ label: `${pLabel}`, name: "filter-price", val: p });
    });

    if (activeList.length > 0) {
      chipsBar.style.display = "flex";
      chipsBar.innerHTML = `
        ${activeList.map(chip => `
          <button type="button" class="filter-chip" onclick="removeFilterChip('${chip.name}', '${chip.val}')">
            <span>${chip.label}</span>
            <span class="chip-x">✕</span>
          </button>
        `).join('')}
        <button type="button" class="filter-chip-clear" onclick="resetShopFilters()">Clear All</button>
      `;
    } else {
      chipsBar.style.display = "none";
      chipsBar.innerHTML = "";
    }
  }

  let filtered = ROYRA_PRODUCTS.filter(product => {
    if (inStockOnly && !product.inStock) return false;
    if (selectedCats.length > 0 && !selectedCats.includes(product.category)) return false;
    
    if (selectedTypes.length > 0) {
      const matchType = selectedTypes.some(t => {
        if (product.productType && product.productType.toLowerCase().includes(t.toLowerCase())) return true;
        if (product.name && product.name.toLowerCase().includes(t.toLowerCase())) return true;
        return false;
      });
      if (!matchType) return false;
    }

    if (selectedFinishes.length > 0) {
      const matchFinish = selectedFinishes.some(f => {
        if (product.finishes && product.finishes.some(pf => pf.toLowerCase().includes(f.toLowerCase()))) return true;
        if (product.material && product.material.toLowerCase().includes(f.toLowerCase())) return true;
        return false;
      });
      if (!matchFinish) return false;
    }

    if (selectedStones.length > 0) {
      const matchStone = selectedStones.some(s => {
        if (product.stoneCategory && product.stoneCategory.toLowerCase().includes(s.toLowerCase())) return true;
        if (product.stone && product.stone.toLowerCase().includes(s.toLowerCase())) return true;
        return false;
      });
      if (!matchStone) return false;
    }

    if (selectedSizes.length > 0) {
      const matchSize = selectedSizes.some(sz => product.sizes && product.sizes.includes(sz));
      if (!matchSize) return false;
    }

    if (selectedPriceRanges.length > 0) {
      const match = selectedPriceRanges.some(range => {
        if (range === "under-5k") return product.price < 5000;
        if (range === "5k-10k") return product.price >= 5000 && product.price <= 10000;
        if (range === "10k-20k") return product.price > 10000 && product.price <= 20000;
        if (range === "above-20k") return product.price > 20000;
        return true;
      });
      if (!match) return false;
    }

    return true;
  });

  // Sorting
  const sortVal = document.getElementById("shop-sort-select")?.value || "featured";
  if (sortVal === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortVal === "rating") {
    filtered.sort((a, b) => (b.rating || 4.9) - (a.rating || 4.9));
  } else if (sortVal === "newest") {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else if (sortVal === "bestseller") {
    filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  if (countEl) {
    countEl.textContent = `${filtered.length} Product${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: #FAF9F7; border-radius: 4px; border: 1px dashed #E5E2DC;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A68B5B" stroke-width="1.5" style="margin: 0 auto 14px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-family: var(--font-serif); font-size: 20px; font-weight: 500; margin-bottom: 8px; color: #1F1F1F;">No matching jewels found</h3>
        <p style="color: #666; max-width: 420px; margin: 0 auto 20px; font-size: 14px;">We couldn't find pieces matching all selected criteria. Try adjusting or clearing your filters.</p>
        <button class="btn btn-primary" onclick="resetShopFilters()" style="background-color: #1F1F1F; color: #FFFFFF; padding: 10px 24px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
  updateWishlistButtonStates();
}

function removeFilterChip(name, value) {
  const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (checkbox) checkbox.checked = false;
  updateFilterDropdownBadges();
  renderFilteredShop();
}

function resetShopFilters() {
  document.querySelectorAll(".shop-filter-input").forEach(cb => {
    if (cb.name === "filter-instock") {
      cb.checked = true;
    } else {
      cb.checked = false;
    }
  });
  updateFilterDropdownBadges();
  renderFilteredShop();
}

function openMobileFilters() {
  const sidebar = document.getElementById("shop-filter-sidebar");
  if (sidebar) {
    sidebar.classList.add("mobile-open");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileFilters() {
  const sidebar = document.getElementById("shop-filter-sidebar");
  if (sidebar) {
    sidebar.classList.remove("mobile-open");
    document.body.style.overflow = "";
  }
}

// PRODUCT DETAIL PAGE LOGIC
let currentPdpProduct = null;
let currentPdpSize = "6";
let currentPdpFinish = "Gold";

function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || "royra-ring-01";

  const product = ROYRA_PRODUCTS.find(p => p.id === productId) || ROYRA_PRODUCTS[0];
  currentPdpProduct = product;
  
  // Set default size
  if (product.sizes && product.sizes.length > 0) {
    currentPdpSize = product.sizes[0];
  } else if (product.category === "rings") {
    currentPdpSize = "6";
  } else {
    currentPdpSize = "Standard";
  }
  
  currentPdpFinish = (product.finishes && product.finishes[0]) || "Gold";

  // Document Title
  document.title = `${product.name} | Royra Jewels`;

  // Breadcrumbs
  const breadcrumbCat = document.getElementById("pdp-breadcrumb-cat");
  if (breadcrumbCat) {
    const catName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    breadcrumbCat.textContent = catName;
    breadcrumbCat.href = `shop.html?category=${product.category}`;
  }

  const breadcrumbName = document.getElementById("pdp-breadcrumb-name");
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Title, Badges & Price
  const nameEl = document.getElementById("pdp-product-name");
  if (nameEl) nameEl.textContent = product.name.toUpperCase();

  const badgeTag = document.getElementById("pdp-badge-tag");
  if (badgeTag) {
    if (product.badge) {
      badgeTag.textContent = product.badge.toUpperCase();
      badgeTag.style.display = "inline-block";
    } else {
      badgeTag.textContent = "BESTSELLER";
      badgeTag.style.display = "inline-block";
    }
  }

  const ratingScore = document.getElementById("pdp-rating-score");
  if (ratingScore) ratingScore.textContent = product.rating ? product.rating.toFixed(1) : "4.9";

  const reviewsCount = document.getElementById("pdp-reviews-count");
  if (reviewsCount) reviewsCount.textContent = `(${product.reviewsCount || 24} Reviews)`;

  const priceEl = document.getElementById("pdp-product-price");
  if (priceEl) priceEl.textContent = formatINR(product.price);

  const oldPriceEl = document.getElementById("pdp-product-old-price");
  if (oldPriceEl) {
    if (product.oldPrice) {
      oldPriceEl.textContent = formatINR(product.oldPrice);
      oldPriceEl.style.display = "inline";
    } else {
      oldPriceEl.style.display = "none";
    }
  }

  // Stock availability banner
  const stockText = document.getElementById("pdp-stock-text");
  if (stockText) {
    stockText.textContent = product.availability || "Almost gone! Order soon";
  }

  // Description
  const descEl = document.getElementById("pdp-product-desc");
  if (descEl) descEl.textContent = product.description;

  // Specs Table (DETAILS)
  const specsTable = document.getElementById("pdp-specs-table");
  if (specsTable) {
    const sizeDisplay = product.sizes ? product.sizes.join(', ') : "Standard Comfort Fit";
    specsTable.innerHTML = `
      <div class="spec-entry">
        <span class="spec-k">Material:</span>
        <span class="spec-v">${product.material}</span>
      </div>
      ${product.plating ? `
        <div class="spec-entry">
          <span class="spec-k">Metal Plating:</span>
          <span class="spec-v">${product.plating}</span>
        </div>
      ` : ''}
      <div class="spec-entry">
        <span class="spec-k">Stone & Cut:</span>
        <span class="spec-v">${product.stone}</span>
      </div>
      ${product.dimensions ? `
        <div class="spec-entry">
          <span class="spec-k">Dimensions:</span>
          <span class="spec-v">${product.dimensions}</span>
        </div>
      ` : ''}
      ${product.weight ? `
        <div class="spec-entry">
          <span class="spec-k">Weight:</span>
          <span class="spec-v">${product.weight}</span>
        </div>
      ` : ''}
      <div class="spec-entry">
        <span class="spec-k">Available Sizes:</span>
        <span class="spec-v">${sizeDisplay}</span>
      </div>
      <div class="spec-entry">
        <span class="spec-k">Hypoallergenic:</span>
        <span class="spec-v">100% Nickel-free & Lead-free (Sensitive Skin Safe)</span>
      </div>
      <div class="spec-entry">
        <span class="spec-k">Country of Origin:</span>
        <span class="spec-v">${product.countryOfOrigin || 'India'}</span>
      </div>
    `;
  }

  // Gallery: Vertical Thumbnails Rail + Main Image
  const mainImg = document.getElementById("pdp-main-image");
  if (mainImg) mainImg.src = product.image;

  const thumbsContainer = document.getElementById("pdp-thumbs-list");
  if (thumbsContainer) {
    let imagesList = [];
    if (product.gallery && product.gallery.length > 0) {
      imagesList = [...product.gallery];
    } else {
      imagesList = [product.image];
    }

    if (product.secondImage && !imagesList.includes(product.secondImage)) {
      imagesList.splice(1, 0, product.secondImage);
    }

    // Ensure 4 thumbnails
    const extraFallbacks = [
      "assets/products/product-01.jpg",
      "assets/products/product-02.jpg",
      "assets/products/product-03.jpg",
      "assets/products/product-04.jpg"
    ];
    for (const fb of extraFallbacks) {
      if (imagesList.length < 4 && !imagesList.includes(fb)) {
        imagesList.push(fb);
      }
    }

    thumbsContainer.innerHTML = imagesList.map((img, idx) => `
      <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="setPdpImage('${img}', this)" aria-label="View product angle ${idx + 1}">
        <img src="${img}" alt="${product.name} view ${idx + 1}" />
      </button>
    `).join('');
  }

  // Finish Options
  const finishContainer = document.getElementById("pdp-finish-options");
  const finishLabel = document.getElementById("pdp-selected-finish-label");
  if (finishContainer) {
    const finishes = product.finishes && product.finishes.length > 0 ? product.finishes : ["Gold", "Silver", "Rose Gold"];
    finishContainer.innerHTML = finishes.map((f, idx) => `
      <button type="button" class="finish-btn ${idx === 0 ? 'active' : ''}" data-finish="${f}" onclick="setPdpFinish('${f}', this)">${f.toUpperCase()}</button>
    `).join('');
    if (finishLabel) finishLabel.textContent = finishes[0].toUpperCase();
  }

  // Size Options (Category aware)
  const sizeContainer = document.getElementById("pdp-size-selector");
  const sizeBlockTitle = document.querySelector(".pdp-selection-block:nth-of-type(2) .block-title");
  
  if (sizeBlockTitle) {
    if (product.sizeType === "bracelet" || product.category === "bracelets") {
      sizeBlockTitle.textContent = "BRACELET SIZE";
    } else if (product.sizeType === "necklace" || product.category === "necklaces") {
      sizeBlockTitle.textContent = "LENGTH";
    } else {
      sizeBlockTitle.textContent = "RING SIZE";
    }
  }

  if (sizeContainer) {
    const sizeList = product.category === "rings"
      ? ["4", "5", "6", "7", "8", "9", "10", "11", "12"]
      : (product.sizes && product.sizes.length > 0 ? product.sizes : ["Small", "Medium", "Large"]);
    
    currentPdpSize = sizeList[0] || "6";

    sizeContainer.innerHTML = sizeList.map((s, idx) => `
      <button type="button" class="size-btn ${idx === 0 ? 'active' : ''}" onclick="setPdpSize('${s}', this)">
        ${s}
      </button>
    `).join('');
  }

  // Wishlist button state
  updatePdpWishlistState();

  // Related Products
  const relatedGrid = document.getElementById("pdp-related-grid");
  if (relatedGrid) {
    const related = ROYRA_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
    const fallback = related.length > 0 ? related : ROYRA_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = fallback.map(p => createProductCardHTML(p)).join('');
  }

  updateWishlistButtonStates();
}

function setPdpImage(src, thumbBtn) {
  const mainImg = document.getElementById("pdp-main-image");
  if (mainImg) mainImg.src = src;
  document.querySelectorAll(".pdp-thumb-btn").forEach(t => t.classList.remove("active"));
  if (thumbBtn) thumbBtn.classList.add("active");
}

function setPdpFinish(finishName, btn) {
  currentPdpFinish = finishName;
  const label = document.getElementById("pdp-selected-finish-label");
  if (label) label.textContent = finishName.toUpperCase();
  document.querySelectorAll("#pdp-finish-options .finish-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function setPdpSize(size, btn) {
  currentPdpSize = size;
  document.querySelectorAll("#pdp-size-selector .size-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function incrementPdpQty() {
  const input = document.getElementById("pdp-qty-input");
  if (input) {
    input.value = Math.min(10, parseInt(input.value || "1", 10) + 1);
  }
}

function decrementPdpQty() {
  const input = document.getElementById("pdp-qty-input");
  if (input) {
    input.value = Math.max(1, parseInt(input.value || "1", 10) - 1);
  }
}

function addCurrentPdpToCart() {
  if (!currentPdpProduct) return;
  const qty = parseInt(document.getElementById("pdp-qty-input")?.value || "1", 10);
  CartStore.addItem(currentPdpProduct.id, qty, currentPdpSize, currentPdpFinish);
}

function buyCurrentPdpNow() {
  if (!currentPdpProduct) return;
  const qty = parseInt(document.getElementById("pdp-qty-input")?.value || "1", 10);
  CartStore.addItem(currentPdpProduct.id, qty, currentPdpSize, currentPdpFinish);
  window.location.href = "cart.html";
}

function updatePdpWishlistState() {
  if (!currentPdpProduct) return;
  const btn = document.getElementById("pdp-wishlist-btn");
  const label = document.getElementById("pdp-wishlist-label");
  if (!btn || !label) return;

  const inWishlist = WishlistStore.hasItem(currentPdpProduct.id);
  if (inWishlist) {
    btn.classList.add("in-wishlist");
    label.textContent = "SAVED IN WISHLIST";
  } else {
    btn.classList.remove("in-wishlist");
    label.textContent = "ADD TO WISHLIST";
  }
}

function togglePdpWishlist() {
  if (!currentPdpProduct) return;
  WishlistStore.toggleItem(currentPdpProduct.id);
  updatePdpWishlistState();
  updateGlobalBadges();
}

function openSizeGuideModal() {
  const modal = document.getElementById("royra-sizeguide-modal");
  if (modal) modal.classList.add("open");
}

function closeSizeGuideModal() {
  const modal = document.getElementById("royra-sizeguide-modal");
  if (modal) modal.classList.remove("open");
}

function togglePdpAcc(btn) {
  const pane = btn.closest(".pdp-accordion-pane");
  if (pane) {
    pane.classList.toggle("open");
  }
}

function checkPincodeDelivery() {
  const input = document.getElementById("pdp-pincode-input");
  const result = document.getElementById("pdp-pincode-result");
  if (!input || !result) return;

  const pin = input.value.trim();
  if (pin.length === 6 && !isNaN(pin)) {
    result.innerHTML = `<span style="color: #10B981; font-weight: 600;">✓ Express delivery available for ${pin}! Estimated arrival in 2–4 business days with insured courier.</span>`;
  } else {
    result.innerHTML = `<span style="color: #B91C1C; font-weight: 500;">Please enter a valid 6-digit Indian postal code (e.g. 400001).</span>`;
  }
}

// ACCORDION HELPER
function toggleAccordion(header) {
  const item = header.parentElement;
  item.classList.toggle("open");
}

// CART PAGE FULL LOGIC
function renderCartPage() {
  const tableBody = document.getElementById("cart-page-items");
  const subtotalEl = document.getElementById("cart-page-subtotal");
  const discountRow = document.getElementById("cart-page-discount-row");
  const discountVal = document.getElementById("cart-page-discount-val");
  const totalEl = document.getElementById("cart-page-total");
  if (!tableBody) return;

  const items = CartStore.getItems();
  const subtotal = CartStore.getSubtotal();
  const appliedCoupon = localStorage.getItem(StorageKeys.APPLIED_COUPON);

  let discount = 0;
  if (appliedCoupon === "ROYRA10") {
    discount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === "WELCOME500") {
    discount = Math.min(500, subtotal);
  }

  const grandTotal = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    document.getElementById("cart-page-content").innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h2 style="font-size: 28px; margin-bottom: 12px;">Your Shopping Bag is Empty</h2>
        <p style="color: #666; max-width: 440px; margin: 0 auto 30px;">Discover handcrafted solitaires, tennis bracelets, and diamond heirlooms designed to shine with you.</p>
        <a href="shop.html" class="btn btn-primary">Explore All Jewellery</a>
      </div>
    `;
    return;
  }

  tableBody.innerHTML = items.map(item => `
    <div class="cart-item" style="padding: 24px 0; border-bottom: 1px solid #E8E4DD; display: flex; gap: 20px; align-items: center;">
      <div style="width: 100px; height: 100px; border-radius: 4px; background: #F8F6F2; overflow: hidden; flex-shrink: 0;">
        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"><a href="product.html?id=${item.id}">${item.name}</a></h3>
        <p style="font-size: 13px; color: #777; margin-bottom: 8px;">${item.metal} • Size: ${item.size}</p>
        <div style="font-size: 15px; font-weight: 700; color: #171717;">${formatINR(item.price)} each</div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="CartStore.updateQuantity('${item.cartItemId}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="CartStore.updateQuantity('${item.cartItemId}', 1)">+</button>
        </div>
        <div style="font-size: 16px; font-weight: 700; width: 100px; text-align: right;">${formatINR(item.price * item.quantity)}</div>
        <button onclick="CartStore.removeItem('${item.cartItemId}')" style="color: #999; padding: 6px;" title="Remove Item">✕</button>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (totalEl) totalEl.textContent = formatINR(grandTotal);

  if (discountRow && discountVal) {
    if (discount > 0) {
      discountRow.style.display = "flex";
      discountVal.textContent = `-${formatINR(discount)} (${appliedCoupon})`;
    } else {
      discountRow.style.display = "none";
    }
  }
}

function applyCouponCode() {
  const input = document.getElementById("coupon-code-input");
  const msg = document.getElementById("coupon-msg");
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (code === "ROYRA10") {
    localStorage.setItem(StorageKeys.APPLIED_COUPON, "ROYRA10");
    if (msg) msg.innerHTML = `<span style="color: #10B981;">Coupon applied! 10% instant discount unlocked.</span>`;
    showToast("Coupon ROYRA10 Applied! 10% OFF");
    renderCartPage();
  } else if (code === "WELCOME500") {
    localStorage.setItem(StorageKeys.APPLIED_COUPON, "WELCOME500");
    if (msg) msg.innerHTML = `<span style="color: #10B981;">Welcome coupon applied! ₹500 off your order.</span>`;
    showToast("Coupon WELCOME500 Applied!");
    renderCartPage();
  } else {
    if (msg) msg.innerHTML = `<span style="color: #8B2635;">Invalid coupon code. Try ROYRA10 for 10% off.</span>`;
  }
}

function simulateCheckout() {
  const items = CartStore.getItems();
  if (items.length === 0) {
    showToast("Your shopping bag is empty");
    return;
  }

  const modal = document.getElementById("checkout-simulation-modal");
  if (modal) {
    modal.classList.add("open");
  } else {
    alert("Thank you for choosing ROYRA JEWELS! Your order has been placed with VIP White Glove handling.");
    CartStore.saveItems([]);
    window.location.href = "index.html";
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-simulation-modal");
  if (modal) modal.classList.remove("open");
}

function confirmSimulatedOrder() {
  CartStore.saveItems([]);
  localStorage.removeItem(StorageKeys.APPLIED_COUPON);
  closeCheckoutModal();
  showToast("Order Confirmed! Tracking details sent to your phone.");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// WISHLIST PAGE LOGIC
function renderWishlistPage() {
  const grid = document.getElementById("wishlist-grid");
  const emptyState = document.getElementById("wishlist-empty-state");
  if (!grid) return;

  const savedIds = WishlistStore.getItems();
  const products = ROYRA_PRODUCTS.filter(p => savedIds.includes(p.id));

  if (products.length === 0) {
    grid.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
  } else {
    grid.style.display = "grid";
    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = products.map(p => createProductCardHTML(p)).join('');
  }

  updateWishlistButtonStates();
}

// NEWSLETTER SUBMISSION
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input && input.value) {
    showToast(`Welcome to the Royra Circle, ${input.value}!`);
    input.value = "";
  }
}

// CONTACT CONCIERGE FORM
function handleContactSubmit(e) {
  e.preventDefault();
  showToast("Thank you for reaching out. Our Jewelry Concierge will connect with you within 2 business hours.");
  e.target.reset();
}

// INITIALIZE ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
  updateGlobalBadges();

  // Header scroll detection
  const headerWrapper = document.querySelector(".header-wrapper");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      headerWrapper?.classList.add("scrolled");
    } else {
      headerWrapper?.classList.remove("scrolled");
    }
  });

  // Page Routing based on filename
  const path = window.location.pathname;
  if (path.endsWith("shop.html")) {
    initShopPage();
  } else if (path.endsWith("product.html")) {
    initProductPage();
  } else if (path.endsWith("cart.html")) {
    renderCartPage();
  } else if (path.endsWith("wishlist.html")) {
    renderWishlistPage();
  } else {
    // Default homepage
    initHomePage();
  }
});
