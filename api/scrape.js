// api/scrape.js - Enhanced Universal Competitive Intelligence Scraper
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
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract comprehensive competitive intelligence with JavaScript parsing
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

// Enhanced intelligence extraction with JavaScript content parsing
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
      model: '', 
      isGated: false,
      gatedReason: '',
      jsExtractedPrices: []
    },
    features: { core: [], integrations: [], capabilities: [] },
    positioning: { target: '', messaging: '', differentiators: [] },
    company: { customers: [], funding: '', size: '' },
    competitive: { strengths: [], weaknesses: [], immediateThreats: [] },
    content: { 
      title: '', 
      description: '', 
      keyPoints: '',
      actualFindings: []
    },
    liveData: {
      javascriptData: [],
      apiEndpoints: [],
      dataLayers: []
    },
    metadata: { 
      wordCount: 0, 
      extractionMethods: [],
      javascriptParsed: false
    }
  };

  // Extract basic content
  intelligence.content.title = $('title').text().trim() || $('h1').first().text().trim();
  intelligence.content.description = $('meta[name="description"]').attr('content') || '';

  // ENHANCED: Parse JavaScript content for pricing
  parseJavaScriptContent(rawHtml, intelligence);
  
  // Standard HTML extraction
  extractPricingIntelligence($, intelligence);
  extractFeatureIntelligence($, intelligence);
  extractCompetitiveIntelligence($, intelligence);
  extractContentIntelligence($, intelligence);
  
  return intelligence;
}

// NEW: Parse JavaScript for pricing data
function parseJavaScriptContent(rawHtml, intel) {
  intel.metadata.extractionMethods.push('JavaScript content parsing');
  
  try {
    // Look for common JavaScript data patterns
    const jsPatterns = [
      // Salesforce-style data objects
      /var\s+wpdata\s*=\s*({.*?});/s,
      /window\.wpdata\s*=\s*({.*?});/s,
      
      // Generic pricing data patterns
      /"price":\s*"?(\d+)"?/g,
      /"amount":\s*"?(\d+)"?/g,
      /price["\']?\s*:\s*["\']?(\$?\d+(?:,\d+)*(?:\.\d{2})?)["\']?/g,
      
      // Product/plan data
      /products?\s*:\s*\[(.*?)\]/s,
      /plans?\s*:\s*\[(.*?)\]/s
    ];

    let foundJsData = false;

    jsPatterns.forEach((pattern, index) => {
      const matches = rawHtml.match(pattern);
      if (matches) {
        foundJsData = true;
        intel.metadata.javascriptParsed = true;
        
        if (index < 2 && matches[1]) { // wpdata patterns
          try {
            const jsonData = JSON.parse(matches[1]);
            parseWpData(jsonData, intel);
          } catch (parseError) {
            intel.metadata.extractionMethods.push(`wpdata parse failed: ${parseError.message}`);
          }
        } else if (index >= 2) { // price patterns
          matches.forEach(match => {
            const priceValue = match.match(/(\d+)/)?.[1];
            if (priceValue) {
              intel.pricing.jsExtractedPrices.push({
                amount: priceValue,
                source: 'javascript-regex',
                pattern: `pattern-${index}`
              });
            }
          });
        }
      }
    });

    intel.metadata.extractionMethods.push(`JavaScript parsing: ${foundJsData ? 'successful' : 'no data found'}`);
    
  } catch (error) {
    intel.metadata.extractionMethods.push(`JavaScript parsing failed: ${error.message}`);
  }
}

// Parse Salesforce-style wpdata objects
function parseWpData(wpdata, intel) {
  try {
    // Look for pricing information in nested structures
    function searchForPricing(obj, path = '') {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Look for price-related keys
        if (key.toLowerCase().includes('price') && (typeof value === 'string' || typeof value === 'number')) {
          const priceMatch = String(value).match(/(\d+)/);
          if (priceMatch) {
            intel.pricing.actualPrices.push({
              amount: priceMatch[1],
              currency: String(value).match(/(USD|EUR|GBP|\$|€|£)/)?.[0] || 'EUR',
              context: `JavaScript: ${currentPath}`,
              source: 'javascript',
              billing: 'monthly'
            });
          }
        }
        
        // Look for amount fields
        if (key.toLowerCase() === 'amount' && (typeof value === 'string' || typeof value === 'number')) {
          const amountMatch = String(value).match(/(\d+)/);
          if (amountMatch) {
            intel.pricing.actualPrices.push({
              amount: amountMatch[1],
              currency: 'EUR',
              context: `JavaScript amount: ${currentPath}`,
              source: 'javascript',
              billing: 'monthly'
            });
          }
        }
        
        // Look for product/plan information
        if ((key.toLowerCase().includes('product') || key.toLowerCase().includes('plan')) && 
            value && typeof value === 'object') {
          
          if (value.headline || value.name) {
            const planName = value.headline || value.name;
            const features = [];
            
            // Extract features if available
            if (value.feature_list && Array.isArray(value.feature_list)) {
              features.push(...value.feature_list.map(f => f.description || f.name || f).filter(Boolean));
            }
            
            intel.pricing.plans.push({
              name: planName,
              features: features,
              source: 'javascript'
            });
          }
        }
        
        // Recursively search nested objects and arrays
        if (typeof value === 'object') {
          searchForPricing(value, currentPath);
        }
      }
    }
    
    searchForPricing(wpdata);
    intel.liveData.javascriptData.push('wpdata object parsed successfully');
    
  } catch (error) {
    intel.metadata.extractionMethods.push(`wpdata parsing failed: ${error.message}`);
  }
}

