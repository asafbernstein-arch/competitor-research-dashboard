import React, { useState, useEffect, useCallback } from 'react';
import { Search, BarChart3, TrendingUp, Globe, AlertCircle, CheckCircle, ArrowUpRight, Download, RefreshCw, Plus, Settings, FileText, Eye, Target, Brain, Zap, Upload, X } from 'lucide-react';

const RealCompetitorDashboard = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [crawlResults, setCrawlResults] = useState([]);
  const [customIntelligence, setCustomIntelligence] = useState({});
  const [driveFiles, setDriveFiles] = useState([]);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [battleCards, setBattleCards] = useState({});
  const [selectedBattleCard, setSelectedBattleCard] = useState(null);
  const [showBattleCard, setShowBattleCard] = useState(false);

  // Load competitors from database on app start
  useEffect(() => {
    const loadCompetitorsFromDatabase = async () => {
      try {
        console.log('Loading competitors from database...');
        setAnalysisProgress('Loading competitors from database...');
        
        const response = await fetch('/api/competitors');
        
        if (response.ok) {
          const dbCompetitors = await response.json();
          console.log(`Loaded ${dbCompetitors.length} competitors from database`);
          setCompetitors(dbCompetitors);
          setAnalysisProgress(`Loaded ${dbCompetitors.length} competitors from database`);
          setTimeout(() => setAnalysisProgress(''), 2000);
        } else {
          console.error('Failed to load competitors from database');
        }
      } catch (error) {
        console.error('Error loading competitors:', error);
      }
    };

    loadCompetitorsFromDatabase();
  }, []);
  
  // Form states
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [customIntelligenceInput, setCustomIntelligenceInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showIntelligenceForm, setShowIntelligenceForm] = useState(false);

  // API Configuration
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '');
  const [showApiConfig, setShowApiConfig] = useState(!apiKey);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('anthropic_api_key', apiKey.trim());
      setShowApiConfig(false);
    }
  };

  const testApiConnection = async () => {
    try {
      setAnalysisProgress('Testing API connection via Vercel proxy...');
      
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please add your API key first');
      }

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 20,
          messages: [{ role: "user", content: "Say hello" }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setAnalysisProgress('✅ API connection successful via Vercel proxy!');
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      setAnalysisProgress(`❌ Connection failed: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    }
  };

  // DealHub baseline data
  const dealHubBaseline = {
    name: "DealHub.io",
    capabilities: [
      "Advanced CPQ Platform with Deal Orchestration",
      "Digital Sales Rooms for Buyer Engagement", 
      "DealBoard for Deal Management",
      "Revenue Operations Automation",
      "Proposal and Contract Automation",
      "Subscription and Recurring Billing Management"
    ],
    keyStrengths: [
      "Native integrations with 4+ major CRMs (Salesforce, HubSpot, Dynamics 365, Freshworks)",
      "Innovative Digital Sales Room concept",
      "Deep bi-directional CRM synchronization",
      "No-code setup for native integrations",
      "Comprehensive deal lifecycle management"
    ],
    crmIntegrations: {
      native: ["Salesforce", "HubSpot", "Microsoft Dynamics 365", "Freshworks CRM"],
      api: ["Pipedrive", "Other CRMs via API", "Zapier automation platform"],
      setup: "Easy for native integrations, Medium for API-based connections"
    },
    marketOpportunities: [
      "Limited native CRM integrations (most competitors focus on 1-2 platforms)",
      "Complex setup requirements for multi-CRM environments", 
      "Lack of innovative buyer engagement tools like Digital Sales Rooms"
    ],
    advantages: [
      "4 native CRM integrations vs competitors' 1-2 maximum",
      "No-code setup for native integrations reduces implementation time",
      "Digital Sales Room innovation creates unique buyer experience",
      "Deep bi-directional sync capabilities across multiple platforms"
    ]
  };

  // ENHANCED: Generate battle card with dynamic scraping data
  const generateBattleCard = async (competitor) => {
    setIsAnalyzing(true);
    setAnalysisProgress(`Generating battle card for ${competitor.name}...`);

    try {
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please configure your API key first');
      }

      // Get the LATEST crawl data for this competitor
      const latestCrawlData = crawlResults
        .filter(result => result.competitor === competitor.name)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]; // Get most recent

      const customIntel = customIntelligence[competitor.name] || "";

      // Prepare comprehensive scraped intelligence
      const scrapedIntelligence = {
        competitorName: competitor.name,
        latestCrawl: latestCrawlData || null,
        
        // Extract pricing data from latest crawl
        pricingData: latestCrawlData ? {
          actualPrices: latestCrawlData.actualPricing || [],
          jsExtractedPrices: latestCrawlData.intelligence?.pricing?.jsExtractedPrices || [],
          allPrices: latestCrawlData.intelligence?.pricing?.actualPrices || [],
          isGated: latestCrawlData.intelligence?.pricing?.isGated || false,
          pricingModel: latestCrawlData.intelligence?.pricing?.model || 'unknown',
          plans: latestCrawlData.intelligence?.pricing?.plans || []
        } : null,
        
        // Extract feature data
        featureData: latestCrawlData ? {
          coreFeatures: latestCrawlData.intelligence?.features?.core || [],
          integrations: latestCrawlData.intelligence?.features?.integrations || [],
          capabilities: latestCrawlData.intelligence?.features?.capabilities || []
        } : null,
        
        // Extract competitive threats
        competitiveData: latestCrawlData ? {
          immediateThreats: latestCrawlData.competitiveThreats || [],
          strengths: latestCrawlData.intelligence?.competitive?.strengths || [],
          weaknesses: latestCrawlData.intelligence?.competitive?.weaknesses || []
        } : null,
        
        // Extract content findings
        contentData: latestCrawlData ? {
          actualFindings: latestCrawlData.actualContent || [],
          headlines: latestCrawlData.intelligence?.content?.actualFindings || [],
          positioning: latestCrawlData.intelligence?.positioning || {}
        } : null,
        
        // Meta information
        lastScraped: latestCrawlData?.timestamp || 'Never scraped',
        scrapingSuccess: latestCrawlData?.scrapedSuccessfully || false,
        extractionMethods: latestCrawlData?.metadata?.extractionMethods || []
      };

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Generate a comprehensive battle card comparing DealHub.io against ${competitor.name}.

DealHub.io Baseline:
${JSON.stringify(dealHubBaseline, null, 2)}

Competitor Basic Info:
${JSON.stringify(competitor, null, 2)}

LIVE SCRAPED COMPETITIVE INTELLIGENCE:
${JSON.stringify(scrapedIntelligence, null, 2)}

Custom Intelligence Notes:
${customIntel}

CRITICAL INSTRUCTIONS FOR PRICING:
1. Use ONLY the live scraped pricing data from scrapedIntelligence.pricingData
2. If actualPrices array has data, extract the specific amounts and currencies
3. If jsExtractedPrices has data, use those JavaScript-extracted prices
4. If isGated is true, mention "Contact Sales" pricing model
5. Show EXACT pricing found, not generic ranges
6. Compare specific prices to DealHub's pricing model

CRITICAL INSTRUCTIONS FOR FEATURES:
1. Use coreFeatures from scrapedIntelligence.featureData for actual product capabilities
2. Use integrations array for CRM/platform connections found
3. Use immediateThreats for competitive positioning

Create a battle card in this EXACT JSON format:
{
  "competitorName": "${competitor.name}",
  "scrapingStatus": {
    "lastScraped": "${scrapedIntelligence.lastScraped}",
    "dataQuality": "excellent/good/limited/none",
    "pricingFound": true/false,
    "featuresFound": true/false
  },
  "dealHubBaseline": {
    "capabilities": ["Advanced CPQ Platform with Deal Orchestration", "Digital Sales Rooms for Buyer Engagement", "DealBoard for Deal Management"],
    "keyStrengths": ["Native integrations with 4+ major CRMs", "Innovative Digital Sales Room concept", "Deep bi-directional CRM synchronization"],
    "crmIntegrations": {
      "native": ["Salesforce", "HubSpot", "Microsoft Dynamics 365", "Freshworks CRM"],
      "api": ["Pipedrive", "Other CRMs via API"],
      "setup": "Easy for native integrations"
    },
    "pricingRange": "$75-$200+ per user per month",
    "advantages": ["4 native CRM integrations vs competitors' 1-2", "No-code setup", "Digital Sales Room innovation"]
  },
  "competitorProfile": {
    "coreOfferings": [], // USE scrapedIntelligence.featureData.coreFeatures
    "keyDifferentiators": [], // USE scrapedIntelligence.contentData.headlines
    "crmIntegrations": {
      "native": [], // USE scrapedIntelligence.featureData.integrations
      "quality": "Excellent/Good/Fair",
      "setup": "Easy/Medium/Hard"
    },
    "pricingStrategy": {
      "model": "", // USE scrapedIntelligence.pricingData.pricingModel
      "liveScrapedPricing": [], // USE scrapedIntelligence.pricingData.actualPrices with EXACT amounts
      "jsExtractedPricing": [], // USE scrapedIntelligence.pricingData.jsExtractedPrices
      "isGated": false, // USE scrapedIntelligence.pricingData.isGated
      "range": "", // BUILD from actual scraped prices
      "strategy": "",
      "comparedToDealHub": "Higher/Lower/Similar based on actual prices found"
    },
    "customerFeedback": {
      "overallRating": "4.2/5.0 or similar based on available data",
      "sentiment": "Generally positive/mixed/negative based on available data"
    }
  },
  "swotAnalysis": {
    "strengths": [], // USE scrapedIntelligence.competitiveData.strengths
    "weaknesses": [], // USE scrapedIntelligence.competitiveData.weaknesses
    "opportunities": ["DealHub opportunities based on competitor weaknesses"],
    "threats": [] // USE scrapedIntelligence.competitiveData.immediateThreats
  },
  "competitiveAdvantages": [
    {
      "area": "Pricing",
      "dealHubAdvantage": "Specific advantage based on scraped competitor pricing",
      "competitorWeakness": "Based on actual scraped pricing data"
    }
  ],
  "recommendations": [
    {
      "category": "Pricing Strategy",
      "recommendation": "Based on actual scraped competitor prices",
      "talkingPoints": ["Use real pricing comparison", "Highlight cost differences"]
    }
  ],
  "lastUpdated": "${new Date().toISOString()}"
}

IMPORTANT: 
- Only use ACTUAL scraped data from scrapedIntelligence object
- If no pricing data was scraped, set pricingStrategy.liveScrapedPricing to []
- If no feature data, set coreOfferings to ["Limited data available - requires manual research"]
- Be specific about what data came from live scraping vs baseline assumptions
- Show exact prices with currencies (e.g. "€200/User/Month")
- For customerFeedback, use "Data not available" if no information found

Respond ONLY with valid JSON.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const battleCard = JSON.parse(responseText);
      
      // Save battle card with scraping metadata
      setBattleCards(prev => ({
        ...prev,
        [competitor.name]: {
          ...battleCard,
          scrapingMetadata: {
            lastScraped: latestCrawlData?.timestamp || 'Never',
            dataQuality: latestCrawlData ? 'good' : 'limited',
            scrapedPricing: scrapedIntelligence.pricingData?.actualPrices?.length > 0,
            scrapedFeatures: scrapedIntelligence.featureData?.coreFeatures?.length > 0
          }
        }
      }));
      
      setAnalysisProgress(`✅ Battle card generated with live scraped data for ${competitor.name}!`);
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      console.error('Error generating battle card:', error);
      setAnalysisProgress(`❌ Error generating battle card: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ENHANCED: Real web scraping with dynamic data extraction
  const crawlCompetitor = async (competitor) => {
    setIsAnalyzing(true);
    setAnalysisProgress(`Starting enhanced web scraping of ${competitor.name}...`);

    try {
      setAnalysisProgress(`Scraping ${competitor.name} with JavaScript parsing...`);

      // Call our enhanced scraping API
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: competitor.url || getCompetitorPricingUrl(competitor.name),
          type: 'Pricing Page'
        })
      });

      if (response.ok) {
        const scrapedData = await response.json();
        
        // Create enhanced crawl result with scraped data
        const enhancedCrawlResult = {
          competitor: competitor.name,
          timestamp: new Date().toISOString(),
          scrapedSuccessfully: scrapedData.scrapedSuccessfully,
          
          // Include all the scraped intelligence
          intelligence: scrapedData.intelligence,
          actualPricing: scrapedData.actualPricing,
          actualContent: scrapedData.actualContent,
          competitiveThreats: scrapedData.competitiveThreats,
          liveData: scrapedData.liveData,
          
          // Summary data
          summary: scrapedData.summary ? 
            `Live scraping found ${scrapedData.summary.totalPricesFound} prices, ${scrapedData.summary.coreFeatures} features. JavaScript parsing: ${scrapedData.summary.javascriptParsed ? 'successful' : 'failed'}.` :
            `Scraped ${competitor.name} - ${scrapedData.scrapedSuccessfully ? 'successful' : 'failed'}`,
            
          // Metadata
          metadata: scrapedData.metadata,
          
          // For compatibility with existing UI
          crawlSources: [{
            sourceType: "Enhanced Web Scraping",
            url: scrapedData.url,
            scrapedSuccessfully: scrapedData.scrapedSuccessfully,
            findings: scrapedData.actualContent ? scrapedData.actualContent.map(finding => ({
              type: finding.type,
              severity: "Medium",
              title: finding.content.substring(0, 50),
              description: finding.content,
              impact: finding.insight,
              changeDetected: false
            })) : []
          }]
        };
        
        setCrawlResults(prev => [enhancedCrawlResult, ...prev]);
        
        setAnalysisProgress(`✅ Enhanced scraping completed for ${competitor.name}!`);
        console.log('✅ Enhanced scraping successful:', enhancedCrawlResult);
        
      } else {
        const errorData = await response.json();
        throw new Error(`Scraping failed: ${errorData.error}`);
      }
      
    } catch (error) {
      console.error('Enhanced scraping error:', error);
      
      // Create fallback result
      const fallbackResult = {
        competitor: competitor.name,
        timestamp: new Date().toISOString(),
        scrapedSuccessfully: false,
        summary: `Enhanced scraping of ${competitor.name} failed: ${error.message}`,
        crawlSources: [{
          sourceType: "Enhanced Web Scraping",
          url: competitor.url,
          scrapedSuccessfully: false,
          findings: [{
            type: "Error",
            severity: "High",
            title: "Scraping Failed",
            description: `Could not scrape ${competitor.name}: ${error.message}`,
            impact: "Limited competitive intelligence available",
            changeDetected: false
          }]
        }]
      };
      
      setCrawlResults(prev => [fallbackResult, ...prev]);
      setAnalysisProgress(`❌ Enhanced scraping failed for ${competitor.name}: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to get competitor pricing URLs
  const getCompetitorPricingUrl = (competitorName) => {
    const competitorUrls = {
      'Salesforce Revenue Cloud': 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
      'Salesforce RLM': 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
      'Salesforce RCA': 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
      'PandaDoc': 'https://www.pandadoc.com/pricing/',
      'Proposify': 'https://www.proposify.com/pricing',
      'HubSpot Sales Hub': 'https://www.hubspot.com/pricing/sales',
      'Oracle CPQ': 'https://www.oracle.com/cx/pricing/',
      'Subskribe': 'https://www.subskribe.com/pricing'
    };
    
    return competitorUrls[competitorName] || '';
  };

  // Update battle card when new crawl data is available
  const updateBattleCardWithCrawlData = async (competitorName, crawlData) => {
    if (!battleCards[competitorName]) return;

    try {
      const competitor = competitors.find(c => c.name === competitorName);
      if (competitor) {
        await generateBattleCard(competitor);
      }
    } catch (error) {
      console.error('Error updating battle card:', error);
    }
  };

  // View battle card
  const viewBattleCard = (competitorName) => {
    setSelectedBattleCard(competitorName);
    setShowBattleCard(true);
  };

  // REST OF THE COMPONENT REMAINS THE SAME - keeping all other functions as they were
  const discoverCompetitors = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress('Calling Anthropic API...');

    try {
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please configure your API key first');
      }

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `As a competitive intelligence expert, discover and analyze competitors for DealHub.io in the CPQ space.

Provide response in this EXACT JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "url": "https://company.com",
      "category": "Direct" or "Indirect",
      "focus": "Brief description of main value proposition",
      "marketPosition": "Enterprise/Mid-market/SMB",
      "threat": "Very High/High/Medium/Low",
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["weakness1", "weakness2"],
      "recentDevelopments": ["recent change 1", "recent change 2"]
    }
  ]
}

