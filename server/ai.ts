import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const aiRouter = express.Router();

export interface JewelleryProductAiInput {
  name: string;
  productType?: string;
  category?: string;
  collection?: string;
  metal?: string;
  plating?: string;
  stone?: string;
  stoneDetails?: string;
  style?: string;
  occasion?: string;
  weight?: string;
  dimensions?: string;
  bandWidth?: string;
  sizes?: string[] | string;
  certification?: string;
  craftsmanship?: string;
  careInstructions?: string;
  existingShortDesc?: string;
  existingFullDesc?: string;
  seoKeywords?: string;
  finishes?: string[];
  variants?: Record<string, any>;
  selectedVariant?: string;
  tone?: 'Luxury' | 'Minimal' | 'Romantic' | 'Modern' | 'Heritage';
  length?: 'Short' | 'Standard' | 'Detailed';
  language?: 'English' | 'Hindi' | 'Hinglish';
  verifiedOnly?: boolean;
  target?: 'both' | 'short' | 'full';
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildPrompt(data: JewelleryProductAiInput): string {
  const tone = data.tone || 'Luxury';
  const length = data.length || 'Standard';
  const language = data.language || 'English';
  const verifiedOnly = data.verifiedOnly !== false;
  const target = data.target || 'both';

  const providedFields: string[] = [];
  if (data.name) providedFields.push(`- Product Name: ${data.name}`);
  if (data.productType) providedFields.push(`- Product Type / Silhouette: ${data.productType}`);
  if (data.category) providedFields.push(`- Category: ${data.category}`);
  if (data.collection) providedFields.push(`- Collection: ${data.collection}`);
  if (data.metal) providedFields.push(`- Metal / Material: ${data.metal}`);
  if (data.plating) providedFields.push(`- Plating / Finish: ${data.plating}`);
  if (data.stone) providedFields.push(`- Stone Name & Carat / Details: ${data.stone}`);
  if (data.stoneDetails) providedFields.push(`- Stone Additional Details: ${data.stoneDetails}`);
  if (data.style) providedFields.push(`- Design / Style: ${data.style}`);
  if (data.occasion) providedFields.push(`- Occasion: ${data.occasion}`);
  if (data.weight) providedFields.push(`- Product Weight: ${data.weight}`);
  if (data.dimensions) providedFields.push(`- Dimensions / Length: ${data.dimensions}`);
  if (data.bandWidth) providedFields.push(`- Band Width: ${data.bandWidth}`);
  if (data.sizes && (Array.isArray(data.sizes) ? data.sizes.length > 0 : Boolean(data.sizes))) {
    const sizeStr = Array.isArray(data.sizes) ? data.sizes.join(', ') : data.sizes;
    providedFields.push(`- Available Sizes / Dimensions: ${sizeStr}`);
  }
  if (data.certification) providedFields.push(`- Certification / Hallmark: ${data.certification}`);
  if (data.craftsmanship) providedFields.push(`- Craftsmanship Details: ${data.craftsmanship}`);
  if (data.careInstructions) providedFields.push(`- Care Instructions: ${data.careInstructions}`);
  if (data.seoKeywords) providedFields.push(`- SEO Target Keywords: ${data.seoKeywords}`);
  if (data.existingShortDesc) providedFields.push(`- Existing Short Description: ${data.existingShortDesc}`);
  if (data.existingFullDesc) providedFields.push(`- Existing Full Description: ${data.existingFullDesc}`);

  // Variant awareness
  if (data.finishes && data.finishes.length > 0) {
    providedFields.push(`- Available Metal Options / Finishes: ${data.finishes.join(', ')}`);
  }
  if (data.variants && Object.keys(data.variants).length > 0) {
    const variantSummary: string[] = [];
    for (const [vKey, vVal] of Object.entries(data.variants)) {
      if (vVal && typeof vVal === 'object' && vVal.active !== false) {
        variantSummary.push(`${vKey} (SKU: ${vVal.sku || 'N/A'}, Price: ${vVal.price ? `₹${vVal.price}` : 'Standard'})`);
      }
    }
    if (variantSummary.length > 0) {
      providedFields.push(`- Active Variants: ${variantSummary.join(' | ')}`);
    }
  }
  if (data.selectedVariant) {
    providedFields.push(`- Focused Variant: ${data.selectedVariant}`);
  }

  return `
You are the master luxury jewellery copywriter for ROYRA JEWELS, an elite fine jewellery maison.
Generate high-converting, poetic, and refined product content for an e-commerce jewellery catalogue.

### PRODUCT SPECIFICATIONS PROVIDED:
${providedFields.length > 0 ? providedFields.join('\n') : '- No specific attributes provided beyond title.'}

### GENERATION PARAMETERS:
- Tone: ${tone} (Luxury = regal, opulent, artisanal; Minimal = understated, sleek, modern clean; Romantic = sentimental, poetic, celebratory love; Modern = bold, contemporary, chic; Heritage = timeless, royal heirloom, traditional craftsmanship)
- Length: ${length} (Short = concise punchy; Standard = balanced elegance; Detailed = in-depth artisanal storytelling)
- Target Language: ${language} (If English: refined British/International luxury English; If Hindi: elegant Shuddh/modern Hindi; If Hinglish: upscale Indian luxury conversational Hinglish blending Hindi & English)
- Target Request: ${target.toUpperCase()} (shortDescription, fullStory, or both)
- Strict Verification Constraint: ${verifiedOnly ? 'STRICT: Use ONLY verified facts provided above. NEVER invent or extrapolate unlisted technical specs.' : 'Standard jewellery descriptive guidelines.'}

### CRITICAL RULES & ACCURACY GUARDRAILS:
1. **NEVER INVENT OR HALLUCINATE**:
   - metal purity (e.g. do NOT say "24K" or "18K" unless explicitly specified in input)
   - gemstone type or gemstone quality (do NOT invent "VVS diamond" or "Natural Colombian Emerald" unless specified in input)
   - carat weight (e.g. do NOT invent "1.5 carat" unless specified)
   - certification or BIS hallmark (do NOT invent "GIA certified" or "BIS Hallmarked" unless specified)
   - product weight or exact millimeter dimensions unless specified
   - manufacturing techniques (e.g. CAD, micro-pave, casting) unless specified
   - warranties, prices, discounts, or stock status
2. If any technical detail is missing, write beautifully around the silhouette, visual appeal, styling essence, and emotional resonance rather than inventing technical specifications.
3. **VARIANT AWARENESS**:
   - Accurately reference available metal finishes (${data.finishes?.join(', ') || 'as listed'}).
   - Never mistake Silver for Gold or Rose Gold for Yellow Gold.
4. **SHORT DESCRIPTION FORMAT**:
   - 2 to 3 polished sentences capturing the jewel's essence, silhouette, and aesthetic allure.
   - May start with a refined diamond bullet \`✦\` or clean prose.
5. **FULL PRODUCT STORY & CRAFTSMANSHIP FORMAT**:
   - Polished luxury markdown story structured with natural headings ONLY where supported by product data:
     - ### The Design
     - ### Craftsmanship
     - ### Materials & Finish
     - ### Details
     - ### Comfort & Wear
     - ### Perfect For
     - ### Care
   - Use bullet points (\`•\` or \`✦\`) where appropriate for readability.
   - Only include sections that are genuinely relevant to the provided data.

Return your response strictly in the JSON schema requested.
`;
}

// Fallback generator in case of network or key absence
function generateLocalFallback(data: JewelleryProductAiInput): { shortDescription: string; fullStory: string } {
  const name = data.name || 'Royra Fine Jewel';
  const category = (data.category || 'jewellery').toLowerCase();
  const metal = data.metal || (data.finishes && data.finishes.length > 0 ? data.finishes.join(' / ') : 'precious metal');
  const stone = data.stone ? `highlighted by ${data.stone}` : '';
  const tone = data.tone || 'Luxury';
  const finishes = data.finishes && data.finishes.length > 0 ? data.finishes.join(', ') : 'Gold, Silver, and Rose Gold';

  let shortDescription = '';
  if (tone === 'Minimal') {
    shortDescription = `✦ The ${name} embodies understated elegance with clean lines and refined proportions. Designed for modern versatility, it offers effortless brilliance for daily wear. Available in fine ${metal} finishes.`;
  } else if (tone === 'Romantic') {
    shortDescription = `✦ A poetic tribute to enduring love, the ${name} captivates with luminous warmth and timeless grace. Meticulously sculpted to celebrate life's most cherished milestones. Available in ${finishes}.`;
  } else if (tone === 'Heritage') {
    shortDescription = `✦ Inspired by royal heirloom aesthetics, the ${name} showcases majestic craftsmanship and regal distinction. A timeless jewel crafted to be treasured for generations. Available in ${finishes}.`;
  } else if (tone === 'Modern') {
    shortDescription = `✦ Bold, architectural, and effortlessly chic, the ${name} redefines contemporary fine jewellery. Sculpted with precision in ${metal} for a striking signature statement.`;
  } else {
    // Luxury default
    shortDescription = `✦ Handcrafted with artisanal finesse, the ${name} radiates timeless sophistication and opulent charm. Perfectly proportioned in ${metal}${stone ? ` and ${stone}` : ''} to elevate any ensemble with subtle grandeur.`;
  }

  const sections: string[] = [];

  sections.push(`### The Design\nThe ${name} reflects Royra Jewels' commitment to balanced proportions, luminous contours, and enduring beauty. Its distinctive silhouette harmonizes classical craftsmanship with contemporary flair, making it an essential piece in any fine jewellery wardrobe.`);

  if (data.craftsmanship || data.metal || data.plating) {
    const craftLines: string[] = [];
    if (data.metal) craftLines.push(`• **Metal & Alloy**: ${data.metal}`);
    if (data.plating) craftLines.push(`• **Finish & Polish**: ${data.plating}`);
    if (data.craftsmanship) craftLines.push(`• **Artisanal Detailing**: ${data.craftsmanship}`);
    craftLines.push(`• **Available Finishes**: ${finishes}`);
    sections.push(`### Materials & Finish\n${craftLines.join('\n')}`);
  }

  if (data.stone || data.stoneDetails) {
    const stoneLines: string[] = [];
    if (data.stone) stoneLines.push(`• **Stone Setting**: ${data.stone}`);
    if (data.stoneDetails) stoneLines.push(`• **Details**: ${data.stoneDetails}`);
    sections.push(`### Stone Details\n${stoneLines.join('\n')}`);
  }

  if (data.weight || data.dimensions || data.sizes) {
    const detailLines: string[] = [];
    if (data.weight) detailLines.push(`• **Weight**: ${data.weight}`);
    if (data.dimensions) detailLines.push(`• **Dimensions**: ${data.dimensions}`);
    if (data.sizes) {
      const sizeStr = Array.isArray(data.sizes) ? data.sizes.join(', ') : data.sizes;
      detailLines.push(`• **Available Sizes**: ${sizeStr}`);
    }
    if (data.certification) detailLines.push(`• **Hallmark & Certification**: ${data.certification}`);
    sections.push(`### Specifications\n${detailLines.join('\n')}`);
  }

  sections.push(`### Comfort & Wear\nSculpted with smooth inner beveling and lightweight balance for effortless, irritation-free all-day comfort. Designed to seamlessly transition from daytime refinement to evening celebrations.`);

  if (data.occasion) {
    sections.push(`### Perfect For\nIdeal for ${data.occasion}, celebratory gifting, anniversaries, or elevated daily luxury.`);
  } else {
    sections.push(`### Perfect For\nAn exquisite choice for meaningful gifting, personal milestones, and timeless everyday indulgence.`);
  }

  if (data.careInstructions) {
    sections.push(`### Care Instructions\n${data.careInstructions}`);
  } else {
    sections.push(`### Care\nStore in your bespoke Royra Jewels plush pouch. Avoid direct contact with harsh perfumes, chlorine, and abrasive chemicals. Clean gently with a soft microfibre polishing cloth.`);
  }

  const fullStory = sections.join('\n\n');

  return { shortDescription, fullStory };
}

aiRouter.post('/generate-product-content', async (req, res) => {
  try {
    const body: JewelleryProductAiInput = req.body || {};
    const ai = getGeminiClient();

    if (!body.name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required to generate content.',
      });
    }

    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured on server. Falling back to local fine jewellery generator.');
      const fallback = generateLocalFallback(body);
      return res.json({
        success: true,
        source: 'local_engine',
        data: fallback,
      });
    }

