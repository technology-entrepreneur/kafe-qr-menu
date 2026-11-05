import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// FinOps In-Memory Caches: Avoid redundant DB & OpenAI API spend
const upsellCache = new Map<string, { timestamp: number; recommendations: RecommendationResult[] }>();
const UPSELL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

let cachedMenu: { timestamp: number; products: any[] } | null = null;
const MENU_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner' | 'late_night';

interface CartInputItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  categoryId?: string;
  categoryName?: string;
}

interface UpsellRequestBody {
  cartItems: CartInputItem[];
  timeOfDay?: TimeOfDay;
  language?: 'tr' | 'en';
  venueMenu?: Array<{
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
    imageUrl?: string | null;
  }>;
}

export interface RecommendationResult {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  pairingReason: string;
  pairingBadge: string;
  confidenceScore: number;
}

/**
 * Automatically determine time of day based on venue local hour
 */
function resolveTimeOfDay(override?: TimeOfDay): TimeOfDay {
  if (override) return override;
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'late_night';
}

/**
 * Fallback heuristic recommendation engine when OpenAI is unreachable or offline
 */
function getHeuristicRecommendations(
  cartItems: CartInputItem[],
  availableProducts: any[],
  timeOfDay: TimeOfDay,
  language: 'tr' | 'en'
): RecommendationResult[] {
  const cartIds = new Set(cartItems.map((item) => item.id));
  const candidates = availableProducts.filter((p) => !cartIds.has(p.id));

  if (candidates.length === 0) return [];

  const timeRecommendations: Record<TimeOfDay, { badge: string; reasonEn: string; reasonTr: string }> = {
    breakfast: {
      badge: 'Morning Boost',
      reasonEn: 'Crafted to complement your breakfast with energizing fresh flavors.',
      reasonTr: 'Günün başlangıcını taze ve enerjik lezzetlerle taçlandırmak için önerildi.',
    },
    lunch: {
      badge: "Chef's Pairing",
      reasonEn: 'A light, refreshing accompaniment perfectly balanced for midday dining.',
      reasonTr: 'Öğle servisi için ana yemeğinize mükemmel uyum sağlayan ferahlatıcı lezzet.',
    },
    dinner: {
      badge: "Sommelier's Pick",
      reasonEn: 'Harmonizes with your main course to elevate the depth of culinary flavors.',
      reasonTr: 'Ana yemeğinizin lezzet derinliğini artıran özel sommelier eşleşmesi.',
    },
    late_night: {
      badge: 'Nightcap Special',
      reasonEn: 'A delightful digestif or sweet finish to complete your evening.',
      reasonTr: 'Akşamınızı kusursuz bir tatlı veya içecekle tamamlamak için ideal tercih.',
    },
  };

  const activeTimeInfo = timeRecommendations[timeOfDay];

  // Select top 3 complementary candidates
  return candidates.slice(0, 3).map((item, index) => ({
    id: item.id,
    name: language === 'en' && item.nameEn ? item.nameEn : item.name,
    price: Number(item.price),
    imageUrl: item.imageUrl || null,
    categoryName: item.category?.name || 'Complementary',
    pairingReason: language === 'tr' ? activeTimeInfo.reasonTr : activeTimeInfo.reasonEn,
    pairingBadge: activeTimeInfo.badge,
    confidenceScore: 90 - index * 5,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body: UpsellRequestBody = await req.json();
    const { cartItems = [], timeOfDay: requestedTime, language = 'tr' } = body;

    const timeOfDay = resolveTimeOfDay(requestedTime);

    // If the cart is empty, return an empty recommendation list
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        timeOfDay,
        recommendations: [],
      });
    }

    const now = Date.now();

    // FinOps Guard 1: Cache Check for Identical Cart Combinations (10-min TTL)
    const cacheKey = `${cartItems.map((i) => i.id).sort().join(',')}_${timeOfDay}_${language}`;
    const cachedEntry = upsellCache.get(cacheKey);

    if (cachedEntry && now - cachedEntry.timestamp < UPSELL_CACHE_TTL_MS) {
      return NextResponse.json({
        timeOfDay,
        source: 'in_memory_cache',
        recommendations: cachedEntry.recommendations,
      });
    }

    // FinOps Guard 2: In-Memory Cached Menu to Prevent Database Pool Exhaustion (5-min TTL)
    let candidateProducts: any[] = [];
    if (cachedMenu && now - cachedMenu.timestamp < MENU_CACHE_TTL_MS) {
      candidateProducts = cachedMenu.products;
    } else {
      try {
        candidateProducts = await prisma.product.findMany({
          where: {
            isAvailable: true,
          },
          include: {
            category: {
              select: { id: true, name: true, nameEn: true },
            },
          },
          take: 25,
          orderBy: [{ badge: 'desc' }, { order: 'asc' }],
        });
        cachedMenu = { timestamp: now, products: candidateProducts };
      } catch (dbErr) {
        console.warn('[Upsell API] Prisma fetch failed, checking body venueMenu fallback:', dbErr);
        if (body.venueMenu && Array.isArray(body.venueMenu)) {
          candidateProducts = body.venueMenu;
        }
      }
    }

    // Exclude items already in the diner's cart
    const cartProductIds = new Set(cartItems.map((c) => c.id));
    const eligibleMenu = candidateProducts.filter((p) => !cartProductIds.has(p.id));

    if (eligibleMenu.length === 0) {
      return NextResponse.json({
        timeOfDay,
        recommendations: [],
      });
    }

    // 2. Prepare menu items digest for OpenAI context
    const menuDigest = eligibleMenu.map((p) => ({
      id: p.id,
      name: language === 'en' && p.nameEn ? p.nameEn : p.name,
      price: Number(p.price),
      category: p.category?.name || 'Other',
      description: p.description || '',
    }));

    // 3. Fallback check: if no OpenAI API key, use heuristic pairing
    if (!process.env.OPENAI_API_KEY) {
      const fallbackRecs = getHeuristicRecommendations(cartItems, eligibleMenu, timeOfDay, language);
      return NextResponse.json({
        timeOfDay,
        source: 'heuristic_fallback',
        recommendations: fallbackRecs,
      });
    }

    // 4. OpenAI Sommelier Upselling Prompt
    const systemPrompt = `
You are "Aura", the Senior Sommelier and AI Hospitality Revenue Optimization Engine embedded in an upscale dining app.
Your task is to analyze the diner's current cart items and select 2 to 4 high-margin, complementary pairings from the available venue menu.

# Pairing Guidelines:
- If diner ordered heavy meats or pasta -> recommend acidic/bold craft beverages, fresh artisanal sides, or palate-cleansing starters.
- If diner ordered coffee or light snacks -> recommend specialty pastries, signature desserts, or extra shots.
- Consider Time of Day: "${timeOfDay}" (e.g. suggest espresso/digestifs in evening, fresh smoothies/juices at lunch/breakfast).
- Tone: Sophisticated yet appetizing, warm, and non-pushy sommelier recommendation.

# Response Format:
Respond ONLY with a valid JSON object matching this schema:
{
  "recommendations": [
    {
      "productId": "string (must match one of the candidate IDs)",
      "pairingReason": "string (appetizing 1-2 sentence pitch, e.g. 'Guests who choose [Item] frequently love pairing it with our artisanal [Candidate]...')",
      "pairingBadge": "string (e.g. 'Sommelier's Pick', 'Chef's Pairing', 'Sweet Finish', 'Must-Try Side')",
      "confidenceScore": number (70 to 99)
    }
  ]
}
`.trim();

    const userPrompt = JSON.stringify({
      currentCart: cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        category: item.categoryName || 'Main',
      })),
      timeOfDay,
      language: language === 'tr' ? 'Turkish' : 'English',
      availableCandidates: menuDigest.slice(0, 20),
    });

    const upsellModel = process.env.OPENAI_UPSELL_MODEL || 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: upsellModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 450, // FinOps Guard: Limit output length to save output tokens
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty upsell completion');
    }

    const parsed = JSON.parse(content);
    const aiRecommendations: Array<{
      productId: string;
      pairingReason: string;
      pairingBadge: string;
      confidenceScore: number;
    }> = parsed.recommendations || [];

    // Map AI recommendations back to rich product data (images, full prices)
    const matchedRecommendations: RecommendationResult[] = aiRecommendations
      .map((aiRec) => {
        const product = eligibleMenu.find((p) => p.id === aiRec.productId);
        if (!product) return null;

        return {
          id: product.id,
          name: language === 'en' && product.nameEn ? product.nameEn : product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || null,
          categoryName: product.category?.name || 'Specialty',
          pairingReason: aiRec.pairingReason,
          pairingBadge: aiRec.pairingBadge || "Sommelier's Pick",
          confidenceScore: aiRec.confidenceScore || 85,
        };
      })
      .filter((rec): rec is RecommendationResult => rec !== null);

    // If matching resulted in empty list, use heuristic as safety net
    const finalRecommendations =
      matchedRecommendations.length > 0
        ? matchedRecommendations
        : getHeuristicRecommendations(cartItems, eligibleMenu, timeOfDay, language);

    // FinOps Guard: Populate In-Memory Cache to serve future diners for free
    if (finalRecommendations.length > 0) {
      upsellCache.set(cacheKey, {
        timestamp: Date.now(),
        recommendations: finalRecommendations,
      });
    }

    return NextResponse.json({
      timeOfDay,
      source: 'ai_sommelier',
      recommendations: finalRecommendations,
    });
  } catch (error: any) {
    console.error('[Upsell Recommendation Engine Error]:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate sommelier recommendations',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        recommendations: [],
      },
      { status: 500 }
    );
  }
}

