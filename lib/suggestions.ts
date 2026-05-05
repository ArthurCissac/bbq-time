export type Category =
  | "viande"
  | "accompagnement"
  | "boisson"
  | "dessert"
  | "autre";

export type Suggestion = {
  name: string;
  emoji: string;
  category: Category;
  hasCookingPref: boolean;
  defaultQty: number;
};

export const SUGGESTIONS: Suggestion[] = [
  // Viandes
  { name: "Merguez", emoji: "🌭", category: "viande", hasCookingPref: true, defaultQty: 20 },
  { name: "Chipolatas", emoji: "🌭", category: "viande", hasCookingPref: true, defaultQty: 20 },
  { name: "Pilons de poulet", emoji: "🍗", category: "viande", hasCookingPref: true, defaultQty: 15 },
  { name: "Côte de porc", emoji: "🥩", category: "viande", hasCookingPref: true, defaultQty: 10 },
  { name: "Brochettes", emoji: "🍢", category: "viande", hasCookingPref: true, defaultQty: 12 },
  { name: "Steak haché", emoji: "🍔", category: "viande", hasCookingPref: true, defaultQty: 12 },
  { name: "Saucisses", emoji: "🌭", category: "viande", hasCookingPref: true, defaultQty: 20 },
  { name: "Magret de canard", emoji: "🦆", category: "viande", hasCookingPref: true, defaultQty: 6 },

  // Accompagnements
  { name: "Maïs", emoji: "🌽", category: "accompagnement", hasCookingPref: false, defaultQty: 10 },
  { name: "Salade verte", emoji: "🥗", category: "accompagnement", hasCookingPref: false, defaultQty: 1 },
  { name: "Tomates", emoji: "🍅", category: "accompagnement", hasCookingPref: false, defaultQty: 8 },
  { name: "Pommes de terre", emoji: "🥔", category: "accompagnement", hasCookingPref: false, defaultQty: 15 },
  { name: "Pain", emoji: "🥖", category: "accompagnement", hasCookingPref: false, defaultQty: 3 },
  { name: "Frites", emoji: "🍟", category: "accompagnement", hasCookingPref: false, defaultQty: 10 },
  { name: "Fromage", emoji: "🧀", category: "accompagnement", hasCookingPref: false, defaultQty: 5 },

  // Boissons
  { name: "Bière", emoji: "🍺", category: "boisson", hasCookingPref: false, defaultQty: 24 },
  { name: "Coca", emoji: "🥤", category: "boisson", hasCookingPref: false, defaultQty: 6 },
  { name: "Eau", emoji: "💧", category: "boisson", hasCookingPref: false, defaultQty: 6 },
  { name: "Vin rouge", emoji: "🍷", category: "boisson", hasCookingPref: false, defaultQty: 3 },
  { name: "Rosé", emoji: "🍷", category: "boisson", hasCookingPref: false, defaultQty: 3 },
  { name: "Jus de fruits", emoji: "🧃", category: "boisson", hasCookingPref: false, defaultQty: 6 },

  // Desserts
  { name: "Glace", emoji: "🍦", category: "dessert", hasCookingPref: false, defaultQty: 10 },
  { name: "Fruits", emoji: "🍓", category: "dessert", hasCookingPref: false, defaultQty: 10 },
  { name: "Gâteau", emoji: "🍰", category: "dessert", hasCookingPref: false, defaultQty: 1 },
];