    const prompt = buildPrompt(body);

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert luxury jewellery copywriter. Strict rule: NEVER invent or hallucinate metal purity, gemstone carat/quality, certification, or dimensions unless provided in input.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortDescription: {
              type: Type.STRING,
              description: 'A 2-3 sentence luxury jewellery short description.',
            },
            fullStory: {
              type: Type.STRING,
              description:
                'Polished luxury jewellery story formatted in markdown with appropriate headers (### The Design, ### Craftsmanship, ### Materials & Finish, ### Details, ### Comfort & Wear, ### Perfect For, ### Care) supported by actual data.',
            },
          },
          required: ['shortDescription', 'fullStory'],
        },
      },
    });

    const rawText = response.text || '';
    let parsed: { shortDescription?: string; fullStory?: string } = {};

    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response:', parseErr, rawText);
      const fallback = generateLocalFallback(body);
      parsed = fallback;
    }

    const finalResult = {
      shortDescription: parsed.shortDescription || generateLocalFallback(body).shortDescription,
      fullStory: parsed.fullStory || generateLocalFallback(body).fullStory,
    };

    return res.json({
      success: true,
      source: 'gemini_ai',
      data: finalResult,
    });
  } catch (error: any) {
    console.error('Error generating product content with Gemini:', error);
    // Fall back to rule-based generator so the admin never sees a total failure
    const fallback = generateLocalFallback(req.body || {});
    return res.json({
      success: true,
      source: 'fallback_after_error',
      warning: error.message || 'AI service temporarily unavailable',
      data: fallback,
    });
  }
});

export default aiRouter;
