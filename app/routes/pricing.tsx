import React, { useState, useEffect } from 'react';

export default function Pricing() {
  const [claimCode, setClaimCode] = useState('');
  const [isCodeRedeemed, setIsCodeRedeemed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Check if code is already redeemed on component mount
  useEffect(() => {
    const redeemed = localStorage.getItem('claimCodeRedeemed');
    if (redeemed === 'true') {
      setIsCodeRedeemed(true);
    }
  }, []);

  const handleClaimCode = () => {
    if (claimCode.trim() === '3636') {
      // Save to localStorage
      localStorage.setItem('claimCodeRedeemed', 'true');
      localStorage.setItem('hourlyTokens', '3000000'); // 3M tokens
      localStorage.setItem('claimCodeUsed', claimCode);
      
      setIsCodeRedeemed(true);
      setShowSuccess(true);
      setShowError(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(true);
      setShowSuccess(false);
      
      // Hide error message after 3 seconds
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleLockClaim = () => {
    // Remove claim from localStorage
    localStorage.removeItem('claimCodeRedeemed');
    localStorage.removeItem('hourlyTokens');
    localStorage.removeItem('claimCodeUsed');
    
    // Reset to normal 350K tokens
    localStorage.setItem('hourlyTokens', '350000'); // 350K tokens
    
    setIsCodeRedeemed(false);
    setClaimCode('');
    setShowSuccess(false);
    setShowError(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start pt-24 px-4 relative">
      {/* Back Button */}
      <a
        href="/"
        className="absolute top-8 left-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-200 z-50"
        style={{ textDecoration: 'none' }}
      >
        ← Back to Home
      </a>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-400">Choose Your Plan</h1>
      <p className="mb-12 text-lg text-gray-300">Unlock more AI power and deployment options with a one-time upgrade.</p>
      
      {/* Claim Code Section */}
      <div className="w-full max-w-md mb-8">
        <div className="bg-[#101522] border-2 border-green-500 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-green-400 mb-4 text-center">🎁 Claim Code</h3>
          {isCodeRedeemed ? (
            <div className="text-center">
              <div className="text-green-400 text-lg font-semibold mb-2">✅ Code Redeemed!</div>
              <div className="text-gray-300 text-sm">You now have 3M hourly tokens!</div>
              <div className="text-gray-400 text-xs mt-2">Code used: {localStorage.getItem('claimCodeUsed')}</div>
              <button
                onClick={handleLockClaim}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                🔒 Lock Claim
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-300 text-sm text-center">
                Enter a claim code to get bonus tokens
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="Enter claim code..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleClaimCode()}
                />
                <button
                  onClick={handleClaimCode}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Claim
                </button>
              </div>
              {showSuccess && (
                <div className="text-green-400 text-sm text-center animate-pulse">
                  🎉 Success! You now have 3M hourly tokens!
                </div>
              )}
              {showError && (
                <div className="text-red-400 text-sm text-center animate-pulse">
                  ❌ Invalid claim code. Please try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
        {/* FREE PLAN */}
        <div className="flex-1 bg-[#101522] border-2 border-blue-700 rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">FREE</h2>
          <div className="text-4xl font-extrabold mb-4 text-white">$0</div>
          <div className="text-lg font-semibold text-blue-300 mb-4">350K Hourly Tokens</div>
          <ul className="text-left text-gray-200 space-y-2 mb-8">
            <li>✔️ Access to Gemini 1.5 & 2.0 Flash</li>
            <li>✔️ Access to OpenAI GPT 4o Mini (3 messages)</li>
            <li>✔️ Some Access to Groq Models</li>
            <li>✔️ Deploy Projects to Netlify</li>
          </ul>
          <button className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold opacity-60 cursor-not-allowed">Current Plan</button>
        </div>
        {/* PRO PLAN */}
        <div className="flex-1 bg-[#101522] border-2 border-blue-500 rounded-2xl p-8 shadow-xl flex flex-col items-center scale-105">
          <h2 className="text-2xl font-bold text-blue-300 mb-2">PRO</h2>
          <div className="text-4xl font-extrabold mb-4 text-white">$4.99 <span className="text-lg font-normal">lifetime</span></div>
          <div className="text-lg font-semibold text-blue-300 mb-4">3.5M Hourly Tokens</div>
          <ul className="text-left text-gray-200 space-y-2 mb-8">
            <li>✔️ Everything in FREE</li>
            <li>✔️ Access to Gemini 2.5 Flash</li>
            <li>✔️ Access to all OpenAI Models</li>
            <li>✔️ Access to Groq Models</li>
            <li>✔️ Deploy Projects to Netlify and Vercel</li>
          </ul>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200">Upgrade to PRO</button>
        </div>
        {/* PREMIUM PLAN */}
        <div className="flex-1 bg-[#101522] border-2 border-blue-400 rounded-2xl p-8 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold text-blue-200 mb-2">PREMIUM</h2>
          <div className="text-4xl font-extrabold mb-4 text-white">$9.99 <span className="text-lg font-normal">lifetime</span></div>
          <div className="text-lg font-semibold text-blue-300 mb-4">35B Monthly Tokens</div>
          <ul className="text-left text-gray-200 space-y-2 mb-8">
            <li>✔️ Everything In PRO</li>
            <li>✔️ All Models Access</li>
            <li>✔️ Deploy Projects to a lot of services</li>
            <li>✔️ Access Connecting Domains</li>
          </ul>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200">Upgrade to PREMIUM</button>
        </div>
      </div>
    </div>
  );
} 