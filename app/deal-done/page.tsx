'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Share2, Plus, Home, Sparkles } from 'lucide-react';

export default function DealDonePage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const shareSuccess = () => {
    if (navigator.share) {
      navigator.share({
        title: 'EcoBarter AI - Successful Trade!',
        text: 'I just completed an amazing trade on EcoBarter AI!',
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I just completed an amazing trade on EcoBarter AI! Check it out: ${window.location.origin}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-4 border-green-300 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🎉 Trade Complete!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Congratulations! Your trade has been successfully completed. 
          Both parties will receive contact information to arrange the exchange.
        </p>

        {/* Transaction Summary */}
        <Card className="mb-8 text-left">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
              Transaction Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">You're Trading</h3>
                  <p className="text-gray-600">Vintage Laptop</p>
                  <p className="text-sm text-gray-500">Value: $450</p>
                </div>
                <div className="text-2xl">⬅️</div>
                <div className="text-right">
                  <h3 className="font-semibold">You're Receiving</h3>
                  <p className="text-gray-600">Acoustic Guitar</p>
                  <p className="text-sm text-gray-500">Value: $450</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Trade ID:</span>
                  <p className="font-mono">ECO-{Date.now().toString().slice(-6)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Your Contact:</span>
                  <p>Shared with Alex Johnson</p>
                </div>
                <div>
                  <span className="text-gray-500">Their Contact:</span>
                  <p>alex.j@email.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={shareSuccess}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Success
          </Button>
          
          <Link href="/upload">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              List Another Item
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-800">What's Next?</h3>
            <div className="text-left space-y-2 text-green-700">
              <p>• Contact Alex Johnson to arrange the exchange</p>
              <p>• Meet in a safe, public location</p>
              <p>• Verify the item condition before completing the trade</p>
              <p>• Don't forget to rate your trading experience!</p>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">🌍 Your Environmental Impact</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">2.1 kg</div>
              <div className="text-sm text-gray-600">CO₂ Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Item Reused</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">$450</div>
              <div className="text-sm text-gray-600">Value Exchanged</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}