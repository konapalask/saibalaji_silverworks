export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  bannerImage: string;
  cardImage: string;
  subcategories: Subcategory[];
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "cat-pooja-articles",
    name: "Silver Pooja Articles",
    slug: "silver-pooja-articles",
    shortDescription: "Sacred 925 sterling & 999 fine silver ritual essentials, deepams, thalis, and puja accessories.",
    description: "Discover our hallmarked collection of pure silver pooja articles, from ornate deepams and kalashes to hand-sculpted idols and complete ritual thali sets.",
    cardImage: "/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp",
    bannerImage: "/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp",
    subcategories: [
      { id: "sub-kalash-pots", name: "Silver Kalash & Pots", slug: "silver-kalash-pots" },
      { id: "sub-pooja-thalis-sets", name: "Silver Pooja Thalis & Sets", slug: "silver-pooja-thalis-sets" },
      { id: "sub-diyas-oil-lamps", name: "Silver Diyas & Oil Lamps", slug: "silver-diyas-oil-lamps" }
    ]
  },
  {
    id: "cat-dining-tableware",
    name: "Silver Dining & Tableware",
    slug: "silver-dining-tableware",
    shortDescription: "Luxury 925 sterling dinner sets, tumblers, bowls, trays, and royal silverware.",
    description: "Elevate fine dining with pure silver dinner plates, embossed tumblers, bowls, serving trays, and urlis crafted for family traditions and grand celebrations.",
    cardImage: "/public/Saibalaji products S/Royal Floral Crest Silver Serving Tray.webp",
    bannerImage: "/public/Saibalaji products S/Royal Floral Crest Silver Serving Tray.webp",
    subcategories: [
      { id: "sub-serving-trays-platters", name: "Silver Serving Trays & Platters", slug: "silver-serving-trays-platters" },
      { id: "sub-bowls-pedestal-bowls", name: "Silver Bowls & Pedestal Bowls", slug: "silver-bowls-pedestal-bowls" },
      { id: "sub-urlis-vessels", name: "Silver Urlis & Decorative Vessels", slug: "silver-urlis-decorative-vessels" },
      { id: "sub-tumblers-drinkware", name: "Silver Tumblers & Drinkware", slug: "silver-tumblers-drinkware" }
    ]
  },
  {
    id: "cat-god-temple",
    name: "Silver God & Temple Items",
    slug: "silver-god-temple-items",
    shortDescription: "Hand-crafted 999 fine silver deities, sanctum adornments, frames, and temple accessories.",
    description: "Artisanal South Indian solid silver idols of Lord Balaji, Goddess Lakshmi, Ganesha, Krishna, and sacred frames crafted with precision Nakshi work.",
    cardImage: "/public/Saibalaji products S/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp",
    bannerImage: "/public/Saibalaji products S/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp",
    subcategories: [
      { id: "sub-idols-statues", name: "Silver Idols & Statues", slug: "silver-idols-statues" },
      { id: "sub-photo-frames-displays", name: "Silver Photo Frames & Sacred Displays", slug: "silver-photo-frames-sacred-displays" }
    ]
  },
  {
    id: "cat-wedding-gifts",
    name: "Silver Wedding & Return Gifts",
    slug: "silver-wedding-return-gifts",
    shortDescription: "Memorable silver keepsakes, return gift sets, engraved storage boxes, and custom wedding tokens.",
    description: "Premium bulk and retail silver wedding favors, hallmarked coins, engraved silver masala boxes, storage pots, and customized gift sets for guests.",
    cardImage: "/public/Saibalaji products S/Shree Divya Silver Masala Box Set.webp",
    bannerImage: "/public/Saibalaji products S/Shree Divya Silver Masala Box Set.webp",
    subcategories: [
      { id: "sub-storage-containers-boxes", name: "Silver Storage Containers & Boxes", slug: "silver-storage-containers-boxes" },
      { id: "sub-return-gift-sets-utensils", name: "Silver Return Gift Sets & Utensils", slug: "silver-return-gift-sets-utensils" }
    ]
  }
];

export const getCategoryBySlug = (slug: string): MainCategory | undefined => {
  const normalized = slug.toLowerCase().trim();
  return MAIN_CATEGORIES.find(
    c => c.slug === normalized || c.name.toLowerCase() === normalized
  );
};
