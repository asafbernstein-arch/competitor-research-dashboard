// api/scrape.js - Universal Competitive Intelligence Scraper
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
    console.log(`🌐 Universal scraping ${type}: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

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
    
    // Extract comprehensive competitive intelligence
    const intelligence = extractCompetitiveIntelligence($, url, type);

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
        changeIndicators: intelligence.metadata.changeIndicators
      },

      // New comprehensive intelligence data
      intelligence: intelligence,
      
      // Quick access to key data
      pricing: intelligence.pricing,
      features: intelligence.features,
      positioning: intelligence.positioning,
      competitive: intelligence.competitive,
      integrations: intelligence.features.integrations,
      
      // Analysis summary
      summary: generateIntelligenceSummary(intelligence)
    });

  } catch (error) {
    console.error('❌ Universal scraping error:', error);
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

// Universal competitive intelligence extractor
function extractCompetitiveIntelligence($, url, pageType) {
  // Remove noise
  $('script, style, nav, footer, header, .cookie-banner, .popup, .modal, .advertisement').remove();
  
  const intelligence = {
    url,
    pageType,
    timestamp: new Date().toISOString(),
    pricing: { plans: [], prices: [], model: '', billingOptions: [] },
    features: { core: [], integrations: [], capabilities: [], technical: [] },
    positioning: { target: '', messaging: '', differentiators: [], marketClaims: [] },
    company: { size: '', funding: '', customers: [], teamSize: '' },
    technical: { apis: [], platforms: [], security: [], compliance: [] },
    competitive: { strengths: [], weaknesses: [], threats: [], advantages: [] },
    content: { title: '', description: '', keyPoints: '', headlines: [] },
    metadata: { wordCount: 0, lastModified: '', changeIndicators: [], extractionMethods: [] }
  };

  // Extract title and basic info
  intelligence.content.title = $('title').text().trim() || $('h1').first().text().trim();
  intelligence.content.description = $('meta[name="description"]').attr('content') || '';

  // Run all extraction modules
  extractPricingIntelligence($, intelligence);
  extractFeatureIntelligence($, intelligence);
  extractTechnicalIntelligence($, intelligence);
  extractPositioningIntelligence($, intelligence);
  extractCompanyIntelligence($, intelligence);
  extractCompetitiveThreats($, intelligence);
  extractContentIntelligence($, intelligence);
  
  return intelligence;
}

function extractPricingIntelligence($, intel) {
  const prices = [];
  const plans = [];
  const billingOptions = [];
  
  $('*').each((i, el) => {
    if (i > 2500) return false;
    const text = $(el).text().trim();
    if (text.length < 5 || text.length > 400) return;
    
    // Enhanced price detection
    const priceRegex = /(\$\d+(?:[,\.]\d+)*(?:\.\d{2})?|\d+\s*USD|€\d+|£\d+|free|custom|contact)/gi;
    const priceMatches = text.match(priceRegex);
    
    if (priceMatches) {
      prices.push({
        amount: priceMatches[0],
        context: text,
        billing: text.match(/(month|annual|year|user|seat)/i)?.[0] || 'unknown',
        element: el.tagName
      });
    }
    
    // Plan detection with features
    if (text.match(/\b(free|trial|starter|basic|standard|professional?|business|enterprise|premium|pro|plus|advanced|ultimate|team|individual)\b/gi)) {
      if (text.length < 200) {
        const planFeatures = extractNearbyFeatures($(el), $);
        plans.push({
          name: text.substring(0, 100),
          features: planFeatures,
          priceContext: findNearbyPrice($(el), $)
        });
      }
    }
    
    // Billing options
    if (text.match(/\b(monthly|annual|yearly|pay\s*as\s*you\s*go|usage\s*based)\b/gi)) {
      billingOptions.push(text.substring(0, 80));
    }
  });
  
  intel.pricing.prices = [...new Map(prices.map(p => [`${p.amount}-${p.billing}`, p])).values()];
  intel.pricing.plans = plans.slice(0, 8);
  intel.pricing.billingOptions = [...new Set(billingOptions)].slice(0, 5);
  
  // Detect pricing model
  const bodyText = $('body').text().toLowerCase();
  if (bodyText.includes('per user') || bodyText.includes('per seat')) intel.pricing.model = 'per-user';
  else if (bodyText.includes('usage based') || bodyText.includes('pay as you go')) intel.pricing.model = 'usage-based';
  else if (bodyText.includes('flat rate') || bodyText.includes('unlimited users')) intel.pricing.model = 'flat-rate';
  else intel.pricing.model = 'subscription';
  
  intel.metadata.extractionMethods.push(`Pricing: Found ${prices.length} prices, ${plans.length} plans`);
}

function extractFeatureIntelligence($, intel) {
  const features = [];
  const integrations = [];
  const capabilities = [];
  const technical = [];
  
  $('*').each((i, el) => {
    if (i > 3000) return false;
    const text = $(el).text().trim();
    if (text.length < 8 || text.length > 250) return;
    
    // Core features - CPQ/Sales specific
    if (text.match(/\b(cpq|quote|proposal|contract|esignature|approval|workflow|automation|template|billing|invoicing|crm|pipeline)\b/gi)) {
      features.push(text);
    }
    
    // Integration detection - comprehensive
    if (text.match(/\b(salesforce|hubspot|pipedrive|dynamics|freshworks|zapier|slack|microsoft|google|adobe|docusign|zoom|teams|asana|jira)\b/gi)) {
      integrations.push(text);
    }
    
    // Capabilities - action-oriented
    if (text.match(/\b(create|generate|automate|integrate|manage|track|analyze|report|configure|customize|streamline|optimize)\b/gi) && text.length < 120) {
      capabilities.push(text);
    }
    
    // Technical features
    if (text.match(/\b(api|webhook|sso|saml|oauth|rest|graphql|sdk|mobile\s*app|white\s*label)\b/gi)) {
      technical.push(text);
    }
  });
  
  intel.features.core = [...new Set(features)].slice(0, 20);
  intel.features.integrations = [...new Set(integrations)].slice(0, 15);
  intel.features.capabilities = [...new Set(capabilities)].slice(0, 15);
  intel.features.technical = [...new Set(technical)].slice(0, 10);
  
  intel.metadata.extractionMethods.push(`Features: ${features.length} core, ${integrations.length} integrations`);
}

function extractTechnicalIntelligence($, intel) {
  const bodyText = $('body').text().toLowerCase();
  
  // API capabilities
  if (bodyText.includes('rest api') || bodyText.includes('api')) intel.technical.apis.push('REST API');
  if (bodyText.includes('webhook')) intel.technical.apis.push('Webhooks');
  if (bodyText.includes('graphql')) intel.technical.apis.push('GraphQL');
  if (bodyText.includes('sdk')) intel.technical.apis.push('SDK');
  
  // Platform support
  if (bodyText.includes('cloud') || bodyText.includes('saas')) intel.technical.platforms.push('Cloud/SaaS');
  if (bodyText.includes('on-premise') || bodyText.includes('on-prem')) intel.technical.platforms.push('On-Premise');
  if (bodyText.includes('mobile app') || bodyText.includes('ios') || bodyText.includes('android')) intel.technical.platforms.push('Mobile');
  
  // Security & Compliance
  if (bodyText.includes('sso') || bodyText.includes('single sign')) intel.technical.security.push('SSO');
  if (bodyText.includes('saml')) intel.technical.security.push('SAML');
  if (bodyText.includes('oauth')) intel.technical.security.push('OAuth');
  if (bodyText.includes('gdpr')) intel.technical.compliance.push('GDPR');
  if (bodyText.includes('hipaa')) intel.technical.compliance.push('HIPAA');
  if (bodyText.includes('soc 2') || bodyText.includes('soc2')) intel.technical.compliance.push('SOC 2');
}

function extractPositioningIntelligence($, intel) {
  const bodyText = $('body').text().toLowerCase();
  
  // Target market detection
  if ((bodyText.includes('enterprise') || bodyText.includes('large')) && bodyText.includes('organization')) {
    intel.positioning.target = 'Enterprise';
  } else if (bodyText.includes('small business') || bodyText.includes('smb')) {
    intel.positioning.target = 'SMB';
  } else if (bodyText.includes('mid-market') || bodyText.includes('medium business')) {
    intel.positioning.target = 'Mid-Market';
  } else {
    intel.positioning.target = 'General';
  }
  
  // Key messaging from headlines
  const headlines = [];
  $('h1, h2, h3, .hero, .tagline, .headline, .value-prop').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 15 && text.length < 200) {
      headlines.push(text);
    }
  });
  intel.content.headlines = headlines.slice(0, 8);
  intel.positioning.messaging = headlines.slice(0, 3).join(' | ');
  
  // Market claims
  if (bodyText.includes('leader') || bodyText.includes('#1') || bodyText.includes('leading')) {
    intel.positioning.marketClaims.push('Market Leader');
  }
  if (bodyText.includes('award') || bodyText.includes('winner')) {
    intel.positioning.marketClaims.push('Award Winner');
  }
}

function extractCompanyIntelligence($, intel) {
  const bodyText = $('body').text();
  
  // Customer count
  const customerMatches = bodyText.match(/(\d+[k]?\+?)\s*(customers?|companies|businesses|users)/gi) || [];
  intel.company.customers = customerMatches.slice(0, 5);
  
  // Team size indicators
  const teamMatches = bodyText.match(/(\d+[k]?\+?)\s*(employees|team members|people)/gi) || [];
  intel.company.teamSize = teamMatches[0] || '';
  
  // Funding indicators
  if (bodyText.match(/series [abc]|funded|raised|\$\d+[m|b]/i)) {
    intel.company.funding = 'VC-Backed';
  } else if (bodyText.match(/public|nasdaq|nyse|ipo/i)) {
    intel.company.funding = 'Public Company';
  } else {
    intel.company.funding = 'Unknown';
  }
}

function extractCompetitiveThreats($, intel) {
  const bodyText = $('body').text().toLowerCase();
  
  // Strength indicators
  if (bodyText.includes('native integration') || bodyText.includes('deep integration')) {
    intel.competitive.strengths.push('Native CRM Integration');
  }
  if (bodyText.includes('no-code') || bodyText.includes('easy setup')) {
    intel.competitive.strengths.push('Ease of Implementation');
  }
  if (bodyText.includes('ai') || bodyText.includes('artificial intelligence') || bodyText.includes('machine learning')) {
    intel.competitive.strengths.push('AI/ML Capabilities');
  }
  
  // Competitive advantages
  if (bodyText.includes('fastest') || bodyText.includes('quickest')) {
    intel.competitive.advantages.push('Speed/Performance');
  }
  if (bodyText.includes('most secure') || bodyText.includes('bank-grade')) {
    intel.competitive.advantages.push('Security');
  }
}

function extractContentIntelligence($, intel) {
  // Get clean, comprehensive content
  const content = $('body').text().replace(/\s+/g, ' ').trim();
  intel.content.keyPoints = content.substring(0, 3000); // Increased for more context
  intel.metadata.wordCount = content.split(' ').length;
  
  // Change indicators
  const changeWords = ['new', 'updated', 'recently', 'now', 'latest', 'introducing', '2024', '2025'];
  changeWords.forEach(word => {
    if (content.toLowerCase().includes(word)) {
      intel.metadata.changeIndicators.push(word);
    }
  });
  
  // Last modified detection
  const lastModified = $('meta[name="last-modified"]').attr('content') || 
                      $('meta[property="article:modified_time"]').attr('content') || 
                      '';
  intel.metadata.lastModified = lastModified;
}

// Helper functions
function extractNearbyFeatures($element, $) {
  const features = [];
  $element.siblings().find('li, .feature, .benefit').each((i, el) => {
    if (i > 8) return false;
    const feature = $(el).text().trim();
    if (feature.length > 8 && feature.length < 120) {
      features.push(feature);
    }
  });
  return features.slice(0, 6);
}

function findNearbyPrice($element, $) {
  const nearby = $element.parent().text() + ' ' + $element.siblings().text();
  const priceMatch = nearby.match(/\$\d+[\d,]*(?:\.\d{2})?/);
  return priceMatch ? priceMatch[0] : '';
}

function generateIntelligenceSummary(intel) {
  return {
    totalPrices: intel.pricing.prices.length,
    totalPlans: intel.pricing.plans.length,
    coreFeatures: intel.features.core.length,
    integrations: intel.features.integrations.length,
    targetMarket: intel.positioning.target,
    pricingModel: intel.pricing.model,
    hasAPI: intel.technical.apis.length > 0,
    changeIndicators: intel.metadata.changeIndicators.length,
    threatLevel: intel.competitive.strengths.length > 2 ? 'High' : 
                intel.competitive.strengths.length > 0 ? 'Medium' : 'Low'
  };
}
