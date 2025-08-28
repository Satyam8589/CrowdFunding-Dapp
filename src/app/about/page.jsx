"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full shadow-lg animate-bounce-subtle">
              🚀 Blockchain Powered
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-8 animate-slide-up">
            About CrowdFund
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-slide-up-delay">
            Revolutionizing crowdfunding through blockchain technology, creating
            a transparent, decentralized platform for funding innovative
            projects worldwide.
          </p>
        </div>

        {/* Mission Section */}
        <div className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-white/20 hover:shadow-3xl transition-all duration-700 hover:scale-[1.02] animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            At CrowdFund, we believe in the power of community to bring great
            ideas to life. Traditional crowdfunding platforms often lack
            transparency and charge high fees, limiting the potential of both
            creators and backers.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            Our blockchain-based platform eliminates intermediaries, reduces
            fees to just 1%, and provides complete transparency through smart
            contracts. Every transaction is recorded on the Ethereum blockchain,
            ensuring trust and accountability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            {
              icon: "🛡️",
              title: "Transparent & Trustless",
              description: "All transactions are recorded on the blockchain, providing complete transparency. Smart contracts ensure funds are handled exactly as programmed.",
              gradient: "from-blue-500 to-cyan-500",
              delay: "0ms"
            },
            {
              icon: "💰",
              title: "Low Fees",
              description: "Only 1% platform fee compared to traditional platforms that charge 5-8%. More of your funds go directly to the projects you support.",
              gradient: "from-green-500 to-emerald-500",
              delay: "200ms"
            },
            {
              icon: "🌍",
              title: "Global Accessibility",
              description: "Anyone with an Ethereum wallet can participate, regardless of location. No geographic restrictions or complex verification processes.",
              gradient: "from-purple-500 to-pink-500",
              delay: "400ms"
            },
            {
              icon: "📊",
              title: "Immutable Records",
              description: "Campaign data and contributions are permanently stored on the blockchain, creating an immutable record of all fundraising activities.",
              gradient: "from-orange-500 to-red-500",
              delay: "600ms"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-up cursor-pointer"
              style={{animationDelay: feature.delay}}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-white/20 animate-slide-up">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              {
                number: "1",
                title: "Connect Your Wallet",
                description: "Connect your Ethereum wallet (MetaMask, WalletConnect, etc.) to the platform.",
                color: "from-blue-500 to-blue-600"
              },
              {
                number: "2",
                title: "Create or Support Campaigns",
                description: "Create your own campaign or browse and support existing projects that interest you.",
                color: "from-green-500 to-green-600"
              },
              {
                number: "3",
                title: "Smart Contract Execution",
                description: "All transactions are handled by smart contracts, ensuring automatic and secure processing.",
                color: "from-purple-500 to-purple-600"
              },
              {
                number: "4",
                title: "Withdraw Funds",
                description: "Campaign creators can withdraw raised funds after the deadline, with a minimal 1% platform fee.",
                color: "from-orange-500 to-orange-600"
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start group hover:scale-105 transition-transform duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mr-6 mt-1 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-10 mb-16 text-white animate-slide-up">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "⟠",
                name: "Ethereum",
                description: "Decentralized blockchain platform for smart contracts",
                color: "from-gray-700 to-gray-800"
              },
              {
                icon: "◦",
                name: "Solidity",
                description: "Smart contract programming language",
                color: "from-blue-600 to-blue-700"
              },
              {
                icon: "▲",
                name: "Next.js",
                description: "React framework for the frontend interface",
                color: "from-black to-gray-900"
              }
            ].map((tech, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-transform duration-300">
                <div className={`w-20 h-20 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500`}>
                  <span className="text-white font-bold text-2xl">{tech.icon}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{tech.name}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-white/20 animate-slide-up">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                emoji: "🌟",
                title: "Innovation",
                description: "We embrace cutting-edge blockchain technology to solve real-world problems."
              },
              {
                emoji: "🤝",
                title: "Trust",
                description: "Transparency and reliability are at the core of everything we build."
              },
              {
                emoji: "🌍",
                title: "Accessibility",
                description: "We believe funding opportunities should be available to everyone, everywhere."
              },
              {
                emoji: "💡",
                title: "Empowerment",
                description: "We empower creators to bring their visions to life without traditional barriers."
              }
            ].map((value, index) => (
              <div key={index} className="group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3 group-hover:scale-125 transition-transform duration-300">{value.emoji}</span>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {value.title}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed ml-12">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden animate-slide-up">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-64 h-64 bg-white rounded-full -top-32 -left-32 animate-pulse"></div>
            <div className="absolute w-48 h-48 bg-white rounded-full -bottom-24 -right-24 animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators and backers using our decentralized
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/campaigns/create"
                className="group bg-white text-blue-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl transform"
              >
                <span className="group-hover:mr-2 transition-all duration-300">Create Campaign</span>
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
              <a
                href="/campaigns"
                className="group border-2 border-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl transform"
              >
                <span className="group-hover:mr-2 transition-all duration-300">Explore Campaigns</span>
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">🔍</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}