// Enhanced pricing extraction
function extractPricingIntelligence($, intel) {
  const prices = [];
  const bodyText = $('body').text().toLowerCase();
  
  // Check if pricing is gated
  const gatedIndicators = ['contact sales', 'get a quote', 'request pricing', 'talk to sales'];
  const isGated = gatedIndicators.some(indicator => bodyText.includes(indicator));
  
  intel.pricing.isGated = isGated;
  if (isGated) {
    intel.pricing.gatedReason = 'Contact sales required';
    intel.metadata.extractionMethods.push('Pricing detected as gated');
  }

  // Extract visible prices from HTML
  $('*').each((i, el) => {
    if (i > 2000) return false;
    const text = $(el).text().trim();
    if (text.length < 5 || text.length > 300) return;
    
    const priceMatch = text.match(/(\$\d+(?:,\d+)*(?:\.\d{2})?|€\d+(?:,\d+)*(?:\.\d{2})?|£\d+(?:,\d+)*(?:\.\d{2})?)/g);
    if (priceMatch) {
      prices.push({
        amount: priceMatch[0],
        context: text,
        billing: text.match(/(month|annual|year|user|seat)/i)?.[0] || 'unknown',
        source: 'html'
      });
    }
  });

  intel.pricing.actualPrices.push(...prices);
  intel.metadata.extractionMethods.push(`HTML pricing extraction: ${prices.length} prices found`);
}

// Extract competitive intelligence
function extractCompetitiveIntelligence($, intel) {
  const bodyText = $('body').text().toLowerCase();
  
  // Immediate competitive threats
  if (bodyText.includes('leader') || bodyText.includes('#1')) {
    intel.competitive.immediateThreats.push('Claims market leadership');
  }
  if (bodyText.includes('ai') || bodyText.includes('artificial intelligence')) {
    intel.competitive.immediateThreats.push('AI-powered features');
  }
  if (bodyText.includes('integration') || bodyText.includes('ecosystem')) {
    intel.competitive.immediateThreats.push('Strong integration capabilities');
  }
  
  intel.metadata.extractionMethods.push(`Competitive analysis: ${intel.competitive.immediateThreats.length} threats identified`);
}

function extractFeatureIntelligence($, intel) {
  const features = [];
  const integrations = [];
  
  $('*').each((i, el) => {
    if (i > 2000) return false;
    const text = $(el).text().trim();
    if (text.length < 10 || text.length > 200) return;
    
    // CPQ-specific features
    if (text.match(/\b(cpq|quote|proposal|contract|billing|automation|workflow|crm|api|revenue|lifecycle|management)\b/gi)) {
      features.push(text);
    }
    
    // Integration detection
    if (text.match(/\b(salesforce|hubspot|microsoft|google|adobe|zapier|dynamics|oracle|sap)\b/gi)) {
      integrations.push(text);
    }
  });
  
  intel.features.core = [...new Set(features)].slice(0, 15);
  intel.features.integrations = [...new Set(integrations)].slice(0, 10);
}

function extractContentIntelligence($, intel) {
  const content = $('body').text().replace(/\s+/g, ' ').trim();
  intel.content.keyPoints = content.substring(0, 2000);
  intel.metadata.wordCount = content.split(' ').length;
  
  // Actual findings with context
  const headlines = [];
  $('h1, h2, h3').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 10 && text.length < 150) {
      headlines.push(text);
    }
  });
  
  intel.content.actualFindings = headlines.slice(0, 5).map(headline => ({
    type: 'headline',
    content: headline,
    source: intel.url,
    insight: 'Key messaging point'
  }));
}

function generateIntelligenceSummary(intel) {
  const totalJsPrices = Array.isArray(intel.pricing.jsExtractedPrices) ? intel.pricing.jsExtractedPrices.length : 0;
  
  return {
    totalPricesFound: intel.pricing.actualPrices.length + totalJsPrices,
    pricingAvailable: !intel.pricing.isGated || intel.pricing.actualPrices.length > 0 || totalJsPrices > 0,
    gatedPricing: intel.pricing.isGated,
    coreFeatures: intel.features.core.length,
    integrations: intel.features.integrations.length,
    immediateThreats: intel.competitive.immediateThreats.length,
    javascriptParsed: intel.metadata.javascriptParsed,
    extractionMethods: intel.metadata.extractionMethods.length
  };
}
