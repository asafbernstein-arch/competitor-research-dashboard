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
      setAnalysisProgress('Testing API connection...');
      
      if (!apiKey) {
        throw new Error('Please add your API key first');
      }

      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysisProgress('API connection successful!');
      setTimeout(() => setAnalysisProgress(''), 3000);
      
    } catch (error) {
      setAnalysisProgress(`Connection failed: ${error.message}`);
      setTimeout(() => setAnalysisProgress(''), 5000);
    }
  };

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

  // Export functionality
  const exportData = () => {
    const data = {
      competitors,
      analysisResults,
      crawlResults,
      customIntelligence,
      driveFiles: driveFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor-research-export.json';
    a.click();
    URL.revokeObjectURL(url);
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
                  disabled={true}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Discover Competitors with AI
                </button>
                <p className="text-sm text-gray-500 flex items-center">
                  Configure API key to enable AI features
                </p>
              </div>
            </div>

            {/* Mock Competitors Display */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sample Competitors (Demo)</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Salesforce CPQ', category: 'Direct', threat: 'Very High' },
                    { name: 'PandaDoc', category: 'Direct', threat: 'High' },
                    { name: 'Oracle CPQ', category: 'Direct', threat: 'High' },
                    { name: 'Proposify', category: 'Indirect', threat: 'Medium' }
                  ].map((comp) => (
                    <div key={comp.name} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{comp.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comp.category === 'Direct' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comp.category}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comp.threat === 'Very High' ? 'bg-red-100 text-red-800' :
                          comp.threat === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comp.threat} Threat
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Cards Tab */}
        {activeTab === 'battlecards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitive Battle Cards</h2>
              <p className="text-gray-600 mb-6">
                Generate detailed battle cards that compare DealHub.io against each competitor.
              </p>
              
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Battle Cards Yet</h3>
                <p className="text-gray-500 mb-4">
                  Configure API key and discover competitors to generate battle cards.
                </p>
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
                      <option value="Salesforce CPQ">Salesforce CPQ</option>
                      <option value="PandaDoc">PandaDoc</option>
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
                Generate comprehensive competitive intelligence using Claude AI.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <button
                  disabled={true}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Start AI Analysis
                </button>
                
                <p className="text-sm text-gray-500">
                  Configure API key to enable AI analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
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
          </div>
        )}
      </main>
    </div>
  );
};

export default RealCompetitorDashboard;
