/**
 * 🛒 Official Store Categories for Tafhana Market
 * 6 main categories:
 * - بقالة (Groceries)
 * - وجبات سريعة (Fast Food)
 * - طابونة (Traditional Bakery)
 * - مقلة (Roasted Nuts & Seeds)
 * - منظفات (Cleaning Products)
 * - موبايلات (Mobile & Recharge)
 */

export const CATEGORIES = [
  {
    id: "Offers",
    slug: "Offers",
    name: "العروض",
    nameEn: "Offers",
    tagline: "عروض خاصة",
    description: "استكشف أقوى العروض والخصومات علي المنتجات",
    icon: "🏷️",
    image: "/categories/offers.jpg",
    accentColor: "#ef4444",
    themeGradient: "linear-gradient(135deg, rgba(255, 0, 0, 0.15) 0%, rgba(187, 5, 5, 0.05) 100%)",
    borderHover: "#ef4444",
  },
  {
    id: "bakala",
    slug: "bakala",
    name: "بقالة",
    nameEn: "Groceries",
    tagline: "أفضل السلع الغذائية والمواد التموينية الطازجة",
    description: "استكشف تشكيلة واسعة من المواد الغذائية الأساسية، المعلبات، الزيوت، الألبان، وكل ما تحتاجه مائدتك يومياً.",
    icon: "🥫",
    image: "/categories/bakala.jpg",
    accentColor: "#10b981",
    themeGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)",
    borderHover: "#10b981",
  },
  {
    id: "fast-food",
    slug: "fast-food",
    name: "وجبات سريعة",
    nameEn: "Fast Food",
    tagline: "سندوتشات ووجبات سريعة طازجة وشهية",
    description: "أشهى السندوتشات الجاهزة، البرجر، الشاورما، والمأكولات السريعة الساخنة المحضرة بأعلى جودة.",
    icon: "🍔",
    image: "/categories/fast-food.jpg",
    accentColor: "#f59e0b",
    themeGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)",
    borderHover: "#f59e0b",
  },
  {
    id: "bakery",
    slug: "bakery",
    name: "مخبوزات",
    nameEn: "Traditional Bakery",
    tagline: "مخبوزات بلدية وفينو طازج من الفرن مباشرة",
    description: "خبز بلدي طازج، فينو، باتيه، فطائر، ومخبوزات تقليدية مقرمشة يومياً برائحة الفرن الشهية.",
    icon: "🥖",
    image: "/categories/bakery.jpg",
    accentColor: "#ea580c",
    themeGradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(194, 65, 12, 0.05) 100%)",
    borderHover: "#ea580c",
  },
  {
    id: "roastery",
    slug: "roastery",
    name: "مقلة",
    nameEn: "Roasted Nuts & Seeds",
    tagline: "تسالي ومكسرات محمصة طازجة ومقرمشات",
    description: "لب أبيض وأسمر وعباد ، فول سوداني ، ومكسرات محمصة طازجة، وحلويات وتسالي لجميع المناسبات.",
    icon: "🥜",
    image: "/categories/roastery.jpg",
    accentColor: "#8b5cf6",
    themeGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%)",
    borderHover: "#8b5cf6",
  },
  {
    id: "cleaning",
    slug: "cleaning",
    name: "منظفات",
    nameEn: "Cleaning Products",
    tagline: "مساحيق غسيل ومطهرات ومنتجات عناية بالمنزل",
    description: "كل ما يلزم لنظافة ولمعان بيتك من مساحيق الغسيل، الصابون، المعقمات، وأدوات النظافة الموثوقة.",
    icon: "🧼",
    image: "/categories/cleaning.jpg",
    accentColor: "#06b6d4",
    themeGradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)",
    borderHover: "#06b6d4",
  },
  {
    id: "mobiles",
    slug: "mobiles",
    name: "موبايلات",
    nameEn: "Mobile & Recharge",
    tagline: "شحن رصيد، فواتير، وكروت الغاز و الكهرباء",
    description: "خدمات شحن الرصيد الفوري، كروت الشحن، سداد فواتير المحمول والإنترنت لجميع الشبكات وكروت الغاز و الكهرباء.",
    icon: "📱",
    image: "/categories/mobiles.jpg",
    accentColor: "#3b82f6",
    themeGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)",
    borderHover: "#3b82f6",
  }
];

export const OFFICIAL_CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/**
 * Find category by slug (or fallback to matching by Arabic name)
 */
export const getCategoryBySlug = (slug) => {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  if (decoded === "موبيلات" || decoded === "موبايل" || decoded === "موبيل") {
    return CATEGORIES.find((c) => c.slug === "mobiles") || null;
  }
  return (
    CATEGORIES.find(
      (c) =>
        c.slug.toLowerCase() === decoded ||
        c.name.toLowerCase() === decoded ||
        c.nameEn.toLowerCase() === decoded
    ) || null
  );
};

/**
 * Find category by exact Arabic name
 */
export const getCategoryByName = (name) => {
  if (!name) return null;
  const trimmed = name.trim();
  if (trimmed === "موبيلات") {
    return CATEGORIES.find((c) => c.name === "موبايلات") || null;
  }
  return CATEGORIES.find((c) => c.name === trimmed) || null;
};

/**
 * Check if a given category name is an official one
 */
export const isOfficialCategory = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return OFFICIAL_CATEGORY_NAMES.includes(trimmed) || trimmed === "موبيلات";
};
