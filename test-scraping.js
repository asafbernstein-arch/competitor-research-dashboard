// Simple test for the scraping API
const scrapeModule = require('./api/scrape.js');

async function testScraping() {
    console.log('🧪 Testing scraping API...');
    
    // Mock request and response for testing
    const mockReq = {
        method: 'POST',
        body: {
            url: 'https://pandadoc.com/pricing/',
            type: 'Pricing Page'
        },
        headers: {}
    };
    
    const mockRes = {
        statusCode: 200,
        setHeader: () => {},
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { 
            console.log('✅ Response:', JSON.stringify(data, null, 2)); 
            return this; 
        },
        end: () => {}
    };
    
    try {
        await scrapeModule.default(mockReq, mockRes);
        console.log('Test completed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testScraping();
EOF
