import React, { useState, useEffect, useCallback } from 'react';
import { Search, BarChart3, TrendingUp, Globe, AlertCircle, CheckCircle, ArrowUpRight, Download, RefreshCw, Plus, Settings } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [competitors, setCompetitors] = useState([
    {
      id: 1,
      name: 'PandaDoc',
      url: 'https://pandadoc.com',
      category: 'Direct',
      lastCrawled: '2025-08-21T10:30:00Z',
      status: 'active',
      marketShare: '15%',
      pricing: 'Freemium + $19-$49/month',
      strengths: ['Strong eSignature', 'Document automation'],
      weaknesses: ['Limited CPQ features', 'Complex pricing'],
      threat: 'High'
    },
    {
      id: 2,
      name: 'DocuSign CLM',
      url: 'https://docusign.com',
      category: 'Direct',
      lastCrawled: '2025-08-21T09:15:00Z',
      status: 'active',
      marketShare: '25%',
      pricing: 'Enterprise ($25-$100/user/month)',
      strengths: ['Market leader', 'Enterprise focus'],
      weaknesses: ['High cost', 'Complex setup'],
      threat: 'Very High'
    },
    {
      id: 3,
      name: 'Proposify',
      url: 'https://proposify.com',
      category: 'Indirect',
      lastCrawled: '2025-08-21T08:45:00Z',
      status: 'monitoring',
      marketShare: '5%',
      pricing: '$49-$149/month',
      strengths: ['Proposal focus', 'Good templates'],
      weaknesses: ['Limited CPQ', 'No advanced analytics'],
      threat: 'Medium'
    }
  ]);

  const [crawlResults, setCrawlResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // Google Drive integration - removed unused state variables
  const [driveFiles, setDriveFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mock Google Drive connection
  const mountGoogleDrive = useCallback(() => {
    // Simulate mounting Google Drive
    setTimeout(() => {
      setIsConnected(true);
      setDriveFiles([
        { name: 'Q3 Competitive Analysis.pdf', type: 'pdf', size: '2.3MB' },
        { name: 'Market Research 2024.xlsx', type: 'excel', size: '1.8MB' },
        { name: 'Competitor Pricing Study.docx', type: 'word', size: '945KB' }
      ]);
    }, 1000);
  }, []);

  useEffect(() => {
    mountGoogleDrive();
  }, [mountGoogleDrive]);

  // Simulated real-time data crawling
  const simulateCrawl = async (competitorId) => {
    setIsAnalyzing(true);
    
    // Simulate API call to Claude for web scraping analysis
    const mockAnalysis = {
      timestamp: new Date().toISOString(),
      competitorId,
      insights: [
        'New pricing page detected with 15% price increase',
        'Added new feature: Advanced Analytics Dashboard',
        'Updated case studies section with 3 new customer stories',
        'Changed messaging focus from "efficiency" to "growth"'
      ],
      changes: [
        { type: 'pricing', severity: 'high', description: 'Price increase detected' },
        { type: 'features', severity: 'medium', description: 'New product capabilities' },
        { type: 'marketing', severity: 'low', description: 'Messaging updates' }
      ]
    };

    setTimeout(() => {
      setCrawlResults(prev => [mockAnalysis, ...prev]);
      setIsAnalyzing(false);
    }, 3000);
  };

  const performDeepAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate Claude API call for deep competitive analysis
    const mockDeepAnalysis = {
      summary: "Based on the latest data crawling and market research, DealHub.io maintains strong competitive positioning in the CPQ space.",
      competitiveMatrix: [
        { feature: 'CPQ Capabilities', dealhub: 9, pandadoc: 6, docusign: 8, proposify: 4 },
        { feature: 'Pricing Flexibility', dealhub: 8, pandadoc: 7, docusign: 5, proposify: 6 },
        { feature: 'Integration Options', dealhub: 8, pandadoc: 7, docusign: 9, proposify: 5 },
        { feature: 'User Experience', dealhub: 9, pandadoc: 8, docusign: 6, proposify: 7 },
        { feature: 'Enterprise Features', dealhub: 8, pandadoc: 6, docusign: 9, proposify: 4 }
      ],
      recommendations: [
        'Focus on integration capabilities to match DocuSign\'s enterprise appeal',
        'Leverage superior CPQ features in marketing messaging',
        'Monitor PandaDoc\'s document automation improvements',
        'Consider competitive pricing response to market changes'
      ],
      threats: [
        { competitor: 'DocuSign CLM', threat: 'Enterprise market dominance', priority: 'High' },
        { competitor: 'PandaDoc', threat: 'Feature parity in mid-market', priority: 'Medium' }
      ],
      opportunities: [
        'Small business market underserved by current solutions',
        'API-first approach gaining traction in tech companies',
        'Compliance features becoming more important'
      ]
    };

    setTimeout(() => {
      setAnalysisData(mockDeepAnalysis);
      setIsAnalyzing(false);
      setActiveTab('results');
    }, 4000);
  };

  const exportCompetitorData = () => {
    const dataToExport = {
      competitors,
      crawlResults,
      analysisData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor-research-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNewCompetitor = () => {
    if (!newCompetitorUrl.trim()) return;
    
    const newId = Math.max(...competitors.map(c => c.id)) + 1;
    const newCompetitor = {
      id: newId,
      name: newCompetitorUrl.split('//')[1]?.split('.')[0] || 'New Competitor',
      url: newCompetitorUrl,
      category: 'Direct',
      lastCrawled: null,
      status: 'pending',
      marketShare: 'Unknown',
      pricing: 'Analyzing...',
      strengths: [],
      weaknesses: [],
      threat: 'Unknown'
    };
    
    setCompetitors([...competitors, newCompetitor]);
    setNewCompetitorUrl('');
    setShowAddForm(false);
    
    // Auto-crawl new competitor
    simulateCrawl(newId);
  };

  const filteredCompetitors = competitors.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || comp.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Competitors</p>
              <p className="text-2xl font-bold text-gray-900">{competitors.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-green-600">↑ 2</span> this month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Threats</p>
              <p className="text-2xl font-bold text-gray-900">
                {competitors.filter(c => c.threat === 'High' || c.threat === 'Very High').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Crawl Results</p>
              <p className="text-2xl font-bold text-gray-900">{crawlResults.length}</p>
            </div>
            <Globe className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Last crawl: 2 hours ago</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drive Files</p>
              <p className="text-2xl font-bold text-gray-900">{driveFiles.length}</p>
            </div>
            <CheckCircle className={`h-8 w-8 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Crawl Results</h3>
        </div>
        <div className="p-6">
          {crawlResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No crawl results yet. Start monitoring competitors to see insights here.</p>
          ) : (
            <div className="space-y-4">
              {crawlResults.slice(0, 5).map((result, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {competitors.find(c => c.id === result.competitorId)?.name} Analysis
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.insights[0]}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.changes[0]?.severity === 'high' ? 'bg-red-100 text-red-800' :
                    result.changes[0]?.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {result.changes[0]?.severity} priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CompetitorsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search competitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="direct">Direct Competitors</option>
            <option value="indirect">Indirect Competitors</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportCompetitorData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Competitor
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Competitor</h3>
          <div className="flex gap-4">
            <input
              type="url"
              placeholder="Enter competitor URL (e.g., https://competitor.com)"
              value={newCompetitorUrl}
              onChange={(e) => setNewCompetitorUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addNewCompetitor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threat Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Crawled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompetitors.map((competitor) => (
                <tr key={competitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {competitor.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {competitor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {competitor.url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      competitor.category === 'Direct' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {competitor.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {competitor.marketShare}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      competitor.threat === 'Very High' ? 'bg-red-100 text-red-800' :
                      competitor.threat === 'High' ? 'bg-orange-100 text-orange-800' :
                      competitor.threat === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {competitor.threat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {competitor.lastCrawled 
                      ? new Date(competitor.lastCrawled).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => simulateCrawl(competitor.id)}
                      disabled={isAnalyzing}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      Crawl
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AnalysisTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deep Competitive Analysis</h3>
        <p className="text-gray-600 mb-6">
          Generate comprehensive competitive intelligence using Claude AI to analyze competitor data, 
          market positioning, and strategic insights.
        </p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={performDeepAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <BarChart3 className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Start Deep Analysis'}
          </button>
          
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Analyzing competitor data with Claude AI...
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Crawling competitor websites...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm text-gray-600">Analyzing pricing strategies...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600">Generating strategic insights...</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Google Drive Integration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected to Google Drive' : 'Connecting...'}
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Refresh Files
            </button>
          </div>
          
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {driveFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ResultsTab = () => (
    <div className="space-y-6">
      {analysisData ? (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h3>
            <p className="text-gray-700">{analysisData.summary}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Competitive Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-medium text-gray-900">Feature</th>
                    <th className="text-center py-2 px-4 font-medium text-blue-600">DealHub.io</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-600">PandaDoc</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-600">DocuSign</th>
                    <th className="text-center py-2 px-4 font-medium text-gray-600">Proposify</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.competitiveMatrix.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{row.dealhub}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.pandadoc}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.docusign}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.proposify}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Key Threats
              </h3>
              <div className="space-y-3">
                {analysisData.threats.map((threat, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{threat.competitor}</p>
                      <p className="text-sm text-gray-600">{threat.threat}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      threat.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {threat.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Opportunities
              </h3>
              <div className="space-y-3">
                {analysisData.opportunities.map((opportunity, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <p className="text-gray-700">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Recommendations</h3>
            <div className="space-y-3">
              {analysisData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results Yet</h3>
          <p className="text-gray-500 mb-6">
            Run a deep analysis to see competitive insights and strategic recommendations.
          </p>
          <button
            onClick={() => setActiveTab('analysis')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DealHub.io</h1>
                <p className="text-sm text-gray-500">Competitor Research Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportCompetitorData}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4" />
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'competitors', label: 'Competitors', icon: TrendingUp },
              { id: 'analysis', label: 'Analysis', icon: Search },
              { id: 'results', label: 'Results', icon: CheckCircle }
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'competitors' && <CompetitorsTab />}
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'results' && <ResultsTab />}
      </main>
    </div>
  );
};

export default Dashboard;
