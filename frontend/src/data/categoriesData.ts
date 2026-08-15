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
    shortDescription: "Sacred 925 sterling & 999 fine silver ritual essentials and puja accessories.",
    description: "Discover our hallmarked collection of pure silver pooja articles, from ornate deepams and kalashes to hand-sculpted idols and complete ritual thali sets.",
    cardImage: "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-god-idols", name: "Silver God Idols", slug: "silver-god-idols" },
      { id: "sub-deepams", name: "Silver Deepams", slug: "silver-deepams" },
      { id: "sub-pooja-plates", name: "Silver Pooja Plates", slug: "silver-pooja-plates" },
      { id: "sub-kumkum-bharani", name: "Silver Kumkum Bharani", slug: "silver-kumkum-bharani" },
      { id: "sub-bell", name: "Silver Bell", slug: "silver-bell" },
      { id: "sub-kalash", name: "Silver Kalash", slug: "silver-kalash" },
      { id: "sub-panchapatra", name: "Silver Panchapatra & Uddharini", slug: "silver-panchapatra-uddharini" },
      { id: "sub-akshinthalu", name: "Silver Akshinthalu Containers", slug: "silver-akshinthalu-containers" },
      { id: "sub-pooja-sets", name: "Silver Pooja Sets", slug: "silver-pooja-sets" }
    ]
  },
  {
    id: "cat-god-temple",
    name: "Silver God & Temple Items",
    slug: "silver-god-temple-items",
    shortDescription: "Hand-crafted 999 fine silver deities, sanctum adornments, and temple accessories.",
    description: "Artisanal South Indian solid silver idols of Lord Balaji, Goddess Lakshmi, Ganesha, and sacred temple embellishments crafted with precision Nakshi work.",
    cardImage: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-balaji", name: "Balaji Idol", slug: "balaji-idol" },
      { id: "sub-lakshmi", name: "Lakshmi Devi Idol", slug: "lakshmi-devi-idol" },
      { id: "sub-ganesh", name: "Ganesh Idol", slug: "ganesh-idol" },
      { id: "sub-sai-baba", name: "Sai Baba Idol", slug: "sai-baba-idol" },
      { id: "sub-krishna", name: "Krishna Idol", slug: "krishna-idol" },
      { id: "sub-shiva", name: "Shiva Idol", slug: "shiva-idol" },
      { id: "sub-hanuman", name: "Hanuman Idol", slug: "hanuman-idol" },
      { id: "sub-goddess", name: "Goddess Idols", slug: "goddess-idols" },
      { id: "sub-temple-acc", name: "Silver Temple Accessories", slug: "silver-temple-accessories" }
    ]
  },
  {
    id: "cat-dining-tableware",
    name: "Silver Dining & Tableware",
    slug: "silver-dining-tableware",
    shortDescription: "Luxury 925 sterling dinner sets, tumblers, bowls, and royal silverware.",
    description: "Elevate fine dining with pure silver dinner plates, embossed tumblers, bowls, and serving sets crafted for family traditions and grand celebrations.",
    cardImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-plates", name: "Silver Plates", slug: "silver-plates" },
      { id: "sub-bowls", name: "Silver Bowls", slug: "silver-bowls" },
      { id: "sub-glasses", name: "Silver Glasses", slug: "silver-glasses" },
      { id: "sub-spoons", name: "Silver Spoons", slug: "silver-spoons" },
      { id: "sub-tumblers", name: "Silver Tumblers", slug: "silver-tumblers" },
      { id: "sub-serving-sets", name: "Silver Serving Sets", slug: "silver-serving-sets" },
      { id: "sub-dinner-sets", name: "Silver Dinner Sets", slug: "silver-dinner-sets" },
      { id: "sub-cups", name: "Silver Cups", slug: "silver-cups" }
    ]
  },
  {
    id: "cat-baby-kids",
    name: "Silver Baby & Kids Gifts",
    slug: "silver-baby-kids-gifts",
    shortDescription: "Auspicious pure silver baby feeding articles, anklets, and keepsake gifts.",
    description: "Celebrate newborns and toddlers with hypoallergenic 925 silver feeding bowls, silver spoons, silver glass sets, and ghungroo anklets.",
    cardImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-baby-glass", name: "Silver Baby Glass", slug: "silver-baby-glass" },
      { id: "sub-baby-spoon", name: "Silver Baby Spoon", slug: "silver-baby-spoon" },
      { id: "sub-baby-bowl", name: "Silver Baby Bowl", slug: "silver-baby-bowl" },
      { id: "sub-feeding-set", name: "Silver Feeding Set", slug: "silver-feeding-set" },
      { id: "sub-anklets", name: "Silver Anklets", slug: "silver-anklets" },
      { id: "sub-bracelets", name: "Silver Bracelets", slug: "silver-bracelets" },
      { id: "sub-baby-gift-sets", name: "Silver Baby Gift Sets", slug: "silver-baby-gift-sets" }
    ]
  },
  {
    id: "cat-wedding-gifts",
    name: "Silver Wedding & Return Gifts",
    slug: "silver-wedding-return-gifts",
    shortDescription: "Memorable silver keepsakes, return gift thalis, and custom wedding tokens.",
    description: "Premium bulk and retail silver wedding favors, hallmarked coins, engraved silver kumkum boxes, and customized gift sets for guests.",
    cardImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-wedding-gifts", name: "Silver Wedding Gifts", slug: "silver-wedding-gifts" },
      { id: "sub-couple-gifts", name: "Silver Couple Gifts", slug: "silver-couple-gifts" },
      { id: "sub-return-gifts", name: "Silver Return Gifts", slug: "silver-return-gifts" },
      { id: "sub-gift-coins", name: "Silver Gift Coins", slug: "silver-gift-coins" },
      { id: "sub-kumkum-boxes", name: "Silver Kumkum Boxes", slug: "silver-kumkum-boxes" },
      { id: "sub-diyas-wedding", name: "Silver Diyas", slug: "silver-diyas" },
      { id: "sub-wedding-sets", name: "Silver Gift Sets", slug: "silver-gift-sets" },
      { id: "sub-custom-wedding", name: "Customized Wedding Gifts", slug: "customized-wedding-gifts" }
    ]
  },
  {
    id: "cat-jewellery",
    name: "Silver Jewellery",
    slug: "silver-jewellery",
    shortDescription: "Contemporary & traditional 925 sterling silver necklaces, bangles, and rings.",
    description: "Hand-crafted 925 sterling silver ornaments including temple jewellery, Nakshi payals, daily-wear rings, and elegant silver pendants.",
    cardImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-jewel-anklets", name: "Silver Anklets", slug: "silver-anklets" },
      { id: "sub-jewel-bracelets", name: "Silver Bracelets", slug: "silver-bracelets" },
      { id: "sub-jewel-rings", name: "Silver Rings", slug: "silver-rings" },
      { id: "sub-jewel-chains", name: "Silver Chains", slug: "silver-chains" },
      { id: "sub-jewel-earrings", name: "Silver Earrings", slug: "silver-earrings" },
      { id: "sub-jewel-pendants", name: "Silver Pendants", slug: "silver-pendants" },
      { id: "sub-jewel-toe-rings", name: "Silver Toe Rings", slug: "silver-toe-rings" },
      { id: "sub-jewel-necklaces", name: "Silver Necklaces", slug: "silver-necklaces" }
    ]
  },
  {
    id: "cat-coins-bars",
    name: "Silver Coins & Bars",
    slug: "silver-coins-bars",
    shortDescription: "NABL certified 999 pure silver coins, investment bars, and embossed ingots.",
    description: "999 Fine Silver coins stamped with Lakshmi, Ganesh, Balaji, and customized corporate logos. Available from 5g to 1kg silver bars.",
    cardImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-lakshmi-coins", name: "Lakshmi Coins", slug: "lakshmi-coins" },
      { id: "sub-ganesh-coins", name: "Ganesh Coins", slug: "ganesh-coins" },
      { id: "sub-balaji-coins", name: "Balaji Coins", slug: "balaji-coins" },
      { id: "sub-sai-baba-coins", name: "Sai Baba Coins", slug: "sai-baba-coins" },
      { id: "sub-custom-coins", name: "Custom Silver Coins", slug: "custom-silver-coins" },
      { id: "sub-silver-bars", name: "Silver Bars", slug: "silver-bars" },
      { id: "sub-gift-coins-cb", name: "Gift Coins", slug: "gift-coins" }
    ]
  },
  {
    id: "cat-home-decor",
    name: "Silver Home Décor",
    slug: "silver-home-decor",
    shortDescription: "Opulent silver urlis, floral bowls, showpieces, and framed artifacts.",
    description: "Transform living spaces with handcrafted silver urlis for floating flowers, silver centerpieces, silver photo frames, and heritage showpieces.",
    cardImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-decor-diyas", name: "Silver Diyas", slug: "silver-diyas" },
      { id: "sub-urli", name: "Silver Urli", slug: "silver-urli" },
      { id: "sub-decor-bowls", name: "Silver Bowls", slug: "silver-bowls" },
      { id: "sub-decor-items", name: "Silver Decorative Items", slug: "silver-decorative-items" },
      { id: "sub-showpieces", name: "Silver Showpieces", slug: "silver-showpieces" },
      { id: "sub-frames", name: "Silver Frames", slug: "silver-frames" },
      { id: "sub-decor-kalash", name: "Silver Kalash", slug: "silver-kalash" },
      { id: "sub-centerpieces", name: "Silver Centerpieces", slug: "silver-centerpieces" }
    ]
  },
  {
    id: "cat-corporate-gifts",
    name: "Silver Corporate & Premium Gifts",
    slug: "silver-corporate-premium-gifts",
    shortDescription: "Executive silver mementos, engraved trophies, and custom corporate tokens.",
    description: "B2B executive gifting solutions, custom silver coins with company logo minting, silver photo plaques, and anniversary awards.",
    cardImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-mementos", name: "Silver Mementos", slug: "silver-mementos" },
      { id: "sub-awards", name: "Silver Awards", slug: "silver-awards" },
      { id: "sub-trophies", name: "Silver Trophies", slug: "silver-trophies" },
      { id: "sub-corp-sets", name: "Corporate Gift Sets", slug: "corporate-gift-sets" },
      { id: "sub-personalized-corp", name: "Personalized Silver Gifts", slug: "personalized-silver-gifts" },
      { id: "sub-engraved-corp", name: "Engraved Silver Gifts", slug: "engraved-silver-gifts" }
    ]
  },
  {
    id: "cat-customized",
    name: "Customized Silver Products",
    slug: "customized-silver-products",
    shortDescription: "Bespoke silver casting, laser engraving, photo minting, and custom idols.",
    description: "Bring your vision to life with custom silver weight casting, laser name engraving, 3D photo silver coins, and tailored temple idols.",
    cardImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    bannerImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
    subcategories: [
      { id: "sub-name-engrave", name: "Name Engraving", slug: "name-engraving" },
      { id: "sub-photo-engrave", name: "Photo Engraving", slug: "photo-engraving" },
      { id: "sub-logo-engrave", name: "Logo Engraving", slug: "logo-engraving" },
      { id: "sub-custom-idols", name: "Customized Idols", slug: "customized-idols" },
      { id: "sub-custom-coins-c", name: "Customized Coins", slug: "customized-coins" },
      { id: "sub-custom-gift-sets", name: "Customized Gift Sets", slug: "customized-gift-sets" },
      { id: "sub-personalized-pooja", name: "Personalized Pooja Articles", slug: "personalized-pooja-articles" }
    ]
  }
];

export const getCategoryBySlug = (slug: string): MainCategory | undefined => {
  const normalized = slug.toLowerCase().trim();
  return MAIN_CATEGORIES.find(
    c => c.slug === normalized || c.name.toLowerCase() === normalized
  );
};
