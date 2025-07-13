'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Leaf, Recycle, Users, Zap } from 'lucide-react';

const featuredItems = [
  {
    id: 1,
    title: "Vintage Acoustic Guitar",
    description: "Beautiful vintage guitar in excellent condition",
    value: 450,
    category: "Musical Instruments",
    image: "https://images.pexels.com/photos/1049690/pexels-photo-1049690.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 2,
    title: "High-End DSLR Camera",
    description: "Professional camera with multiple lenses",
    value: 800,
    category: "Electronics",
    image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 3,
    title: "Artisan Coffee Maker",
    description: "Premium espresso machine for coffee lovers",
    value: 320,
    category: "Kitchen",
    image: "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Trade Smart,
                <span className="text-green-600"> Live Green</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join the sustainable economy with AI-powered bartering. 
                Find perfect matches, negotiate fair trades, and reduce waste 
                while getting what you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/upload">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white group">
                    Start Bartering
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
                    Browse Items
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Recycle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="font-semibold text-2xl text-gray-900">10K+</div>
                      <div className="text-sm text-gray-500">Items Traded</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-yellow-600" />
                      </div>
                      <div className="font-semibold text-2xl text-gray-900">5K+</div>
                      <div className="text-sm text-gray-500">Happy Users</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Leaf className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="font-semibold text-2xl text-gray-900">95%</div>
                      <div className="text-sm text-gray-500">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-8 h-8 text-yellow-600" />
                      </div>
                      <div className="font-semibold text-2xl text-gray-900">AI</div>
                      <div className="text-sm text-gray-500">Powered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EcoBarter AI?</h2>
            <p className="text-xl text-gray-600">Experience the future of sustainable trading</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">AI-Powered Matching</h3>
              <p className="text-gray-600">Our smart algorithm finds the perfect trading partners based on your preferences and item values.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Smart Negotiation</h3>
              <p className="text-gray-600">AI-assisted negotiation helps you get fair deals while maintaining positive relationships.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce waste and carbon footprint by giving items a second life through smart bartering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Items</h2>
            <p className="text-xl text-gray-600">Discover amazing items ready for trade</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <Card key={item.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${item.value}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <Link href="/matches">
                      <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/matches">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                View All Items
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}