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
    id: "poultry",
    slug: "poultry",
    name: "الطيور",
    nameEn: "Poultry",
    tagline: "دواجن وطيور طازجة ومجمدة",
    description: "فراخ طازجة ومجمدة، بط، حمام، أرانب، وجميع أنواع الطيور والدواجن بأفضل الأسعار.",
    icon: "🐔",
    image: "/categories/poultry.jpg",
    accentColor: "#ea580c",
    themeGradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(194, 65, 12, 0.05) 100%)",
    borderHover: "#ea580c",
  },
  {
    id: "mobiles",
    slug: "test",
    name: "خدمات الدفع الإلكتروني",
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
 * 🧺 Grocery Subcategories (under بقالة / bakala)
 * Each subcategory has a unique slug, Arabic name, icon, and accent color
 * that follows the same design conventions as the main CATEGORIES.
 */
export const GROCERY_SUBCATEGORIES = [
  {
    id: "rice-pasta-grains",
    slug: "rice-pasta-grains",
    name: "الأرز والمكرونة والحبوب",
    nameEn: "Rice, Pasta & Grains",
    tagline: "أساسيات المطبخ من الأرز والمكرونة والحبوب المتنوعة",
    description: "تشكيلة واسعة من أنواع الأرز البسمتي والمصري، المكرونة بأشكالها، العدس، الفول، والحبوب الكاملة لوجبات شهية كل يوم.",
    icon: "🍚",
    accentColor: "#f59e0b",
    themeGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)",
    borderHover: "#f59e0b",
    parentCategory: "بقالة",
  },
  {
    id: "hot-drinks",
    slug: "hot-drinks",
    name: "المشروبات الساخنة",
    nameEn: "Hot Drinks",
    tagline: "شاي وقهوة ومشروبات ساخنة متنوعة",
    description: "أجود أنواع الشاي، القهوة التركية والعربية، النسكافيه، الكاكاو، والأعشاب الطبيعية لكل الأوقات.",
    icon: "☕",
    accentColor: "#92400e",
    themeGradient: "linear-gradient(135deg, rgba(146, 64, 14, 0.15) 0%, rgba(120, 53, 15, 0.05) 100%)",
    borderHover: "#92400e",
    parentCategory: "بقالة",
  },
  {
    id: "dairy",
    slug: "dairy",
    name: "الألبان ومنتجاتها",
    nameEn: "Dairy Products",
    tagline: "ألبان طازجة وأجبان ومنتجات يومية",
    description: "حليب طازج، زبادي، أجبان بيضاء ومطبوخة، قشطة، زبدة، وجميع منتجات الألبان الطازجة يومياً.",
    icon: "🥛",
    accentColor: "#0ea5e9",
    themeGradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.05) 100%)",
    borderHover: "#0ea5e9",
    parentCategory: "بقالة",
  },
  {
    id: "chips-sweets-biscuits",
    slug: "chips-sweets-biscuits",
    name: "الشيبسي والحلويات والبسكويت",
    nameEn: "Chips, Sweets & Biscuits",
    tagline: "شيبسي وبسكويت وحلويات لذيذة للتسلية",
    description: "أشهر ماركات الشيبسي والبسكويت، الشوكولاتة، الحلويات، والسناكس المفضلة للكبار والصغار.",
    icon: "🍪",
    accentColor: "#e11d48",
    themeGradient: "linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(190, 18, 60, 0.05) 100%)",
    borderHover: "#e11d48",
    parentCategory: "بقالة",
  },
  {
    id: "canned-sauces",
    slug: "canned-sauces",
    name: "المعلبات والصلصات",
    nameEn: "Canned Goods & Sauces",
    tagline: "معلبات وصلصات جاهزة لوجبات سريعة ولذيذة",
    description: "تونة، فول مدمس، ذرة، صلصة طماطم، كاتشب، مايونيز، وجميع المعلبات والصلصات لمطبخك.",
    icon: "🥫",
    accentColor: "#dc2626",
    themeGradient: "linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)",
    borderHover: "#dc2626",
    parentCategory: "بقالة",
  },
  {
    id: "spices-oils",
    slug: "spices-oils",
    name: "التوابل والزيوت والإضافات",
    nameEn: "Spices, Oils & Additives",
    tagline: "توابل وبهارات وزيوت لنكهة مميزة",
    description: "بهارات وتوابل متنوعة، زيت ذرة وعباد الشمس وزيتون، خل، ملح، وكل الإضافات التي تكمل وصفاتك.",
    icon: "🫒",
    accentColor: "#65a30d",
    themeGradient: "linear-gradient(135deg, rgba(101, 163, 13, 0.15) 0%, rgba(77, 124, 15, 0.05) 100%)",
    borderHover: "#65a30d",
    parentCategory: "بقالة",
  },
  {
    id: "sugar-flour-baking",
    slug: "sugar-flour-baking",
    name: "السكر والدقيق ومستلزمات الحلويات",
    nameEn: "Sugar, Flour & Baking",
    tagline: "سكر ودقيق ومستلزمات الخبز والحلويات",
    description: "سكر أبيض وبني، دقيق فاخر ومخصوص، نشا، بيكنج بودر، فانيليا، وكل مستلزمات تحضير الحلويات والمخبوزات.",
    icon: "🧁",
    accentColor: "#d946ef",
    themeGradient: "linear-gradient(135deg, rgba(217, 70, 239, 0.15) 0%, rgba(192, 38, 211, 0.05) 100%)",
    borderHover: "#d946ef",
    parentCategory: "بقالة",
  },
  {
    id: "juices-water-drinks",
    slug: "juices-water-drinks",
    name: "العصائر والمياه والمشروبات",
    nameEn: "Juices, Water & Beverages",
    tagline: "عصائر ومياه ومشروبات باردة منعشة",
    description: "عصائر طبيعية ومركزة، مياه معدنية، مشروبات غازية، طاقة، ومشروبات باردة متنوعة لكل المناسبات.",
    icon: "🧃",
    accentColor: "#0891b2",
    themeGradient: "linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(6, 116, 143, 0.05) 100%)",
    borderHover: "#0891b2",
    parentCategory: "بقالة",
  },
  {
    id: "frozen-foods",
    slug: "frozen-foods",
    name: "المجمدات",
    nameEn: "Frozen Foods",
    tagline: "أطعمة مجمدة جاهزة وسريعة التحضير",
    description: "خضروات مجمدة، لحوم ودواجن مجمدة، بيتزا، سمبوسك، أصابع سمك، وجبات جاهزة مجمدة وكل ما تحتاجه من المجمدات.",
    icon: "🧊",
    accentColor: "#06b6d4",
    themeGradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)",
    borderHover: "#06b6d4",
    parentCategory: "بقالة",
  },
];