const KEYWORD_TO_EMOJI: Array<[string, string]> = [
  ["merguez", "🌭"],
  ["chipo", "🌭"],
  ["saucisse", "🌭"],
  ["pilon", "🍗"],
  ["aile", "🍗"],
  ["poulet", "🍗"],
  ["dinde", "🍗"],
  ["côte de porc", "🥩"],
  ["cote de porc", "🥩"],
  ["porc", "🥩"],
  ["bavette", "🥩"],
  ["entrecôte", "🥩"],
  ["entrecote", "🥩"],
  ["boeuf", "🥩"],
  ["bœuf", "🥩"],
  ["agneau", "🐑"],
  ["mouton", "🐑"],
  ["canard", "🦆"],
  ["magret", "🦆"],
  ["brochette", "🍢"],
  ["steak haché", "🍔"],
  ["steak hache", "🍔"],
  ["burger", "🍔"],
  ["hamburger", "🍔"],
  ["bacon", "🥓"],
  ["lard", "🥓"],
  ["crevette", "🦐"],
  ["poisson", "🐟"],
  ["saumon", "🐟"],
  ["maïs", "🌽"],
  ["mais", "🌽"],
  ["salade", "🥗"],
  ["tomate", "🍅"],
  ["concombre", "🥒"],
  ["poivron", "🫑"],
  ["aubergine", "🍆"],
  ["courgette", "🥒"],
  ["champignon", "🍄"],
  ["patate", "🥔"],
  ["pomme de terre", "🥔"],
  ["frite", "🍟"],
  ["pain", "🥖"],
  ["baguette", "🥖"],
  ["fromage", "🧀"],
  ["camembert", "🧀"],
  ["œuf", "🥚"],
  ["oeuf", "🥚"],
  ["riz", "🍚"],
  ["pâtes", "🍝"],
  ["pates", "🍝"],
  ["bière", "🍺"],
  ["biere", "🍺"],
  ["pression", "🍺"],
  ["coca", "🥤"],
  ["soda", "🥤"],
  ["limonade", "🥤"],
  ["jus", "🧃"],
  ["eau", "💧"],
  ["vin", "🍷"],
  ["rosé", "🍷"],
  ["rose", "🍷"],
  ["champagne", "🍾"],
  ["whisky", "🥃"],
  ["mojito", "🍹"],
  ["cocktail", "🍹"],
  ["café", "☕"],
  ["cafe", "☕"],
  ["thé", "🍵"],
  ["the", "🍵"],
  ["glace", "🍦"],
  ["sorbet", "🍧"],
  ["gâteau", "🍰"],
  ["gateau", "🍰"],
  ["tarte", "🥧"],
  ["chocolat", "🍫"],
  ["fruit", "🍓"],
  ["fraise", "🍓"],
  ["pomme", "🍎"],
  ["banane", "🍌"],
  ["pastèque", "🍉"],
  ["pasteque", "🍉"],
  ["melon", "🍈"],
];

const KEYWORD_TO_CATEGORY: Array<[string, Category]> = [
  ...[
    "merguez", "chipo", "saucisse", "pilon", "aile", "poulet", "dinde",
    "porc", "bavette", "entrecôte", "entrecote", "boeuf", "bœuf",
    "agneau", "mouton", "canard", "magret", "brochette", "steak",
    "burger", "hamburger", "bacon", "lard", "crevette", "poisson",
    "saumon",
  ].map((k) => [k, "viande" as Category] as [string, Category]),

  ...[
    "maïs", "mais", "salade", "tomate", "concombre", "poivron",
    "aubergine", "courgette", "champignon", "patate", "pomme de terre",
    "frite", "pain", "baguette", "fromage", "camembert", "œuf", "oeuf",
    "riz", "pâtes", "pates",
  ].map((k) => [k, "accompagnement" as Category] as [string, Category]),

  ...[
    "bière", "biere", "pression", "coca", "soda", "limonade", "jus",
    "eau", "vin", "rosé", "rose", "champagne", "whisky", "mojito",
    "cocktail", "café", "cafe", "thé", "the",
  ].map((k) => [k, "boisson" as Category] as [string, Category]),

  ...[
    "glace", "sorbet", "gâteau", "gateau", "tarte", "chocolat", "fruit",
    "fraise", "pomme", "banane", "pastèque", "pasteque", "melon",
  ].map((k) => [k, "dessert" as Category] as [string, Category]),
];

const COOKING_KEYWORDS = [
  "merguez", "chipo", "saucisse", "pilon", "aile", "poulet", "porc",
  "bavette", "entrecôte", "entrecote", "boeuf", "bœuf", "agneau",
  "canard", "magret", "brochette", "steak", "burger", "bacon",
  "crevette", "poisson", "saumon", "côte", "cote",
];

const norm = (s: string) =>
  s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function emojiFor(name: string): string {
  const n = norm(name);
  if (!n) return "🍖";
  for (const [kw, emoji] of KEYWORD_TO_EMOJI) {
    if (n.includes(norm(kw))) return emoji;
  }
  return "🍖";
}

export function categoryFor(name: string): Category {
  const n = norm(name);
  for (const [kw, cat] of KEYWORD_TO_CATEGORY) {
    if (n.includes(norm(kw))) return cat;
  }
  return "autre";
}

export function shouldHaveCookingPref(name: string): boolean {
  const n = norm(name);
  return COOKING_KEYWORDS.some((kw) => n.includes(norm(kw)));
}
