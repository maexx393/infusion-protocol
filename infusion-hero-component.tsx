import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, TrendingUp, Zap, Brain, ArrowRight, Activity, DollarSign, BarChart3, RefreshCw, CheckCircle, AlertCircle, Shuffle, ArrowUpDown } from 'lucide-react';

const InFusionHero = () => {
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', content: "Welcome! I'm your AI swap assistant. Try asking me to 'find the best route for swapping ETH to USDC' or 'set up a swap from Polygon to Solana'!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [swapData, setSwapData] = useState({
    fromChain: 'ethereum',
    toChain: 'polygon',
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.0',
    toAmount: '1,864.32',
    isAnalyzing: false,
    route: null,
    gasEstimate: '$12.50',
    slippage: '0.5%',
    executionTime: '~2 mins'
  });
  const [swapStatus, setSwapStatus] = useState('ready'); // ready, analyzing, confirmed, executing, completed
  const [liveRoutes, setLiveRoutes] = useState([
    { path: 'ETH → Polygon → USDC', cost: '$8.20', time: '2m 15s', savings: '34%' },
    { path: 'ETH → Arbitrum → USDC', cost: '$5.80', time: '1m 45s', savings: '53%' },
    { path: 'ETH → Direct → USDC', cost: '$12.50', time: '3m 20s', savings: '0%' }
  ]);

  const chatRef = useRef(null);

  const chains = {
    ethereum: { name: 'Ethereum', color: 'from-blue-500 to-blue-600', icon: '⟠' },
    polygon: { name: 'Polygon', color: 'from-purple-500 to-purple-600', icon: '⬟' },
    arbitrum: { name: 'Arbitrum', color: 'from-blue-400 to-cyan-500', icon: '◆' },
    solana: { name: 'Solana', color: 'from-green-400 to-purple-500', icon: '◉' },
    bsc: { name: 'BSC', color: 'from-yellow-500 to-orange-500', icon: '♦' }
  };

  const tokens = ['ETH', 'USDC', 'USDT', 'BTC', 'SOL', 'MATIC', 'ARB'];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Simulate real-time route updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRoutes(prev => prev.map(route => ({
        ...route,
        cost: `$${(parseFloat(route.cost.slice(1)) + (Math.random() - 0.5) * 2).toFixed(2)}`,
        time: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const processAICommand = async (message) => {
    const lowerMsg = message.toLowerCase();
    let response = "";
    let action = null;

    if (lowerMsg.includes('swap') || lowerMsg.includes('exchange')) {
      if (lowerMsg.includes('eth') && lowerMsg.includes('usdc')) {
        setSwapData(prev => ({ ...prev, fromToken: 'ETH', toToken: 'USDC', fromAmount: '1.0' }));
        response = "Perfect! I've set up an ETH to USDC swap for you. Analyzing the best routes across chains...";
        action = 'analyze';
      } else if (lowerMsg.includes('polygon') || lowerMsg.includes('solana')) {
        const toChain = lowerMsg.includes('solana') ? 'solana' : 'polygon';
        setSwapData(prev => ({ ...prev, toChain }));
        response = `Great! I've updated the destination to ${chains[toChain].name}. The route is optimized for lowest fees.`;
        action = 'analyze';
      } else {
        response = "I can help you swap! What tokens would you like to exchange? For example: 'Swap 1 ETH for USDC' or 'Exchange BTC to SOL'";
      }
    } else if (lowerMsg.includes('route') || lowerMsg.includes('path')) {
      response = "I found 3 optimal routes for you! The Arbitrum path saves you 53% on gas fees. Shall I select the most efficient one?";
      action = 'showRoutes';
    } else if (lowerMsg.includes('gas') || lowerMsg.includes('fee')) {
      response = `Current gas estimate is ${swapData.gasEstimate}. I can optimize this by routing through Layer 2 chains. Want me to find cheaper alternatives?`;
    } else if (lowerMsg.includes('execute') || lowerMsg.includes('confirm') || lowerMsg.includes('go')) {
      response = "Executing your atomic swap now! I'll handle the cross-chain routing and ensure secure execution.";
      action = 'execute';
    } else if (lowerMsg.includes('slippage')) {
      const newSlippage = lowerMsg.includes('0.1') ? '0.1%' : lowerMsg.includes('1') ? '1.0%' : '0.5%';
      setSwapData(prev => ({ ...prev, slippage: newSlippage }));
      response = `Slippage tolerance updated to ${newSlippage}. This ${newSlippage === '0.1%' ? 'reduces risk but may cause failures' : 'balances risk and success rate'}.`;
    } else if (lowerMsg.includes('amount')) {
      const amount = lowerMsg.match(/(\d+\.?\d*)/)?.[1] || '1.0';
      setSwapData(prev => ({ ...prev, fromAmount: amount }));
      response = `Amount updated to ${amount} ${swapData.fromToken}. Recalculating optimal routes...`;
      action = 'analyze';
    } else {
      response = "I can help you with atomic swaps, route optimization, gas estimation, and execution. Try asking me to 'swap ETH to USDC', 'find best routes', or 'execute the swap'!";
    }

    return { response, action };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    // Process AI command
    setTimeout(async () => {
      const { response, action } = await processAICommand(userMessage);
      
      setChatMessages(prev => [...prev, { type: 'ai', content: response }]);
      setIsTyping(false);

      // Execute actions based on AI analysis
      if (action === 'analyze') {
        setSwapStatus('analyzing');
        setTimeout(() => {
          setSwapStatus('ready');
          setChatMessages(prev => [...prev, { 
            type: 'ai', 
            content: "Analysis complete! I found the optimal route through Arbitrum saving you 53% on gas. Ready to execute?" 
          }]);
        }, 2000);
      } else if (action === 'execute') {
        executeSwap();
      }
    }, 1000);
  };

  const executeSwap = async () => {
    setSwapStatus('executing');
    setChatMessages(prev => [...prev, { 
      type: 'ai', 
      content: "🚀 Swap initiated! Routing through Arbitrum for optimal gas savings..." 
    }]);

    // Simulate swap execution stages
    const stages = [
      { delay: 1000, status: 'Approving token spend...', progress: 25 },
      { delay: 2000, status: 'Bridging to Arbitrum...', progress: 50 },
      { delay: 1500, status: 'Executing swap on Arbitrum...', progress: 75 },
      { delay: 1000, status: 'Bridging back to destination...', progress: 90 },
      { delay: 500, status: 'Swap completed successfully!', progress: 100 }
    ];

    for (let stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        content: `${stage.status} (${stage.progress}%)` 
      }]);
    }

    setSwapStatus('completed');
    setChatMessages(prev => [...prev, { 
      type: 'ai', 
      content: "✅ Atomic swap completed! You saved $6.70 in gas fees using the optimized route. Transaction hash: 0x7f8a9b..." 
    }]);
  };

  const selectBestRoute = () => {
    const bestRoute = liveRoutes[1]; // Arbitrum route with highest savings
    setSwapData(prev => ({ ...prev, gasEstimate: bestRoute.cost, executionTime: bestRoute.time }));
    setChatMessages(prev => [...prev, { 
      type: 'ai', 
      content: `Selected the Arbitrum route! You'll save ${bestRoute.savings} on gas fees. Ready to execute?` 
    }]);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white opacity-20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-white/80 text-sm">AI Atomic Swap Engine • Live</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Intelligent
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Atomic Swaps</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Chat with AI to execute optimal cross-chain swaps. Real-time route analysis, gas optimization, and automated execution.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Atomic Swap Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-xl">Atomic Swap</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  swapStatus === 'ready' ? 'bg-green-500/20 text-green-400' :
                  swapStatus === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                  swapStatus === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {swapStatus === 'ready' ? '🟢 Ready' :
                   swapStatus === 'analyzing' ? '🟡 Analyzing' :
                   swapStatus === 'executing' ? '🔵 Executing' :
                   '✅ Completed'}
                </div>
              </div>

              {/* Swap Configuration */}
              <div className="space-y-4">
                {/* From Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70 text-sm">From</span>
                    <span className="text-white/50 text-xs">Balance: 2.45 ETH</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={swapData.fromChain} 
                      onChange={(e) => setSwapData(prev => ({ ...prev, fromChain: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      {Object.entries(chains).map(([key, chain]) => (
                        <option key={key} value={key} className="bg-gray-800">{chain.icon} {chain.name}</option>
                      ))}
                    </select>
                    <select 
                      value={swapData.fromToken}
                      onChange={(e) => setSwapData(prev => ({ ...prev, fromToken: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      {tokens.map(token => (
                        <option key={token} value={token} className="bg-gray-800">{token}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={swapData.fromAmount}
                      onChange={(e) => setSwapData(prev => ({ ...prev, fromAmount: e.target.value }))}
                      className="bg-transparent text-white text-right text-lg font-semibold flex-1 focus:outline-none"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Swap Direction Button */}
                <div className="flex justify-center">
                  <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 hover:scale-110">
                    <ArrowUpDown className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* To Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70 text-sm">To</span>
                    <span className="text-white/50 text-xs">Balance: 5,240.80 USDC</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={swapData.toChain}
                      onChange={(e) => setSwapData(prev => ({ ...prev, toChain: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      {Object.entries(chains).map(([key, chain]) => (
                        <option key={key} value={key} className="bg-gray-800">{chain.icon} {chain.name}</option>
                      ))}
                    </select>
                    <select 
                      value={swapData.toToken}
                      onChange={(e) => setSwapData(prev => ({ ...prev, toToken: e.target.value }))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      {tokens.map(token => (
                        <option key={token} value={token} className="bg-gray-800">{token}</option>
                      ))}
                    </select>
                    <div className="text-white text-right text-lg font-semibold flex-1">
                      {swapStatus === 'analyzing' ? (
                        <div className="flex items-center justify-end gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-white/50">Calculating...</span>
                        </div>
                      ) : swapData.toAmount}
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 mb-1">Gas Fee</div>
                    <div className="text-white font-medium">{swapData.gasEstimate}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 mb-1">Slippage</div>
                    <div className="text-white font-medium">{swapData.slippage}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 mb-1">Time</div>
                    <div className="text-white font-medium">{swapData.executionTime}</div>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={executeSwap}
                  disabled={swapStatus === 'executing'}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                    swapStatus === 'executing' 
                      ? 'bg-blue-500/50 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
                  }`}
                >
                  {swapStatus === 'executing' ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Executing Swap...
                    </div>
                  ) : swapStatus === 'completed' ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Swap Completed
                    </div>
                  ) : (
                    'Execute Atomic Swap'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat & Route Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Chat */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-white font-semibold">AI Swap Assistant</h3>
              </div>
              
              <div ref={chatRef} className="h-48 overflow-y-auto mb-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-white/10 text-white/90'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 px-3 py-2 rounded-2xl text-white/90">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Try: 'swap 1 ETH to USDC' or 'find best routes'"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Live Route Analysis */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Live Routes</h3>
                <button 
                  onClick={selectBestRoute}
                  className="text-green-400 text-sm hover:text-green-300 transition-colors"
                >
                  Select Best
                </button>
              </div>
              
              <div className="space-y-3">
                {liveRoutes.map((route, idx) => (
                  <div key={idx} className={`bg-white/5 rounded-lg p-3 border transition-all cursor-pointer hover:bg-white/10 ${
                    idx === 1 ? 'border-green-400/50 bg-green-400/5' : 'border-white/10'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-white text-sm font-medium">{route.path}</div>
                      {idx === 1 && <div className="text-green-400 text-xs font-medium">BEST</div>}
                    </div>
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Cost: {route.cost}</span>
                      <span>Time: {route.time}</span>
                      <span className="text-green-400">Save {route.savings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InFusionHero;