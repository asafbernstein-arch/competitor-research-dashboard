cat > test-scraping-fixed.js << 'EOF'
// Node.js compatible test for scraping functionality
const cheerio = require('cheerio');

// Copy the scraping logic directly (CommonJS version)
async function testScraping() {
    console.log('🧪 Testing scraping functionality...');
    
    const url = 'https://pandadoc.com/pricing/';
    const type = 'Pricing Page';
    
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
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Extract title
        const title = $('title').text() || $('h1').first().text() || 'No title found';
        
        // Extract content
        $('script, style, nav, footer, header').remove();
        const content = $('body').text().trim().replace(/\s+/g, ' ').substring(0, 1000);
        
        console.log('✅ SUCCESS!');
        console.log(`   Title: ${title.trim()}`);
        console.log(`   Content Length: ${content.length} characters`);
        console.log(`   Content Sample: "${content.substring(0, 200)}..."`);
        
        // Check for pricing patterns
        const pricingMatches = content.match(/\$\d+|\€\d+|USD|\d+\/month|per user|free trial/gi) || [];
        console.log(`   Pricing Indicators: ${pricingMatches.length} found (${pricingMatches.slice(0, 3).join(', ')})`);
        
        return { success: true, title, contentLength: content.length };
        
    } catch (error) {
        console.error(`❌ FAILED: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Run the test
testScraping().then(result => {
    console.log('\n🎯 Test Result:', result.success ? 'SUCCESS' : 'FAILED');
});
EOF
