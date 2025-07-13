'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowLeft, MessageCircle, DollarSign, Zap } from 'lucide-react';
import { matchItems } from '@/lib/aiLogic';

const allItems = [
  {
    id: 1,
    title: "Vintage Acoustic Guitar",
    description: "Beautiful vintage guitar in excellent condition",
    value: 450,
    category: "Musical Instruments",
    condition: "excellent",
    compatibility: 95,
    image: "https://images.pexels.com/photos/1049690/pexels-photo-1049690.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 2,
    title: "High-End DSLR Camera",
    description: "Professional camera with multiple lenses",
    value: 800,
    category: "Electronics",
    condition: "good",
    compatibility: 88,
    image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 3,
    title: "Artisan Coffee Maker",
    description: "Premium espresso machine for coffee lovers",
    value: 320,
    category: "Kitchen",
    condition: "excellent",
    compatibility: 92,
    image: "https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 4,
    title: "Mountain Bike",
    description: "Professional trail bike with premium components",
    value: 600,
    category: "Sports",
    condition: "good",
    compatibility: 85,
    image: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 5,
    title: "Designer Office Chair",
    description: "Ergonomic chair with premium materials",
    value: 400,
    category: "Home & Garden",
    condition: "excellent",
    compatibility: 90,
    image: "https://images.pexels.com/photos/586024/pexels-photo-586024.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 6,
    title: "Professional Art Set",
    description: "Complete set with paints, brushes, and canvas",
    value: 280,
    category: "Art & Crafts",
    condition: "good",
    compatibility: 87,
    image: "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

const categories = ['All', 'Electronics', 'Musical Instruments', 'Kitchen', 'Sports', 'Home & Garden', 'Art & Crafts'];

export default function MatchesPage() {
  const [items, setItems] = useState(allItems);
  const [filteredItems, setFilteredItems] = useState(allItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [valueRange, setValueRange] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, valueRange]);

  const filterItems = () => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Value range filter
    if (valueRange !== 'All') {
      const [min, max] = valueRange.split('-').map(Number);
      filtered = filtered.filter(item => {
        if (max) {
          return item.value >= min && item.value <= max;
        } else {
          return item.value >= min;
        }
      });
    }

    setFilteredItems(filtered);
  };

  const refreshMatches = async () => {
    setLoading(true);
    // Simulate AI matching
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newMatches = matchItems({ value: 500, category: 'Electronics' });
    setItems(newMatches);
    setLoading(false);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Match</h1>
              <p className="text-gray-600">Discover items that match your preferences</p>
            </div>
            <Button 
              onClick={refreshMatches}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finding Matches...
                </div>
              ) : (
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  AI Refresh
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={valueRange} onValueChange={setValueRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Value Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Prices</SelectItem>
                  <SelectItem value="0-200">$0 - $200</SelectItem>
                  <SelectItem value="200-500">$200 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000">$1000+</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredItems.length} items matching your criteria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <div className={`px-2 py-1 rounded-full text-white text-xs font-semibold flex items-center ${getCompatibilityColor(item.compatibility)}`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {item.compatibility}% Match
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ${item.value}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.condition}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link href={`/negotiate/${item.id}`}>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Swap
                    </Button>
                  </Link>
                  <Link href={`/negotiate/${item.id}?mode=negotiate`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Negotiate
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or refresh for new matches</p>
            <Button onClick={refreshMatches} className="bg-green-600 hover:bg-green-700">
              <Zap className="w-4 h-4 mr-2" />
              Find New Matches
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}