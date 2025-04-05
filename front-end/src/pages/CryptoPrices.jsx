import  { useState, useEffect } from 'react';

const CryptoPrices = () => {
    const [prices, setPrices] = useState({
        BTC: 0,
        ETH: 0,
        SOL: 0
    });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch('http://localhost:8080/crypto');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPrices({
                    BTC: data['XXBTZUSD'] ? data['XXBTZUSD']['c'][0] : 0,
                    ETH: data['XETHZUSD'] ? data['XETHZUSD']['c'][0] : 0,
                    SOL: data['SOLUSD'] ? data['SOLUSD']['c'][0] : 0
                });
            } catch (error) {
                console.error('Failed to fetch prices:', error);
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
                {Object.entries(prices).map(([symbol, price]) => (
                    <div
                        key={symbol}
                        className="relative group bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700 rounded-2xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                    >
                        {/* Neon glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />

                        {/* Symbol badge */}
                        <div className="absolute -top-3 left-6 bg-gray-900 border border-gray-700 rounded-full px-3 py-1">
                            <h2 className="text-xl font-bold text-white tracking-wider">{symbol}</h2>
                        </div>

                        {/* Price display */}
                        <div className="mt-6">
                            <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse-slow">
                                ${parseFloat(price).toFixed(2)}
                            </p>
                            <div className="mt-2 h-1 w-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                        </div>

                        {/* Subtle overlay pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')] -z-10" />
                    </div>
                ))}
            </div>

            {/* Add this style tag for custom animations */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CryptoPrices;
