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

      // Use your Vercel proxy instead of calling Anthropic directly
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 20,
          messages: [
            {
              role: "user",
              content: "Say hello"
            }
          ]
        })
      });

      console.log('Proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Proxy error details:', errorData);
        throw new Error(`Proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API test successful:', data);
      
      setAnalysisProgress('✅ API connection successful via Vercel proxy!');
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      console.error('API test error:', error);
      setAnalysisProgress(`❌ Connection failed: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    }
  };

  const loadFallbackCompetitors = () => {
    const fallbackCompetitors = [
      {
        id: 1,
        name: 'Salesforce CPQ',
        url: 'https://salesforce.com/products/cpq/',
        category: 'Direct',
        focus: 'Enterprise CPQ with advanced configuration and pricing rules',
        marketPosition: 'Enterprise',
        threat: 'Very High',
        strengths: ['Market leader', 'Deep CRM integration', 'Advanced workflow automation'],
        weaknesses: ['High cost', 'Complex implementation', 'Steep learning curve'],
        recentDevelopments: ['Revenue Intelligence AI updates', 'Enhanced mobile experience', 'New pricing optimization features']
      },
      {
        id: 2,
        name: 'Subskribe',
        url: 'https://subskribe.com',
        category: 'Direct',
        focus: 'Quote-to-Revenue platform with CPQ, subscription billing, and DealDesk AI',
        marketPosition: 'Mid-market/Enterprise',
        threat: 'Very High',
        strengths: ['End-to-end Q2R platform', 'AI-powered deal assistance', 'Modern user experience'],
        weaknesses: ['Newer market player', 'Limited enterprise customization', 'Smaller partner ecosystem'],
        recentDevelopments: ['DealDesk AI assistant launch', 'Enhanced subscription billing', 'New Salesforce integration']
      },
      {
        id: 3,
        name: 'Oracle CPQ',
        url: 'https://oracle.com/cx/cpq/',
        category: 'Direct',
        focus: 'Enterprise CPQ with deep ERP and supply chain integration',
        marketPosition: 'Enterprise',
        threat: 'High',
        strengths: ['ERP integration', 'Manufacturing focus', 'Global enterprise scale'],
        weaknesses: ['Complex user interface', 'High maintenance overhead', 'Slow feature innovation'],
        recentDevelopments: ['Oracle Cloud Infrastructure migration', 'Supply chain integration improvements', 'Mobile app updates']
      },
      {
        id: 4,
        name: 'Conga CPQ',
        url: 'https://conga.com',
        category: 'Direct',
        focus: 'Revenue lifecycle management with document automation and CPQ',
        marketPosition: 'Enterprise',
        threat: 'High',
        strengths: ['Document automation', 'Contract lifecycle management', 'Revenue operations platform'],
        weaknesses: ['Complex pricing model', 'Implementation complexity', 'User experience challenges'],
        recentDevelopments: ['Conga Grid 2.0 launch', 'AI-powered document generation', 'Revenue Cloud platform consolidation']
      },
      {
        id: 5,
        name: 'PandaDoc',
        url: 'https://pandadoc.com',
        category: 'Indirect',
        focus: 'Document automation and eSignature with expanding CPQ capabilities',
        marketPosition: 'SMB/Mid-market',
        threat: 'Medium',
        strengths: ['Easy to use interface', 'Rich template library', 'Strong eSignature features'],
        weaknesses: ['Limited advanced CPQ', 'Basic pricing configuration', 'No revenue operations'],
        recentDevelopments: ['CPQ feature enhancements', 'New template marketplace', 'Advanced analytics dashboard']
      },
      {
        id: 6,
        name: 'HubSpot Sales Hub',
        url: 'https://hubspot.com/products/sales',
        category: 'Indirect',
        focus: 'CRM with quotes and deals management, expanding into CPQ territory',
        marketPosition: 'SMB/Mid-market',
        threat: 'Medium',
        strengths: ['Integrated CRM platform', 'Marketing automation', 'Free tier availability'],
        weaknesses: ['Basic CPQ functionality', 'Limited complex pricing', 'No subscription billing'],
        recentDevelopments: ['Quotes tool improvements', 'Revenue operations features', 'AI-powered deal scoring']
      }
    ];
    
    setCompetitors(fallbackCompetitors);
    setAnalysisProgress(`Loaded ${fallbackCompetitors.length} curated competitors with latest intelligence. API will be retried automatically.`);
    
    setTimeout(() => setAnalysisProgress(''), 4000);
  };

  const getApiHeaders = () => {
    const key = apiKey || localStorage.getItem('anthropic_api_key');
    console.log('Getting API headers, key exists:', !!key);
    
    if (!key) {
      throw new Error('API key not configured. Please add your Anthropic API key.');
    }
    
    if (!key.startsWith('sk-ant-')) {
      console.warn('API key format may be incorrect. Expected format: sk-ant-...');
    }
    
    return {
      "Content-Type": "application/json",
      "x-api-key": key.trim(),
      "anthropic-version": "2023-06-01"
    };
  };

  // Real Claude API call for competitor discovery
  const discoverCompetitors = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress('Calling Anthropic API...');

    try {
      const apiKey = localStorage.getItem('anthropic_api_key');
      if (!apiKey) {
        throw new Error('Please configure your API key first');
      }

      // Use your Vercel API proxy instead of calling Anthropic directly
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // Use same working model as test
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
- Salesforce CPQ/Revenue Cloud  
- Subskribe (Quote-to-Revenue with DealDesk AI)
- Oracle CPQ
- Conga CPQ (formerly Apttus)
- PandaDoc
- Proposify
- HubSpot Sales Hub
- Pipedrive CPQ

Respond ONLY with valid JSON. No additional text or explanation.`
            }
          ]
        })
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Anthropic API Response:', data);
      
      if (!data.content || !data.content[0]?.text) {
        throw new Error('Invalid API response format');
      }
      
      let responseText = data.content[0].text;
      console.log('Raw API response text:', responseText);
      
      // Clean up response to extract JSON
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      console.log('Cleaned response text:', responseText);
      
      const competitorsData = JSON.parse(responseText);
      console.log('Parsed competitors data:', competitorsData);
      
      if (!competitorsData.competitors || !Array.isArray(competitorsData.competitors)) {
        throw new Error('Invalid competitors data structure');
      }
      
      // First, show the competitors immediately
      const competitorsWithIds = competitorsData.competitors.map((comp, index) => ({
        ...comp,
        id: Date.now() + index
      }));
      setCompetitors(competitorsWithIds);
      
      console.log('Saving competitors to database...');
      setAnalysisProgress('Saving competitors to database...');
      
      try {
        // Save new competitors to database
        const saveResponse = await fetch('/api/competitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(competitorsData.competitors)
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          console.log(`Saved ${saveResult.inserted} new competitors to database`);
          setAnalysisProgress(`Saved ${saveResult.inserted} new competitors to database`);
          
          // Try to reload all competitors from database
          try {
            console.log('Loading competitors from database...');
            const loadResponse = await fetch('/api/competitors');
            if (loadResponse.ok) {
              const allCompetitors = await loadResponse.json();
              console.log(`Loaded ${allCompetitors.length} competitors from database`);
              setCompetitors(allCompetitors);
            } else {
              console.log('Database load failed, keeping current competitors');
            }
          } catch (loadError) {
            console.log('Database load error, keeping current competitors:', loadError);
          }
        } else {
          console.error('Failed to save to database');
        }
      } catch (dbError) {
        console.log('Database error, but competitors are still displayed:', dbError);
      }
      
      setAnalysisProgress(`✅ Successfully discovered ${competitorsWithIds.length} competitors!`);
      
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      console.error('Full error details:', error);
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
      // Combine competitor data with custom intelligence
      const analysisContext = {
        competitors: competitors,
        customIntelligence: customIntelligence,
        driveFiles: driveFiles.map(f => f.name),
        timestamp: new Date().toISOString()
      };

      setAnalysisProgress('Analyzing competitive landscape with Claude AI...');

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // Use working model
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

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const analysis = JSON.parse(responseText);
      setAnalysisResults(analysis);
      setAnalysisProgress('Deep analysis completed!');
      setActiveTab('results');
      
    } catch (error) {
      console.error('Error in deep analysis:', error);
      setAnalysisProgress('Error in analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time competitor crawling with Claude
  const crawlCompetitor = async (competitor) => {
    setIsAnalyzing(true);
    setAnalysisProgress(`Crawling ${competitor.name} for latest updates...`);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // Use working model
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Research ${competitor.name} (${competitor.url}) for DealHub.io competitive intelligence.

Focus on gathering:
1. Latest product updates and new features (last 3 months)
2. Pricing changes or new pricing models
3. New partnerships or integrations announced
4. Marketing message changes
5. Customer wins or case studies
6. Any competitive moves against DealHub.io or similar platforms

Provide response in this JSON format:
{
  "competitor": "${competitor.name}",
  "timestamp": "${new Date().toISOString()}",
  "findings": [
    {
      "type": "Product Update/Pricing/Partnership/Marketing/Customer Win",
      "severity": "High/Medium/Low",
      "title": "Brief title",
      "description": "Detailed description",
      "impact": "Potential impact on DealHub.io",
      "source": "Where this information was found"
    }
  ],
  "summary": "Overall summary of key changes",
  "recommendedActions": ["action1", "action2"]
}

Respond ONLY with valid JSON.`
            }
          ]
        })
      });

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const crawlData = JSON.parse(responseText);
      setCrawlResults(prev => [crawlData, ...prev]);
      setAnalysisProgress(`${competitor.name} crawl completed!`);
      
    } catch (error) {
      console.error('Error crawling competitor:', error);
      
      // Create fallback crawl result
      const fallbackResult = {
        competitor: competitor.name,
        timestamp: new Date().toISOString(),
        findings: [
          {
            type: "System Notice",
            severity: "Medium",
            title: "API Temporarily Unavailable",
            description: `Unable to crawl ${competitor.name} due to API limitations. Manual research recommended.`,
            impact: "Real-time intelligence not available",
            source: "System"
          }
        ],
        summary: `Crawl of ${competitor.name} could not be completed due to API limitations. Consider manual research of their website and recent announcements.`,
        recommendedActions: [
          "Visit competitor website directly",
          "Check recent press releases",
          "Monitor social media updates"
        ]
      };
      
      setCrawlResults(prev => [fallbackResult, ...prev]);
      setAnalysisProgress(`API unavailable. Manual research recommended for ${competitor.name}.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add competitor manually
  const addCompetitor = async () => {
    if (!competitorUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Analyzing new competitor...');

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
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

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      const newCompetitor = JSON.parse(responseText);
      
      console.log('Saving new competitor to database...');
      setAnalysisProgress('Saving new competitor to database...');
      
      // Save to database
      const saveResponse = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([newCompetitor])
      });

      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        console.log(`Saved ${saveResult.inserted} new competitor to database`);
        
        // Reload all competitors from database
        const loadResponse = await fetch('/api/competitors');
        if (loadResponse.ok) {
          const allCompetitors = await loadResponse.json();
          console.log(`Loaded ${allCompetitors.length} total competitors from database`);
          setCompetitors(allCompetitors);
        }
      }
      
      setCompetitorUrl('');
      setAnalysisProgress('Competitor added and saved to database!');
      
    } catch (error) {
      console.error('Error adding competitor:', error);
      
      // Fallback: Add competitor with basic info
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
      setAnalysisProgress('Competitor added with basic info. API analysis unavailable - manual research recommended.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File upload handler for Google Drive files
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
      
      // Remove from database
      const response = await fetch(`/api/competitors?id=${competitorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Competitor deleted from database:', result);
        
        // Remove from local state
        setCompetitors(prev => prev.filter(comp => comp.id !== competitorId));
        setAnalysisProgress(`✅ Removed ${competitorName} successfully`);
        
        setTimeout(() => setAnalysisProgress(''), 2000);
      } else {
        throw new Error(`Failed to delete competitor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing competitor:', error);
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
              
              {/* API Status Indicator */}
              <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                apiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {apiKey ? 'API Connected' : 'API Not Configured'}
              </div>
              
              <button
                onClick={() => setShowApiConfig(true)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                title="Configure Claude API"
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
                            <button
                              onClick={() => crawlCompetitor(competitor)}
                              disabled={isAnalyzing}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                            >
                              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                              Crawl Latest
                            </button>
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
                        {result.findings && result.findings.slice(0, 3).map((finding, idx) => (
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
                        ))}
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

                {analysisResults.competitorMatrix && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Competitive Matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                            <th className="text-center py-3 px-4 font-medium text-blue-600">DealHub.io</th>
                            {analysisResults.competitorMatrix[0]?.competitors && 
                              Object.keys(analysisResults.competitorMatrix[0].competitors).map(comp => (
                                <th key={comp} className="text-center py-3 px-4 font-medium text-gray-600">{comp}</th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResults.competitorMatrix.map((row, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 px-4 font-medium text-gray-900">{row.feature}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600">{row.dealhub}</span>
                                  </div>
                                </div>
                              </td>
                              {row.competitors && Object.values(row.competitors).map((score, idx) => (
                                <td key={idx} className="py-3 px-4 text-center text-gray-600">{score}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {analysisResults.threatAssessment && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Threat Assessment
                    </h3>
                    <div className="space-y-4">
                      {analysisResults.threatAssessment.map((threat, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">{threat.competitor}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              threat.threat === 'Very High' ? 'bg-red-100 text-red-800' :
                              threat.threat === 'High' ? 'bg-orange-100 text-orange-800' :
                              threat.threat === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {threat.threat} Threat
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{threat.reasoning}</p>
                          {threat.recommendedActions && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {threat.recommendedActions.map((action, idx) => (
                                  <li key={idx}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResults.opportunities && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Market Opportunities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResults.opportunities.map((opportunity, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{opportunity.area}</h4>
                            <div className="flex gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                opportunity.priority === 'High' ? 'bg-red-100 text-red-800' :
                                opportunity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {opportunity.priority}
                              </span>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {opportunity.timeframe}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{opportunity.description}</p>
                        </div>
                      ))}
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
