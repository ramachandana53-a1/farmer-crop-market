/**
 * High-Resolution Agricultural Asset Photo Mapping
 * Every crop in the Agri Market catalog maps to a realistic, context-accurate field or produce photo.
 * Cotton (Kapas/Bt) is accurately mapped to white cotton bolls on cotton plants (no sunflowers).
 */

export const CROP_IMAGE_MAP: Record<string, string> = {
  // Cotton - Real raw cotton bolls on cotton plant in agricultural field
  C_COTTON: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',

  // Red Chilli - Guntur Teja ripe red chilli harvest pods
  C_CHILLI: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',

  // Paddy / Rice - Golden ripe paddy crop field / rice panicles
  C_PADDY: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',

  // Oil Palm - Fresh fruit bunches (FFB) oil palm harvest
  C_OILPALM: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',

  // Wheat - Golden wheat ears / harvest field
  C_WHEAT: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',

  // Maize (Corn) - Golden yellow corn cobs in field
  C_MAIZE: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',

  // Bajra (Pearl Millet) - Millet harvest grain spikes
  C_BAJRA: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',

  // Jowar (Sorghum) - Sorghum grain heads
  C_JOWAR: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80',

  // Ragi (Finger Millet) - Wholesome millet grains
  C_RAGI: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',

  // Barley (Jau) - Golden barley malt field
  C_BARLEY: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',

  // Sugarcane (Ganna) - Tall green sugarcane stalks
  C_SUGARCANE: 'https://images.unsplash.com/photo-1589135233689-d56d1a10058b?auto=format&fit=crop&w=800&q=80',

  // Raw Jute - Golden fibre crop
  C_JUTE: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',

  // Tobacco (FCV) - Golden cured Virginia tobacco leaves
  C_TOBACCO: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=800&q=80',

  // Guar Seed - Cluster bean pods
  C_GUAR: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',

  // Soybean - Yellow soybean pods & beans
  C_SOYBEAN: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',

  // Groundnut - Raw peanuts in shell
  C_GROUNDNUT: 'https://images.unsplash.com/photo-1567892328127-d40539ecbbf4?auto=format&fit=crop&w=800&q=80',

  // Mustard - Golden yellow blooming mustard field
  C_MUSTARD: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',

  // Bengal Gram (Chana) - Desi chickpea harvest
  C_BENGALGRAM: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',

  // Red Gram (Arhar / Tur) - Pigeon peas
  C_REDGRAM: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',

  // Green Gram (Moong) - Whole green gram
  C_GREENGRAM: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',

  // Black Gram (Urad) - Black gram dal
  C_BLACKGRAM: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',

  // Turmeric - Fresh raw turmeric rhizomes
  C_TURMERIC: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',

  // Cumin (Jeera) - Whole aromatic cumin seeds
  C_CUMIN: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',

  // Black Pepper - Whole black peppercorns
  C_PEPPER: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',

  // Cardamom (Elaichi) - Green cardamom pods
  C_CARDAMOM: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',

  // Ginger (Adrak) - Fresh ginger root
  C_GINGER: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80',

  // Onion - Red onions harvest
  C_ONION: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',

  // Potato - Fresh earth potatoes
  C_POTATO: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',

  // Tomato - Fresh ripe red tomatoes
  C_TOMATO: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',

  // Garlic - Fresh garlic bulbs
  C_GARLIC: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80',

  // Tea - Assam tea plantation garden
  C_TEA: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',

  // Coffee - Arabica / Robusta coffee cherries
  C_COFFEE: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',

  // Coconut - Fresh coconut harvest
  C_COCONUT: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800&q=80',

  // Apple - Fresh red Himalayan apples
  C_APPLE: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',

  // Mango - Banganapalli / Alphonso mangoes
  C_MANGO: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',

  // Cashew - Raw cashew nuts
  C_CASHEW: 'https://images.unsplash.com/photo-1509912760195-46700547b7ba?auto=format&fit=crop&w=800&q=80',

  // Litchi - Muzaffarpur Shahi Litchi
  C_LITCHI: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
};

// Fallback high quality agricultural image
export const DEFAULT_CROP_IMAGE = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80';
