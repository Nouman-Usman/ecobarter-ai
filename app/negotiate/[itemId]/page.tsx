'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Calculator, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import itemsData from '@/data/items.json';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'proposal' | 'counter' | 'message';
}

export default function NegotiatePage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the item from the JSON data
    const foundItem = itemsData.find(item => item.id.toString() === params.itemId);
    if (foundItem) {
      const transformedItem = {
        ...foundItem,
        image: foundItem.images[0],
      };
      setItem(transformedItem);
    }
  }, [params.itemId]);

  useEffect(() => {
    if (!item) return;
    
    // Initialize conversation
    const initialMessage: Message = {
      id: 1,
      text: `Hi! I'm interested in trading for your ${item?.title}. I have a few items that might interest you. What are you looking for in a trade?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'message'
    };
    setMessages([initialMessage]);
  }, [item]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          itemContext: item
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response;
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'message'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Enhanced fallback response based on message content
      let fallbackText = "I'm having trouble connecting right now, but I'm definitely interested in discussing this trade!";
      
      const lowerMessage = messageToSend.toLowerCase();
      if (lowerMessage.includes('trade') || lowerMessage.includes('swap')) {
        fallbackText = `That sounds like a great trade opportunity! I'd love to learn more about what you're offering for my ${item?.title}.`;
      } else if (lowerMessage.includes('value') || lowerMessage.includes('price')) {
        fallbackText = `My ${item?.title} is valued at $${item?.value}. What's the estimated value of your item?`;
      } else if (lowerMessage.includes('accept') || lowerMessage.includes('deal')) {
        fallbackText = "Fantastic! I'm excited about this trade. Let's finalize the details!";
      }
      
      const fallbackMessage: Message = {
        id: messages.length + 2,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setLoading(false);
  };

  const makeProposal = (type: 'propose' | 'counter' | 'accept') => {
    let proposalText = '';
    
    switch (type) {
      case 'propose':
        proposalText = `I'd like to propose a trade: my vintage laptop (worth $${item?.value}) for your ${item?.title}. What do you think?`;
        break;
      case 'counter':
        proposalText = `I appreciate your offer, but could we adjust the terms? How about adding a small cash amount to balance the values?`;
        break;
      case 'accept':
        proposalText = "That sounds like a fair deal! I accept your proposal.";
        break;
    }

    const proposalMessage: Message = {
      id: messages.length + 1,
      text: proposalText,
      sender: 'user',
      timestamp: new Date(),
      type: type
    };

    setMessages(prev => [...prev, proposalMessage]);

    if (type === 'accept') {
      setTimeout(() => {
        router.push('/deal-done');
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <Link href="/matches">
            <Button className="bg-green-600 hover:bg-green-700">
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/matches" className="inline-flex items-center text-green-600 hover:text-green-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Negotiate Trade</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Item Details - Fixed Height */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-semibold text-green-600 text-lg">${item.value}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Category:</span>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Condition:</span>
                      <Badge variant="outline" className="capitalize">{item.condition}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">{item.owner}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-sm text-gray-600">{item.location}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCalculator(!showCalculator)}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Value Calculator
                  </Button>
                  
                  {showCalculator && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-green-800">Trade Value Tips:</h4>
                      <div className="space-y-2 text-sm text-green-700">
                        <p>• Items within 10% value difference trade easily</p>
                        <p>• Consider adding cash: ${Math.round(item.value * 0.1)}</p>
                        <p>• Bundle with accessories to increase value</p>
                        <p>• Factor in condition and demand</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => makeProposal('propose')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Make Proposal
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      onClick={() => makeProposal('counter')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Counter Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface - Full Height */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b bg-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {item.owner.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Chat with {item.owner}</div>
                    <div className="text-sm text-gray-500 font-normal">Usually responds within minutes</div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={message.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}>
                            {message.sender === 'user' ? 'Y' : item.owner.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {message.type === 'proposal' && (
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span className="text-sm font-semibold">Trade Proposal</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {item.owner.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                            <span className="text-sm text-gray-600">{item.owner.split(' ')[0]} is typing...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                  <div className="flex space-x-2 mb-3">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="bg-green-600 hover:bg-green-700 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => makeProposal('accept')}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept Deal
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => makeProposal('counter')}
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Counter Offer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}