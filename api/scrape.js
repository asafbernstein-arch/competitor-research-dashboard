// api/scrape.js (Simple version without Puppeteer)
const cheerio = require('cheerio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Fetching ${url} (${type})`);
    
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'No title found';
    
    // Extract relevant content based on page type
    const extractedContent = extractRelevantContent($, type, url);

    // Extract metadata
    const metadata = {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || ''
    };

    res.status(200).json({
      success: true,
      url: url,
      type: type,
      title: title.trim(),
      content: extractedContent,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      contentLength: extractedContent.length
    });

  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    
    res.status(500).json({
      success: false,
      url: url,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function extractRelevantContent($, type, url) {
  // Remove unwanted elements
  $('script, style, nav, footer, header, .cookie-banner, .popup, .advertisement').remove();

  let content = '';

  try {
    if (type === 'Pricing Page') {
      content = extractPricingContent($);
    } else if (type === 'Main Product Page' || type === 'Product Page') {
      content = extractProductContent($);
    } else if (type === 'Knowledge Center' || type === 'Documentation') {
      content = extractDocumentationContent($);
    } else {
      content = extractGeneralContent($);
    }

    // Fallback if specific extraction didn't work well
    if (content.length < 300) {
      content = extractGeneralContent($);
    }

  } catch (error) {
    console.error('Content extraction error:', error);
    content = extractGeneralContent($);
  }

  return cleanText(content);
}

function extractPricingContent($) {
  let content = '';
  
  // Target pricing-specific elements
  const pricingSelectors = [
    '.pricing, .price, .plan, .tier, .package, .subscription',
    '[class*="pricing"], [class*="price"], [class*="plan"]',
    '[data-testid*="pricing"], [data-testid*="plan"]',
    '.billing, .cost, .fee',
    'h2:contains("Pricing"), h3:contains("Plans")',
    '*:contains("$"), *:contains("€"), *:contains("USD")'
  ];

  pricingSelectors.forEach(selector => {
    try {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 3) {
          content += text + '\n';
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  // Look for pricing patterns in all text
  $('*').each((i, el) => {
    if (i > 1000) return false; // Limit processing
    
    const text = $(el).text();
    if (text.length < 200 && text.match(/\$\d+|\€\d+|USD|per month|per user|\/month|\/user|free trial|enterprise|starter|professional|premium|basic plan/i)) {
      content += text.trim() + '\n';
    }
  });

  return content;
}

function extractProductContent($) {
  let content = '';
  
  // Extract main content areas
  const productSelectors = [
    'main', '.main-content', '.content', '[role="main"]',
    '.hero', '.banner', '.intro',
    '.features', '.benefits', '.capabilities', '.overview',
    'h1, h2, h3',
    '.description', '.summary',
    '.product-info', '.about',
    '.value-prop', '.selling-points'
  ];

  productSelectors.forEach(selector => {
    try {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10 && text.length < 1000) {
          content += text + '\n';
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  return content;
}

function extractDocumentationContent($) {
  let content = '';
  
  const docSelectors = [
    '.documentation', '.docs', '.api-docs',
    '.guide', '.tutorial', '.getting-started',
    '.integration', '.developer', '.dev-docs',
    'article', '.article',
    '.content-area', '.doc-content', '.readme',
    '.instructions', '.setup', '.quickstart'
  ];

  docSelectors.forEach(selector => {
    try {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) {
          content += text + '\n';
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });

  return content;
}

function extractGeneralContent($) {
  let content = '';
  
  // Try main content areas first
  const mainSelectors = ['main', '.main', '.content', '[role="main"]', '.container'];
  
  for (const selector of mainSelectors) {
    const mainContent = $(selector).first().text().trim();
    if (mainContent.length > 200) {
      content = mainContent;
      break;
    }
  }

  // Fallback to body if main content not found
  if (content.length < 200) {
    content = $('body').text().trim();
  }

  return content;
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim()
    .substring(0, 10000); // Limit content length for API efficiency
}