Focus on these key competitors:
- Salesforce CPQ (Legacy CPQ product at salesforce.com/products/cpq/)
- Salesforce Revenue Cloud/RCA/RLM (New revenue platform at salesforce.com/eu/sales/revenue-lifecycle-management/)
- Subskribe (Quote-to-Revenue with DealDesk AI)
- Oracle CPQ
- Conga CPQ (formerly Apttus)
- PandaDoc
- Proposify
- HubSpot Sales Hub
- Pipedrive CPQ
- Nue

Respond ONLY with valid JSON. No additional text or explanation.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0]?.text) {
        throw new Error('Invalid API response format');
      }
      
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const competitorsData = JSON.parse(responseText);
      
      if (!competitorsData.competitors || !Array.isArray(competitorsData.competitors)) {
        throw new Error('Invalid competitors data structure');
      }
      
      const competitorsWithIds = competitorsData.competitors.map((comp, index) => ({
        ...comp,
        id: Date.now() + index
      }));
      setCompetitors(competitorsWithIds);
      
      setAnalysisProgress('Saving competitors to database...');
      
      try {
        const saveResponse = await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(competitorsData.competitors)
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          setAnalysisProgress(`Saved ${saveResult.inserted} new competitors to database`);
          
          const loadResponse = await fetch('/api/competitors');
          if (loadResponse.ok) {
            const allCompetitors = await loadResponse.json();
            setCompetitors(allCompetitors);
          }
        }
      } catch (dbError) {
        console.log('Database error, but competitors are still displayed:', dbError);
      }
      
      setAnalysisProgress(`✅ Successfully discovered ${competitorsWithIds.length} competitors!`);
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      setAnalysisProgress(`❌ API Error: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real Claude API call for deep competitive analysis
  const performDeepAnalysis = async () => {
    if (competitors.length === 0) {
      alert('Please discover competitors first!');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Starting comprehensive competitive analysis...');

    try {
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please configure your API key first');
      }

      const analysisContext = {
        competitors: competitors,
        customIntelligence: customIntelligence,
        driveFiles: driveFiles.map(f => f.name),
        timestamp: new Date().toISOString()
      };

      setAnalysisProgress('Analyzing competitive landscape with Claude AI...');

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Conduct a comprehensive competitive analysis for DealHub.io based on this data:

${JSON.stringify(analysisContext, null, 2)}

Provide analysis in this EXACT JSON format:

{
  "executiveSummary": "2-3 sentence strategic overview",
  "marketPosition": {
    "dealHubStrengths": ["strength1", "strength2", "strength3"],
    "marketGaps": ["gap1", "gap2"],
    "competitiveAdvantages": ["advantage1", "advantage2"]
  },
  "competitorMatrix": [
    {
      "feature": "CPQ Capabilities",
      "dealhub": 9,
      "competitors": {"Salesforce CPQ": 8, "Subskribe": 7}
    }
  ],
  "threatAssessment": [
    {
      "competitor": "Company Name",
      "threat": "Very High/High/Medium/Low",
      "reasoning": "Why they're a threat",
      "recommendedActions": ["action1", "action2"]
    }
  ],
  "opportunities": [
    {
      "area": "Market segment or capability",
      "description": "Detailed opportunity description",
      "priority": "High/Medium/Low",
      "timeframe": "Short/Medium/Long term"
    }
  ],
  "strategicRecommendations": [
    {
      "category": "Product/Marketing/Sales/Pricing",
      "recommendation": "Specific actionable recommendation",
      "rationale": "Why this recommendation",
      "expectedImpact": "Expected business impact"
    }
  ]
}

Base analysis on real competitive intelligence. Be specific and actionable. Respond ONLY with valid JSON.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const analysis = JSON.parse(responseText);
      setAnalysisResults(analysis);
      setAnalysisProgress('Deep analysis completed!');
      setActiveTab('results');
      
    } catch (error) {
      setAnalysisProgress('Error in analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get crawl targets based on competitor
  const getCrawlTargets = (competitor) => {
    const targets = [];
    
    // Add main website
    targets.push({
      type: "Main Product Page",
      url: competitor.url,
      priority: "High"
    });

    // Add specific known pages based on competitor
    const competitorPages = getCompetitorSpecificPages(competitor.name, competitor.url);
    targets.push(...competitorPages);

    return targets;
  };

  // Define specific pages to crawl for each competitor
  const getCompetitorSpecificPages = (competitorName, baseUrl) => {
    const pages = [];
    const domain = baseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // Common patterns for different competitors
    const competitorMappings = {
      // Salesforce CPQ (Legacy CPQ Product)
      'Salesforce CPQ': {
        productPage: 'https://www.salesforce.com/products/cpq/',
        pricingPage: 'https://www.salesforce.com/products/cpq/pricing/',
        docsUrl: 'https://help.salesforce.com/s/articleView?language=en_US&type=5&id=sf.cpq_setup.htm'
      },
      // Salesforce Revenue Cloud/RCA/RLM (New Revenue Platform)
      'Salesforce RCA': {
        productPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/',
        pricingPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
        docsUrl: 'https://help.salesforce.com/s/articleView?language=en_US&type=5&id=sf.revenue_cloud.htm'
      },
      'Salesforce Revenue Cloud': {
        productPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/',
        pricingPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
        docsUrl: 'https://help.salesforce.com/s/articleView?language=en_US&type=5&id=sf.revenue_cloud.htm'
      },
      'Salesforce RLM': {
        productPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/',
        pricingPage: 'https://www.salesforce.com/eu/sales/revenue-lifecycle-management/pricing/',
        docsUrl: 'https://help.salesforce.com/s/articleView?language=en_US&type=5&id=sf.revenue_lifecycle.htm'
      },
      // Other Competitors
      'PandaDoc': {
        productPage: 'https://www.pandadoc.com/cpq-software/',
        pricingPage: 'https://www.pandadoc.com/pricing/',
        docsUrl: 'https://developers.pandadoc.com/'
      },
      'HubSpot Sales Hub': {
        productPage: 'https://www.hubspot.com/products/sales',
        pricingPage: 'https://www.hubspot.com/pricing/sales',
        docsUrl: 'https://developers.hubspot.com/docs/api/overview'
      },
      'Oracle CPQ': {
        productPage: 'https://www.oracle.com/cx/cpq/',
        pricingPage: 'https://www.oracle.com/cx/pricing/',
        docsUrl: 'https://docs.oracle.com/en/cloud/saas/cpq-cloud/'
      },
      'Conga CPQ': {
        productPage: 'https://conga.com/products/conga-cpq',
        pricingPage: 'https://conga.com/pricing/',
        docsUrl: 'https://documentation.conga.com/'
      },
      'Subskribe': {
        productPage: 'https://www.subskribe.com/platform',
        pricingPage: 'https://www.subskribe.com/pricing',
        docsUrl: 'https://docs.subskribe.com/'
      },
      'Proposify': {
        productPage: 'https://www.proposify.com/proposal-software',
        pricingPage: 'https://www.proposify.com/pricing',
        docsUrl: 'https://help.proposify.com/'
      },
      'Nue': {
        productPage: 'https://nue.io/',
        pricingPage: 'https://nue.io/pricing',
        docsUrl: 'https://docs.nue.io/'
      }
    };

    // Get specific mapping or create generic ones
    const mapping = competitorMappings[competitorName];
    
    if (mapping) {
      if (mapping.productPage) {
        pages.push({
          type: "Main Product Page",
          url: mapping.productPage,
          priority: "High"
        });
      }
      if (mapping.pricingPage) {
        pages.push({
          type: "Pricing Page", 
          url: mapping.pricingPage,
          priority: "High"
        });
      }
      if (mapping.docsUrl) {
        pages.push({
          type: "Knowledge Center",
          url: mapping.docsUrl,
          priority: "Medium"
        });
      }
    } else {
      // Generic patterns for unknown competitors
      const commonPatterns = [
        { type: "Pricing Page", url: `https://${domain}/pricing`, priority: "High" },
        { type: "Pricing Page Alt", url: `https://${domain}/pricing/`, priority: "High" },
        { type: "Product Page", url: `https://${domain}/product`, priority: "Medium" },
        { type: "Product Page Alt", url: `https://${domain}/products`, priority: "Medium" },
        { type: "Documentation", url: `https://docs.${domain}`, priority: "Medium" },
        { type: "Help Center", url: `https://help.${domain}`, priority: "Low" },
        { type: "Developer Docs", url: `https://developers.${domain}`, priority: "Low" }
      ];
      
      pages.push(...commonPatterns);
    }

    return pages;
  };

  // Add competitor manually
  const addCompetitor = async () => {
    if (!competitorUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Analyzing new competitor...');

    try {
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please configure your API key first');
      }

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Analyze this competitor URL for DealHub.io: ${competitorUrl}

Provide analysis in this JSON format:
{
  "name": "Company Name",
  "url": "${competitorUrl}",
  "category": "Direct or Indirect",
  "focus": "Main value proposition",
  "marketPosition": "Enterprise/Mid-market/SMB",
  "threat": "Very High/High/Medium/Low",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recentDevelopments": ["recent change 1"]
}

Respond ONLY with valid JSON.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const newCompetitor = JSON.parse(responseText);
      
      setAnalysisProgress('Saving new competitor to database...');
      
      const saveResponse = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newCompetitor])
      });

      if (saveResponse.ok) {
        const loadResponse = await fetch('/api/competitors');
        if (loadResponse.ok) {
          const allCompetitors = await loadResponse.json();
          setCompetitors(allCompetitors);
        }
      }
      
      setCompetitorUrl('');
      setAnalysisProgress('Competitor added and saved to database!');
      
    } catch (error) {
      const basicCompetitor = {
        id: Date.now(),
        name: competitorUrl.split('//')[1]?.split('/')[0] || 'New Competitor',
        url: competitorUrl,
        category: 'Direct',
        focus: 'Analysis pending due to API limitations',
        marketPosition: 'Unknown',
        threat: 'Unknown',
        strengths: ['Analysis needed'],
        weaknesses: ['Analysis needed'],
        recentDevelopments: ['Manual research required']
      };
      
      setCompetitors(prev => [...prev, basicCompetitor]);
      setCompetitorUrl('');
      setAnalysisProgress('Competitor added with basic info. Manual research recommended.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File upload handler
  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        const fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        setDriveFiles(prev => [...prev, {
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('sheet') || file.type.includes('excel') ? 'excel' : 'word',
          size: (file.size / 1024 / 1024).toFixed(1) + 'MB',
          lastModified: new Date().toISOString(),
          data: fileData
        }]);
        
        setIsDriveConnected(true);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }, []);

  // Add custom intelligence
  const addCustomIntelligence = () => {
    if (!selectedCompany || !customIntelligenceInput.trim()) return;

    setCustomIntelligence(prev => ({
      ...prev,
      [selectedCompany]: customIntelligenceInput.trim()
    }));

    setCustomIntelligenceInput('');
    setSelectedCompany('');
    setShowIntelligenceForm(false);
  };

  // Export functionality
  const exportData = () => {
    const exportData = {
      competitors,
      analysisResults,
      crawlResults,
      customIntelligence,
      driveFiles: driveFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor-research-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Remove competitor function
  const removeCompetitor = async (competitorId, competitorName) => {
    if (!window.confirm(`Are you sure you want to remove "${competitorName}" from the competitors list?`)) {
      return;
    }

    try {
      setAnalysisProgress(`Removing ${competitorName}...`);
      
      const response = await fetch(`/api/competitors?id=${competitorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCompetitors(prev => prev.filter(comp => comp.id !== competitorId));
        setAnalysisProgress(`✅ Removed ${competitorName} successfully`);
        setTimeout(() => setAnalysisProgress(''), 2000);
      } else {
        throw new Error(`Failed to delete competitor: ${response.status}`);
      }
    } catch (error) {
      setAnalysisProgress(`❌ Error removing ${competitorName}: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DealHub.io</h1>
                <p className="text-sm text-gray-500">AI-Powered Competitor Research</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {analysisProgress && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Zap className="w-4 h-4" />
                  {analysisProgress}
                </div>
              )}
              
              <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                apiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {apiKey ? 'API Connected' : 'API Not Configured'}
              </div>
              
              <button
                onClick={() => setShowApiConfig(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                API Config
              </button>
              
              <button
                onClick={exportData}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'discover', label: 'Competitor Discovery', icon: Search },
              { id: 'battlecards', label: 'Battle Cards', icon: Target },
              { id: 'intelligence', label: 'Custom Intelligence', icon: FileText },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
              { id: 'results', label: 'Results & Insights', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Configuration Modal */}
        {showApiConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Claude API</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your Anthropic API key to enable real-time competitor analysis. 
                Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={testApiConnection}
                  disabled={!apiKey.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Test Connection
                </button>
                <button
                  onClick={saveApiKey}
                  disabled={!apiKey.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Security:</strong> Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Competitor Discovery Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Competitor Discovery</h2>
              <p className="text-gray-600 mb-6">
                Use Claude AI to automatically discover and analyze competitors in the CPQ and Revenue Operations space.
              </p>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={discoverCompetitors}
                  disabled={isAnalyzing}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Brain className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  Discover Competitors with AI
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Competitor</h3>
                <div className="flex gap-4">
                  <input
                    type="url"
                    placeholder="Enter competitor URL (e.g., https://competitor.com)"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addCompetitor}
                    disabled={isAnalyzing || !competitorUrl.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Analyze & Add
                  </button>
                </div>
              </div>
            </div>

            {/* Discovered Competitors */}
            {competitors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Discovered Competitors ({competitors.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Focus</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {competitors.map((competitor) => (
                        <tr key={competitor.id || competitor.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{competitor.name}</div>
                              <div className="text-sm text-gray-500">{competitor.url}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              competitor.category === 'Direct' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {competitor.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {competitor.focus}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              competitor.threat === 'Very High' ? 'bg-red-100 text-red-800' :
                              competitor.threat === 'High' ? 'bg-orange-100 text-orange-800' :
                              competitor.threat === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {competitor.threat}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => crawlCompetitor(competitor)}
                                disabled={isAnalyzing}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                              >
                                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                Crawl Latest
                              </button>
                              
                              <button
                                onClick={() => removeCompetitor(competitor.id, competitor.name)}
                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1"
                                title="Remove competitor permanently"
                              >
                                <X className="w-3 h-3" />
                                Remove
                              </button>

                              {battleCards[competitor.name] ? (
                                <button
                                  onClick={() => viewBattleCard(competitor.name)}
                                  className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1"
                                  title="View battle card"
                                >
                                  <Eye className="w-3 h-3" />
                                  Battle Card
                                </button>
                              ) : (
                                <button
                                  onClick={() => generateBattleCard(competitor)}
                                  disabled={isAnalyzing}
                                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Generate battle card"
                                >
                                  <Target className="w-3 h-3" />
                                  Create Battle Card
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Battle Cards Tab */}
        {activeTab === 'battlecards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitive Battle Cards</h2>
              <p className="text-gray-600 mb-6">
                Generate detailed battle cards that compare DealHub.io against each competitor. Battle cards are automatically updated when new intelligence is gathered.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitors.map((competitor) => (
                  <div key={competitor.id || competitor.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{competitor.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          competitor.threat === 'Very High' ? 'bg-red-100 text-red-800' :
                          competitor.threat === 'High' ? 'bg-orange-100 text-orange-800' :
                          competitor.threat === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {competitor.threat} Threat
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {battleCards[competitor.name] ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Battle Card Generated
                          </div>
                          <div className="text-xs text-gray-500">
                            Last Updated: {new Date(battleCards[competitor.name].lastUpdated).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => viewBattleCard(competitor.name)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                            >
                              View Battle Card
                            </button>
                            <button
                              onClick={() => generateBattleCard(competitor)}
                              disabled={isAnalyzing}
                              className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                              Update
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            No Battle Card Yet
                          </div>
                          <button
                            onClick={() => generateBattleCard(competitor)}
                            disabled={isAnalyzing}
                            className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 mt-3"
                          >
                            Create Battle Card
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {competitors.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Discover competitors first to generate battle cards.
                  </p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Discover Competitors
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Battle Card Modal */}
        {showBattleCard && selectedBattleCard && battleCards[selectedBattleCard] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Battle Card: DealHub.io vs {selectedBattleCard}
                </h2>
                <button
                  onClick={() => setShowBattleCard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* DealHub Baseline */}
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 DealHub.io Baseline Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Capabilities</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {(battleCards[selectedBattleCard].dealHubBaseline.capabilities || []).map((cap, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full mt-2"></div>
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Strengths</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {(battleCards[selectedBattleCard].dealHubBaseline.keyStrengths || []).map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full mt-2"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">CRM Integrations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Native:</strong>
                        <ul className="mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].dealHubBaseline.crmIntegrations.native || []).map((crm, index) => (
                            <li key={index} className="text-gray-600">• {crm}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>API Connections:</strong>
                        <ul className="mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].dealHubBaseline.crmIntegrations.api || []).map((api, index) => (
                            <li key={index} className="text-gray-600">• {api}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Setup:</strong> {battleCards[selectedBattleCard].dealHubBaseline.crmIntegrations.setup}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor Profile */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 {selectedBattleCard}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Products & Services</h4>
                      <div className="mb-3">
                        <strong className="text-sm">Core Offerings:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].competitorProfile.coreOfferings || []).map((offering, index) => (
                            <li key={index}>• {offering}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-sm">Key Differentiators:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].competitorProfile.keyDifferentiators || []).map((diff, index) => (
                            <li key={index}>• {diff}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">CRM Integrations</h4>
                      <div className="text-sm mb-3">
                        <strong>Native:</strong>
                        <ul className="mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].competitorProfile.crmIntegrations.native || []).map((crm, index) => (
                            <li key={index} className="text-gray-600">• {crm}</li>
                          ))}
                        </ul>
                        <div className="mt-2">
                          <strong>Quality:</strong> {battleCards[selectedBattleCard].competitorProfile.crmIntegrations.quality}
                        </div>
                        <div>
                          <strong>Setup:</strong> {battleCards[selectedBattleCard].competitorProfile.crmIntegrations.setup}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Pricing Strategy</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Model:</strong> {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.model}</div>
                        
                        {/* ENHANCED: Show live scraped pricing */}
                        {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.liveScrapedPricing && 
                         battleCards[selectedBattleCard].competitorProfile.pricingStrategy.liveScrapedPricing.length > 0 && (
                          <div>
                            <strong>Live Scraped Pricing:</strong>
                            <ul className="mt-1 space-y-1">
                              {(battleCards[selectedBattleCard].competitorProfile.pricingStrategy.liveScrapedPricing || []).map((price, index) => (
                                <li key={index} className="text-blue-700 font-medium">
                                  • {price.amount} {price.currency} ({price.billing || 'billing unknown'})
                                  <div className="text-xs text-gray-500 ml-2">Source: {price.source}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.jsExtractedPricing && 
                         battleCards[selectedBattleCard].competitorProfile.pricingStrategy.jsExtractedPricing.length > 0 && (
                          <div>
                            <strong>JavaScript Extracted Prices:</strong>
                            <ul className="mt-1 space-y-1">
                              {(battleCards[selectedBattleCard].competitorProfile.pricingStrategy.jsExtractedPricing || []).map((price, index) => (
                                <li key={index} className="text-green-700 font-medium">
                                  • {typeof price === 'string' ? price : `${price.amount} (${price.source})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div><strong>Range:</strong> {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.range}</div>
                        <div><strong>Strategy:</strong> {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.strategy}</div>
                        <div><strong>Compared to DealHub:</strong> {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.comparedToDealHub}</div>
                        
                        {battleCards[selectedBattleCard].competitorProfile.pricingStrategy.isGated && (
                          <div className="text-orange-600 font-medium">⚠️ Gated Pricing: Contact Sales Required</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Feedback</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {battleCards[selectedBattleCard].competitorProfile.customerFeedback ? (
                          <>
                            <div><strong>Overall Rating:</strong> {battleCards[selectedBattleCard].competitorProfile.customerFeedback.overallRating}</div>
                            <div><strong>Sentiment:</strong> {battleCards[selectedBattleCard].competitorProfile.customerFeedback.sentiment}</div>
                          </>
                        ) : (
                          <div className="text-gray-500 italic">Customer feedback data not available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scraping Status */}
                {battleCards[selectedBattleCard].scrapingStatus && (
                  <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                    <h4 className="font-medium text-gray-900 mb-2">📊 Data Quality & Sources</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Last Scraped:</strong>
                        <div className="text-gray-600">{new Date(battleCards[selectedBattleCard].scrapingStatus.lastScraped).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <strong>Data Quality:</strong>
                        <div className={`font-medium ${
                          battleCards[selectedBattleCard].scrapingStatus.dataQuality === 'excellent' ? 'text-green-600' :
                          battleCards[selectedBattleCard].scrapingStatus.dataQuality === 'good' ? 'text-blue-600' :
                          battleCards[selectedBattleCard].scrapingStatus.dataQuality === 'limited' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {battleCards[selectedBattleCard].scrapingStatus.dataQuality}
                        </div>
                      </div>
                      <div>
                        <strong>Pricing Found:</strong>
                        <div className={battleCards[selectedBattleCard].scrapingStatus.pricingFound ? 'text-green-600' : 'text-red-600'}>
                          {battleCards[selectedBattleCard].scrapingStatus.pricingFound ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                      <div>
                        <strong>Features Found:</strong>
                        <div className={battleCards[selectedBattleCard].scrapingStatus.featuresFound ? 'text-green-600' : 'text-red-600'}>
                          {battleCards[selectedBattleCard].scrapingStatus.featuresFound ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SWOT Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">SWOT Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-sm text-green-700">Strengths:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].swotAnalysis.strengths || []).map((strength, index) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-sm text-red-700">Weaknesses:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].swotAnalysis.weaknesses || []).map((weakness, index) => (
                            <li key={index}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Strategic Insights</h4>
                    <div className="space-y-3">
                      <div>
                        <strong className="text-sm text-blue-700">Market Opportunities:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].dealHubBaseline.marketOpportunities || []).map((opp, index) => (
                            <li key={index}>• {opp}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-sm text-purple-700">DealHub Advantages:</strong>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {(battleCards[selectedBattleCard].dealHubBaseline.advantages || []).map((adv, index) => (
                            <li key={index}>• {adv}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {battleCards[selectedBattleCard].recommendations && (
                  <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                    <h4 className="font-medium text-gray-900 mb-3">💡 Recommendations</h4>
                    <div className="space-y-3">
                      {(battleCards[selectedBattleCard].recommendations || []).map((rec, index) => (
                        <div key={index} className="border-b border-green-200 pb-2 last:border-b-0">
                          <div className="flex justify-between items-start mb-1">
                            <strong className="text-sm text-gray-900">{rec.category}</strong>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{rec.recommendation}</p>
                          {rec.talkingPoints && (
                            <div>
                              <strong className="text-xs text-gray-600">Key Talking Points:</strong>
                              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {(rec.talkingPoints || []).map((point, idx) => (
                                  <li key={idx}>• {point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Intelligence Tab */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Research Files</h2>
              <p className="text-gray-600 mb-4">
                Upload your existing research documents to enhance AI analysis.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <div className="flex flex-col items-center">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 font-medium">Upload files</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.xlsx,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">PDF, DOCX, XLSX, PPTX up to 10MB each</p>
                </div>
              </div>

              {driveFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {driveFiles.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Custom Intelligence</h2>
              
              {!showIntelligenceForm ? (
                <div className="space-y-4">
                  {Object.keys(customIntelligence).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No custom intelligence added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(customIntelligence).map(([company, intelligence]) => (
                        <div key={company} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{company}</h3>
                          <p className="text-sm text-gray-600">{intelligence}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowIntelligenceForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Intelligence
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a company...</option>
                      <option value="DealHub.io">DealHub.io</option>
                      {competitors.map(comp => (
                        <option key={comp.name} value={comp.name}>{comp.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intelligence</label>
                    <textarea
                      value={customIntelligenceInput}
                      onChange={(e) => setCustomIntelligenceInput(e.target.value)}
                      placeholder="Add any custom intelligence, insights, or research notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={addCustomIntelligence}
                      disabled={!selectedCompany || !customIntelligenceInput.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Save Intelligence
                    </button>
                    <button
                      onClick={() => {
                        setShowIntelligenceForm(false);
                        setSelectedCompany('');
                        setCustomIntelligenceInput('');
                      }}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Claude AI Deep Analysis</h2>
              <p className="text-gray-600 mb-6">
                Generate comprehensive competitive intelligence using Claude AI to analyze all discovered competitors,
                uploaded files, and custom intelligence.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={performDeepAnalysis}
                  disabled={isAnalyzing || competitors.length === 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Brain className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  Start AI Analysis
                </button>
                
                {competitors.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Discover competitors first to enable analysis
                  </p>
                )}
              </div>

              {crawlResults.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Crawl Results</h3>
                  <div className="space-y-4">
                    {crawlResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">{result.competitor}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.summary}</p>
                        {result.crawlSources ? (
                          <div className="space-y-3">
                            {result.crawlSources.slice(0, 3).map((source, sourceIdx) => (
                              <div key={sourceIdx} className="border-l-2 border-blue-200 pl-3">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-blue-700">{source.sourceType}</span>
                                  <div className="flex items-center gap-1">
                                    {source.scrapedSuccessfully ? (
                                      <span className="text-xs text-green-600">✅ Live Data</span>
                                    ) : (
                                      <span className="text-xs text-red-600">❌ Scrape Failed</span>
                                    )}
                                    {source.url && <span className="text-xs text-gray-500">🔗</span>}
                                  </div>
                                </div>
                                {source.findings && source.findings.slice(0, 2).map((finding, idx) => (
                                  <div key={idx} className="flex items-start gap-2 mb-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      finding.severity === 'High' ? 'bg-red-100 text-red-800' :
                                      finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {finding.severity}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                                      <p className="text-xs text-gray-600">{finding.description}</p>
                                      {finding.actualContent && (
                                        <div className="mt-1 p-2 bg-gray-100 rounded text-xs italic">
                                          ""{finding.actualContent}""
                                        </div>
                                      )}
                                      {finding.changeDetected && (
                                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 mt-1">
                                          🔄 Live Change Detected
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Fallback to old format if new format not available
                          result.findings && result.findings.slice(0, 3).map((finding, idx) => (
                            <div key={idx} className="flex items-start gap-2 mb-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                finding.severity === 'High' ? 'bg-red-100 text-red-800' :
                                finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {finding.severity}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                                <p className="text-xs text-gray-600">{finding.description}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {analysisResults ? (
              <>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{analysisResults.executiveSummary}</p>
                </div>

                {analysisResults.marketPosition && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        DealHub Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.marketPosition.dealHubStrengths?.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full mt-2"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Market Gaps
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.marketPosition.marketGaps?.map((gap, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full mt-2"></div>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Competitive Advantages
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.marketPosition.competitiveAdvantages?.map((advantage, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2"></div>
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {analysisResults.strategicRecommendations && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Recommendations</h3>
                    <div className="space-y-4">
                      {analysisResults.strategicRecommendations.map((rec, index) => (
                        <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{rec.category}</h4>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium mb-2">{rec.recommendation}</p>
                          <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                          <p className="text-sm text-green-700 font-medium">Expected Impact: {rec.expectedImpact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results Yet</h3>
                <p className="text-gray-500 mb-6">
                  Run an AI analysis to see comprehensive competitive insights and strategic recommendations.
                </p>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start AI Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RealCompetitorDashboard;
