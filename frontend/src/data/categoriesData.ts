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
    cardImage: "/public/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp",
    bannerImage: "/public/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp",
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
    cardImage: "/public/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp",
    bannerImage: "/public/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp",
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
    cardImage: "/public/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Dinner-Sets/images.jpg",
    bannerImage: "/public/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Dinner-Sets/images.jpg",
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
    cardImage: "/public/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Feeding-Sets/images (1).jpg",
    bannerImage: "/public/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Feeding-Sets/images (1).jpg",
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
    cardImage: "/public/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Wedding-Gifts/images (1).jpg",
    bannerImage: "/public/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Wedding-Gifts/images (1).jpg",
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
  }
];

export const getCategoryBySlug = (slug: string): MainCategory | undefined => {
  const normalized = slug.toLowerCase().trim();
  return MAIN_CATEGORIES.find(
    c => c.slug === normalized || c.name.toLowerCase() === normalized
  );
};