/**
 * All grocery subcategory names (for validation in AddProduct/EditProduct)
 */
export const GROCERY_SUBCATEGORY_NAMES = GROCERY_SUBCATEGORIES.map((s) => s.name);

/**
 * Find category by slug (or fallback to matching by Arabic name)
 */
export const getCategoryBySlug = (slug) => {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  if (decoded === "خدمات الدفع الإلكتروني" || decoded === "خدمات الدفع الإلكتروني" || decoded === "خدمات الدفع الإلكتروني") {
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
 * Find a grocery subcategory by its slug
 */
export const getSubcategoryBySlug = (slug) => {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  return (
    GROCERY_SUBCATEGORIES.find(
      (s) =>
        s.slug.toLowerCase() === decoded ||
        s.name.toLowerCase() === decoded ||
        s.nameEn.toLowerCase() === decoded
    ) || null
  );
};

/**
 * Find a grocery subcategory by its exact Arabic name
 */
export const getSubcategoryByName = (name) => {
  if (!name) return null;
  const trimmed = name.trim();
  return GROCERY_SUBCATEGORIES.find((s) => s.name === trimmed) || null;
};

/**
 * Find category by exact Arabic name
 */
export const getCategoryByName = (name) => {
  if (!name) return null;
  const trimmed = name.trim();
  if (trimmed === "خدمات الدفع الإلكتروني") {
    return CATEGORIES.find((c) => c.name === "خدمات الدفع الإلكتروني") || null;
  }
  return CATEGORIES.find((c) => c.name === trimmed) || null;
};

/**
 * Check if a given category name is an official one
 */
export const isOfficialCategory = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return OFFICIAL_CATEGORY_NAMES.includes(trimmed) || trimmed === "خدمات الدفع الإلكتروني";
};
