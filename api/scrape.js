// api/scrape.js - IMPROVED Enhanced Universal Competitive Intelligence Scraper
const cheerio = require('cheerio');

// Rate limiting store
const rateLimitStore = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, type = 'General Page' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 50;

  if (rateLimitStore.has(clientIP)) {
    const { count, resetTime } = rateLimitStore.get(clientIP);
    if (now < resetTime && count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        resetTime: new Date(resetTime).toISOString()
      });
    }
    if (now >= resetTime) {
      rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    } else {
      rateLimitStore.set(clientIP, { count: count + 1, resetTime });
    }
  } else {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
  }

  try {
    console.log(`🌐 Enhanced scraping ${type}: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        // Additional headers for better access
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract comprehensive competitive intelligence with improved parsing
    const intelligence = extractEnhancedIntelligence($, html, url, type);

    // Return enhanced response
    res.status(200).json({
      success: true,
      scrapedSuccessfully: true,
      url: url,
      type: type,
      timestamp: intelligence.timestamp,
      
      // Legacy format for backward compatibility
      title: intelligence.content.title,
      content: intelligence.content.keyPoints,
      contentLength: intelligence.content.keyPoints.length,
      metadata: {
        description: intelligence.content.description,
        wordCount: intelligence.metadata.wordCount,
        changeIndicators: intelligence.metadata.changeIndicators,
        extractionMethods: intelligence.metadata.extractionMethods
      },

      // Enhanced intelligence data
      intelligence: intelligence,
      
      // Quick access to key competitive data
      actualPricing: intelligence.pricing.actualPrices,
      actualContent: intelligence.content.actualFindings,
      liveData: intelligence.liveData,
      competitiveThreats: intelligence.competitive.immediateThreats,
      
      // Analysis summary
      summary: generateIntelligenceSummary(intelligence)
    });

  } catch (error) {
    console.error('❌ Enhanced scraping error:', error);
    res.status(500).json({
      success: false,
      scrapedSuccessfully: false,
      url: url,
      type: type,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced intelligence extraction with improved parsing
function extractEnhancedIntelligence($, rawHtml, url, pageType) {
  // Remove noise elements
  $('script, style, nav, footer, header, .cookie-banner, .popup, .modal').remove();
  
  const intelligence = {
    url,
    pageType,
    timestamp: new Date().toISOString(),
    pricing: { 
      actualPrices: [], 
      plans: [], 
      model: 'unknown', 
      isGated: false,
      gatedReason: '',
      jsExtractedPrices: [],
      textExtractedPrices: [] // NEW: For text-based price extraction
    },
    features: { core: [], integrations: [], capabilities: [] },
    positioning: { target: '', messaging: '', differentiators: [] },
    company: { customers: [], funding: '', size: '' },
    competitive: { strengths: [], weaknesses: [], immediateThreats: [] },
    content: { 
      title: '', 
      description: '', 
      keyPoints: '',
      actualFindings: [],
      rawText: '' // NEW: Store raw text for analysis
    },
    liveData: {
      javascriptData: [],
      apiEndpoints: [],
      dataLayers: []
    },
    metadata: { 
      wordCount: 0, 
      extractionMethods: [],
      javascriptParsed: false,
      debugInfo: [] // NEW: For debugging extraction issues
    }
  };

  // Extract basic content
  intelligence.content.title = $('title').text().trim() || $('h1').first().text().trim();
  intelligence.content.description = $('meta[name="description"]').attr('content') || '';
  intelligence.content.rawText = $('body').text().replace(/\s+/g, ' ').trim();

  // ENHANCED: Multi-layer pricing extraction
  extractAdvancedPricingIntelligence($, rawHtml, intelligence);
  
  // IMPROVED: Better JavaScript content parsing
  parseImprovedJavaScriptContent(rawHtml, intelligence);
  
  // Standard extractions with improvements
  extractFeatureIntelligence($, intelligence);
  extractCompetitiveIntelligence($, intelligence);
  extractContentIntelligence($, intelligence);
  
  // NEW: Post-processing to clean up and validate data
  postProcessIntelligence(intelligence);
  
  return intelligence;
}

// IMPROVED: Advanced pricing extraction with multiple strategies
function extractAdvancedPricingIntelligence($, rawHtml, intel) {
  intel.metadata.debugInfo.push('Starting advanced pricing extraction');
  
  // Strategy 1: HTML Table-based pricing (common for SaaS)
  extractTablePricing($, intel);
  
  // Strategy 2: Div/Section-based pricing cards
  extractPricingCards($, intel);
  
  // Strategy 3: Text-based pricing patterns
  extractTextPricing($, intel);
  
  // Strategy 4: JSON-LD structured data
  extractStructuredDataPricing($, intel);
  
  // Strategy 5: Check for gated pricing
  checkGatedPricing($, intel);
  
  intel.metadata.debugInfo.push(`Total prices found: ${intel.pricing.actualPrices.length}`);
}

// NEW: Extract pricing from HTML tables
function extractTablePricing($, intel) {
  $('table').each((i, table) => {
    const tableText = $(table).text().toLowerCase();
    if (tableText.includes('price') || tableText.includes('plan') || tableText.includes('cost')) {
      $(table).find('td, th').each((j, cell) => {
        const cellText = $(cell).text().trim();
        const priceMatches = cellText.match(/(\$|€|£)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
        if (priceMatches) {
          priceMatches.forEach(match => {
            const cleanPrice = match.replace(/[,$]/g, '');
            const amount = cleanPrice.match(/(\d+(?:\.\d{2})?)/)?.[1];
            const currency = match.match(/(\$|€|£)/)?.[1] || '$';
            
            if (amount && parseFloat(amount) > 0) {
              intel.pricing.actualPrices.push({
                amount: amount,
                currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP',
                context: `Table pricing: ${cellText.substring(0, 100)}`,
                source: 'html-table',
                billing: inferBillingPeriod(tableText),
                rawMatch: match
              });
            }
          });
        }
      });
    }
  });
  intel.metadata.extractionMethods.push('Table-based pricing extraction');
}

// NEW: Extract pricing from pricing cards/sections
function extractPricingCards($, intel) {
  // Look for common pricing card patterns
  const pricingSelectors = [
    '[class*="price"]',
    '[class*="plan"]',
    '[class*="pricing"]',
    '[id*="price"]',
    '[id*="plan"]',
    '.price-card',
    '.pricing-card',
    '.plan-card'
  ];
  
  pricingSelectors.forEach(selector => {
    $(selector).each((i, element) => {
      const elementText = $(element).text().trim();
      
      // Salesforce-specific patterns
      const salesforcePattern = /(\$\s*\d{1,4})\s*(user|\/month|per month|monthly)/gi;
      const matches = elementText.match(salesforcePattern);
      
      if (matches) {
        matches.forEach(match => {
          const amount = match.match(/\d+/)?.[0];
          if (amount) {
            intel.pricing.actualPrices.push({
              amount: amount,
              currency: 'USD',
              context: `Pricing card: ${elementText.substring(0, 150)}`,
              source: 'html-pricing-card',
              billing: 'monthly',
              rawMatch: match
            });
          }
        });
      }
    });
  });
  intel.metadata.extractionMethods.push('Pricing card extraction');
}

// IMPROVED: Better text-based pricing extraction
function extractTextPricing($, intel) {
  const bodyText = $('body').text();
  
  // Enhanced price patterns for different formats
  const pricePatterns = [
    // Salesforce style: "$200 user/month"
    /(\$|€|£)\s*(\d{1,4})\s*(?:per\s+)?(?:user|seat)?\s*(?:\/|\s+per\s+)?\s*(?:month|monthly|mo)/gi,
    
    // Standard pricing: "$200/month", "€150 per month"
    /(\$|€|£)\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/|\s+per\s+)?\s*(?:month|monthly|year|annually|annual)/gi,
    
    // Contact sales patterns
    /(contact\s+(?:sales|us)|get\s+(?:a\s+)?quote|request\s+pricing|talk\s+to\s+(?:sales|expert))/gi,
    
    // Starting from patterns
    /starting\s+(?:from|at)\s+(\$|€|£)\s*(\d+)/gi
  ];
  
  pricePatterns.forEach((pattern, index) => {
    const matches = [...bodyText.matchAll(pattern)];
    matches.forEach(match => {
      if (index < 3 && match[2]) { // Price patterns
        const amount = match[2].replace(/[,]/g, '');
        const currency = match[1] === '$' ? 'USD' : match[1] === '€' ? 'EUR' : 'GBP';
        
        intel.pricing.actualPrices.push({
          amount: amount,
          currency: currency,
          context: `Text extraction: ${match[0]}`,
          source: 'text-pattern',
          billing: match[0].toLowerCase().includes('year') || match[0].toLowerCase().includes('annual') ? 'yearly' : 'monthly',
          rawMatch: match[0]
        });
      } else if (index === 2) { // Contact sales pattern
        intel.pricing.isGated = true;
        intel.pricing.gatedReason = match[0];
      }
    });
  });
  
  // Specific Salesforce Revenue Cloud pattern
  const salesforceSpecific = bodyText.match(/Revenue\s+Cloud\s+Advanced[^\d]*\$\s*(\d+)[^\d]*user[^\d]*month/gi);
  if (salesforceSpecific) {
    salesforceSpecific.forEach(match => {
      const amount = match.match(/\$\s*(\d+)/)?.[1];
      if (amount) {
        intel.pricing.actualPrices.push({
          amount: amount,
          currency: 'USD',
          context: `Salesforce specific: ${match}`,
          source: 'salesforce-pattern',
          billing: 'monthly',
          rawMatch: match
        });
      }
    });
  }
  
  intel.metadata.extractionMethods.push(`Text pricing extraction: ${intel.pricing.actualPrices.length} patterns found`);
}

// NEW: Extract JSON-LD structured data
function extractStructuredDataPricing($, intel) {
  $('script[type="application/ld+json"]').each((i, script) => {
    try {
      const jsonData = JSON.parse($(script).html());
      extractPricingFromStructuredData(jsonData, intel);
    } catch (error) {
      intel.metadata.debugInfo.push(`JSON-LD parsing failed: ${error.message}`);
    }
  });
  intel.metadata.extractionMethods.push('JSON-LD structured data extraction');
}

function extractPricingFromStructuredData(data, intel) {
  function searchStructuredData(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Look for Product or Service schemas
    if (obj['@type'] === 'Product' || obj['@type'] === 'Service') {
      if (obj.offers && Array.isArray(obj.offers)) {
        obj.offers.forEach(offer => {
          if (offer.price && offer.priceCurrency) {
            intel.pricing.actualPrices.push({
              amount: offer.price.toString(),
              currency: offer.priceCurrency,
              context: `Structured data: ${obj.name || 'Product'}`,
              source: 'json-ld',
              billing: 'unknown'
            });
          }
        });
      }
    }
    
    // Recursively search
    Object.values(obj).forEach(value => {
      if (typeof value === 'object') {
        searchStructuredData(value);
      }
    });
  }
  
  searchStructuredData(data);
}

// IMPROVED: Better gating detection
function checkGatedPricing($, intel) {
  const bodyText = $('body').text().toLowerCase();
  const gatedIndicators = [
    'contact sales',
    'contact a sales',
    'get a quote',
    'request pricing',
    'talk to sales',
    'speak with an expert',
    'custom pricing',
    'enterprise pricing'
  ];
  
  const foundIndicators = gatedIndicators.filter(indicator => bodyText.includes(indicator));
  
  if (foundIndicators.length > 0) {
    intel.pricing.isGated = true;
    intel.pricing.gatedReason = foundIndicators[0];
    intel.metadata.extractionMethods.push(`Gated pricing detected: ${foundIndicators.join(', ')}`);
  }
}

// IMPROVED: JavaScript parsing with better patterns
function parseImprovedJavaScriptContent(rawHtml, intel) {
  intel.metadata.extractionMethods.push('Improved JavaScript content parsing');
  
  try {
    // Enhanced JavaScript patterns for pricing data
    const jsPatterns = [
      // Salesforce-specific patterns
      /window\.wpdata\s*=\s*({.*?});/s,
      /var\s+wpdata\s*=\s*({.*?});/s,
      /"pricing":\s*({.*?})/s,
      /"plans":\s*(\[.*?\])/s,
      
      // Price value patterns in JavaScript
      /"price":\s*"?\$?(\d+)"?/g,
      /"amount":\s*"?\$?(\d+)"?/g,
      /price["\']?\s*:\s*["\']?\$?(\d+)["\']?/g,
      
      // Pricing table data
      /pricing_data\s*[:=]\s*(\{.*?\})/s,
      /price_table\s*[:=]\s*(\[.*?\])/s
    ];

    let foundJsData = false;
    const extractedPrices = new Set(); // Prevent duplicates

    jsPatterns.forEach((pattern, index) => {
      let matches;
      if (pattern.global) {
        matches = [...rawHtml.matchAll(pattern)];
      } else {
        const match = rawHtml.match(pattern);
        matches = match ? [match] : [];
      }
      
      if (matches.length > 0) {
        foundJsData = true;
        intel.metadata.javascriptParsed = true;
        
        matches.forEach(match => {
          if (index < 4 && match[1]) { // JSON object patterns
            try {
              const jsonData = JSON.parse(match[1]);
              parseJavaScriptPricingData(jsonData, intel);
            } catch (parseError) {
              intel.metadata.debugInfo.push(`JavaScript JSON parse failed: ${parseError.message}`);
            }
          } else if (match[1] && !extractedPrices.has(match[1])) { // Simple price patterns
            extractedPrices.add(match[1]);
            intel.pricing.jsExtractedPrices.push({
              amount: match[1],
              source: 'javascript-regex',
              currency: 'USD',
              pattern: `pattern-${index}`,
              rawMatch: match[0]
            });
          }
        });
      }
    });

    intel.metadata.extractionMethods.push(`JavaScript parsing: ${foundJsData ? 'successful' : 'no data found'} - ${extractedPrices.size} unique prices`);
    
  } catch (error) {
    intel.metadata.extractionMethods.push(`JavaScript parsing failed: ${error.message}`);
  }
}

// NEW: Parse pricing data from JavaScript objects
function parseJavaScriptPricingData(data, intel) {
  function searchForPricing(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Look for pricing objects
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost')) {
        if (typeof value === 'string' || typeof value === 'number') {
          const priceMatch = String(value).match(/(\d+(?:\.\d{2})?)/);
          if (priceMatch) {
            intel.pricing.actualPrices.push({
              amount: priceMatch[1],
              currency: detectCurrency(String(value)),
              context: `JavaScript: ${currentPath}`,
              source: 'javascript-object',
              billing: 'monthly'
            });
          }
        }
      }
      
      // Look for plan objects
      if (key.toLowerCase().includes('plan') && typeof value === 'object' && value.price) {
        const price = String(value.price).match(/(\d+(?:\.\d{2})?)/);
        if (price) {
          intel.pricing.actualPrices.push({
            amount: price[1],
            currency: detectCurrency(String(value.price)),
            context: `JavaScript plan: ${value.name || key}`,
            source: 'javascript-plan',
            billing: 'monthly'
          });
        }
      }
      
      // Recursively search nested objects
      if (typeof value === 'object') {
        searchForPricing(value, currentPath);
      }
    }
  }
  
  searchForPricing(data);
}

// Helper functions
function detectCurrency(text) {
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  return 'USD'; // Default
}

function inferBillingPeriod(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('annual') || lowerText.includes('year')) return 'yearly';
  if (lowerText.includes('month')) return 'monthly';
  return 'unknown';
}

// IMPROVED: Better feature extraction
function extractFeatureIntelligence($, intel) {
  const features = new Set();
  const integrations = new Set();
  
  // Look for feature lists
  $('ul li, ol li').each((i, li) => {
    const text = $(li).text().trim();
    if (text.length > 10 && text.length < 200) {
      if (text.match(/\b(cpq|quote|proposal|contract|billing|automation|workflow|revenue|lifecycle|management|integration|api)\b/gi)) {
        features.add(text);
      }
    }
  });
  
  // Look for integration mentions
  $('*').each((i, el) => {
    if (i > 3000) return false; // Limit for performance
    const text = $(el).text().trim();
    if (text.length < 10 || text.length > 200) return;
    
    const integrationMatch = text.match(/\b(salesforce|hubspot|microsoft|google|adobe|zapier|dynamics|oracle|sap|slack|teams)\b/gi);
    if (integrationMatch) {
      integrations.add(text);
    }
  });
  
  intel.features.core = Array.from(features).slice(0, 20);
  intel.features.integrations = Array.from(integrations).slice(0, 15);
  intel.metadata.extractionMethods.push(`Feature extraction: ${intel.features.core.length} core, ${intel.features.integrations.length} integrations`);
}

function extractCompetitiveIntelligence($, intel) {
  const bodyText = $('body').text().toLowerCase();
  
  // Enhanced competitive threat detection
  const threats = [];
  
  if (bodyText.includes('leader') || bodyText.includes('#1') || bodyText.includes('market leading')) {
    threats.push('Claims market leadership position');
  }
  if (bodyText.includes('ai') || bodyText.includes('artificial intelligence') || bodyText.includes('machine learning')) {
    threats.push('AI-powered features and capabilities');
  }
  if (bodyText.includes('integration') || bodyText.includes('ecosystem') || bodyText.includes('platform')) {
    threats.push('Strong platform and integration capabilities');
  }
  if (bodyText.includes('enterprise') || bodyText.includes('scalable') || bodyText.includes('global')) {
    threats.push('Enterprise-grade solution with global reach');
  }
  
  intel.competitive.immediateThreats = threats;
  intel.metadata.extractionMethods.push(`Competitive analysis: ${threats.length} threats identified`);
}

function extractContentIntelligence($, intel) {
  const content = $('body').text().replace(/\s+/g, ' ').trim();
  intel.content.keyPoints = content.substring(0, 3000); // Increased limit
  intel.metadata.wordCount = content.split(' ').length;
  
  // Enhanced headline extraction
  const headlines = [];
  $('h1, h2, h3, h4').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 200) {
      headlines.push(text);
    }
  });
  
  // Add pricing-related content
  const pricingContent = [];
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.match(/(\$|€|£)\s*\d+|pricing|price|cost|plan/i) && text.length > 10 && text.length < 300) {
      pricingContent.push(text);
    }
  });
  
  intel.content.actualFindings = [
    ...headlines.slice(0, 8).map(headline => ({
      type: 'headline',
      content: headline,
      source: intel.url,
      insight: 'Key messaging point'
    })),
    ...pricingContent.slice(0, 5).map(pricing => ({
      type: 'pricing-content',
      content: pricing,
      source: intel.url,
      insight: 'Pricing-related information'
    }))
  ];
}

// NEW: Post-processing to clean and validate data
function postProcessIntelligence(intel) {
  // Remove duplicate prices
  const seenPrices = new Set();
  intel.pricing.actualPrices = intel.pricing.actualPrices.filter(price => {
    const key = `${price.amount}-${price.currency}-${price.billing}`;
    if (seenPrices.has(key)) {
      return false;
    }
    seenPrices.add(key);
    return true;
  });
  
  // Validate price amounts
  intel.pricing.actualPrices = intel.pricing.actualPrices.filter(price => {
    const amount = parseFloat(price.amount);
    return amount > 0 && amount < 100000; // Reasonable price range
  });
  
  // Determine pricing model
  if (intel.pricing.isGated) {
    intel.pricing.model = 'contact-sales';
  } else if (intel.pricing.actualPrices.length > 0) {
    intel.pricing.model = 'transparent';
  } else {
    intel.pricing.model = 'unknown';
  }
  
  intel.metadata.extractionMethods.push('Post-processing completed');
}

function generateIntelligenceSummary(intel) {
  const totalJsPrices = Array.isArray(intel.pricing.jsExtractedPrices) ? intel.pricing.jsExtractedPrices.length : 0;
  const totalPrices = intel.pricing.actualPrices.length + totalJsPrices;
  
  return {
    totalPricesFound: totalPrices,
    pricingAvailable: !intel.pricing.isGated || totalPrices > 0,
    gatedPricing: intel.pricing.isGated,
    coreFeatures: intel.features.core.length,
    integrations: intel.features.integrations.length,
    immediateThreats: intel.competitive.immediateThreats.length,
    javascriptParsed: intel.metadata.javascriptParsed,
    extractionMethods: intel.metadata.extractionMethods.length,
    pricingModel: intel.pricing.model,
    debugInfo: intel.metadata.debugInfo
  };
}
