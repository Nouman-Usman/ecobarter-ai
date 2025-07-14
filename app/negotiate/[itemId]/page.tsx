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
import { generateResponse } from '@/lib/aiLogic';
import { getItemById, Item } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

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
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItem();
  }, [params.itemId]);

  const loadItem = async () => {
    setItemLoading(true);
    const { data, error } = await getItemById(params.itemId as string);
    
    if (data && !error) {
      setItem(data);
    }
    
    setItemLoading(false);
  };

  useEffect(() => {
    if (!item) return;
    
    // Initialize conversation
    const initialMessage: Message = {
      id: 1,
      text: `Hi! I'm interested in trading for your ${item.title}. I have a few items that might interest you. What are you looking for in a trade?`,
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
    if (!user) {
      setShowAuthModal(true);
      return;
    }

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
      // Set a timeout to ensure we don't wait too long for a response
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Response timeout')), 10000)
      );
      
      // Race between the actual API call and the timeout
      const aiResponse = await Promise.race([
        generateResponse(messageToSend, item),
        timeoutPromise
      ]);

      console.log('AI Response:', aiResponse);
      
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
      // Use more specific contextual responses based on keywords
      const lowerMessage = messageToSend.toLowerCase();
      let fallbackText = "I'm having trouble connecting right now, but I'm definitely interested in discussing this trade!";
      
      if (lowerMessage.includes('trade') || lowerMessage.includes('swap') || lowerMessage.includes('exchange')) {
        fallbackText = `That sounds like a great trade opportunity! I'd love to learn more about what you're offering for my ${item?.title}. What items do you have available for trade?`;
      } 
      else if (lowerMessage.includes('value') || lowerMessage.includes('price') || lowerMessage.includes('worth') || lowerMessage.includes('cost')) {
        fallbackText = `My ${item?.title} is valued at $${item?.value}. What's the estimated value of your item? I'm open to discussing trades with similar values or adding something to balance the difference.`;
      } 
      else if (lowerMessage.includes('condition') || lowerMessage.includes('quality') || lowerMessage.includes('state')) {
        fallbackText = `The ${item?.title} is in ${item?.condition} condition. I can provide more detailed photos if you'd like to see specific aspects. What's the condition of your item?`;
      }
      else if (lowerMessage.includes('negotiate') || lowerMessage.includes('offer') || lowerMessage.includes('deal')) {
        fallbackText = `I'm definitely open to negotiating! Let's work together to find a fair trade that benefits both of us. What are you thinking in terms of the trade structure?`;
      }
      else if (lowerMessage.includes('cash') || lowerMessage.includes('money') || lowerMessage.includes('add')) {
        const suggestedAmount = Math.round(item?.value * 0.1) || 50;
        fallbackText = `Adding some cash to balance the trade values is totally reasonable! Based on the values, maybe around $${suggestedAmount} could work? What do you think?`;
      }
      else if (lowerMessage.includes('accept') || lowerMessage.includes('agree') || lowerMessage.includes('yes')) {
        fallbackText = `Fantastic! I'm excited about this trade. Let's finalize the details and arrange a safe meeting location for the exchange. This is going to be great for both of us!`;
      }
      else if (lowerMessage.includes('decline') || lowerMessage.includes('no') || lowerMessage.includes('not interested')) {
        fallbackText = `No worries at all! Thanks for considering the trade. Feel free to reach out if you change your mind or if you have other items you'd like to discuss. Happy bartering!`;
      }
      else if (lowerMessage.includes('meet') || lowerMessage.includes('location') || lowerMessage.includes('when')) {
        fallbackText = `I'm available to meet in a public place for safety. Would a local coffee shop work for you? I'm generally free on weekends or after 5pm on weekdays. What works best for your schedule?`;
      }
      
      const fallbackMessage: Message = {
        id: messages.length + 2,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date(),
        type: 'message'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const makeProposal = (type: 'propose' | 'counter' | 'accept') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    let proposalText = '';
    let messageType: Message['type'] = 'proposal';
    
    switch (type) {
      case 'propose':
        proposalText = `I'd like to propose a trade: my vintage laptop (worth $${item?.value}) for your ${item?.title}. What do you think?`;
        messageType = 'proposal';
        break;
      case 'counter':
        proposalText = `I appreciate your offer, but could we adjust the terms? How about adding a small cash amount to balance the values?`;
        messageType = 'counter';
        break;
      case 'accept':
        proposalText = "That sounds like a fair deal! I accept your proposal.";
        messageType = 'proposal';
        break;
    }

    const proposalMessage: Message = {
      id: messages.length + 1,
      text: proposalText,
      sender: 'user',
      timestamp: new Date(),
      type: messageType
    };

    setMessages(prev => [...prev, proposalMessage]);

    // Generate AI response to the proposal
    setLoading(true);
    setTimeout(async () => {
      try {
        // Prepare contextual response based on proposal type
        let responseText = '';
        if (type === 'propose') {
          responseText = await generateResponse(`I've received a proposal to trade your ${item?.title}. What do you think?`, item);
        } else if (type === 'counter') {
          responseText = await generateResponse(`I've received a counter offer regarding ${item?.title}. Let's discuss the details.`, item);
        } else if (type === 'accept') {
          responseText = "Great! I'm glad we could reach an agreement. Let's arrange the exchange details.";
        }
        
        const aiMessage: Message = {
          id: messages.length + 2,
          text: responseText,
          sender: 'ai',
          timestamp: new Date(),
          type: type === 'accept' ? 'proposal' : (type === 'counter' ? 'counter' : 'message')
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error generating response to proposal:', error);
        
        // Fallback responses based on proposal type
        let fallbackText = "Thanks for your proposal! Let me think about it.";
        
        if (type === 'propose') {
          fallbackText = `That's an interesting offer! Your ${item?.value} laptop for my ${item?.title}. Let me consider this. Do you have any photos of the laptop you could share?`;
        } else if (type === 'counter') {
          fallbackText = `I'm open to adjusting our trade terms. What amount were you thinking would make this fair?`;
        } else if (type === 'accept') {
          fallbackText = `Excellent! I'm looking forward to completing this trade. Should we meet at a public location? How about the coffee shop downtown this weekend?`;
        }
        
        const fallbackMessage: Message = {
          id: messages.length + 2,
          text: fallbackText,
          sender: 'ai',
          timestamp: new Date(),
          type: type === 'accept' ? 'proposal' : (type === 'counter' ? 'counter' : 'message')
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    if (type === 'accept') {
      setTimeout(() => {
        router.push('/deal-done');
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (user) {
        sendMessage();
      } else {
        setShowAuthModal(true);
      }
    }
  };

  if (itemLoading) {
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

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
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
    <>
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
                    src={item.images[0] || 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400'} 
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
                      <span className="font-medium">{item.profiles?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-sm text-gray-600">{item.profiles?.location || 'Not specified'}</span>
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
            <Card className=" flex flex-col"> {/* Increased height */}
              <CardHeader className="border-b bg-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {item.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">Chat with {item.profiles?.full_name || 'Owner'}</div>
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
                            {message.sender === 'user' ? 'Y' : item.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 shadow-sm ${
                            message.sender === 'user'
                              ? message.type === 'proposal' 
                                ? 'bg-blue-600 text-white' 
                                : message.type === 'counter'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-green-600 text-white'
                              : message.type === 'proposal'
                                ? 'bg-blue-50 text-gray-900 border border-blue-200'
                                : message.type === 'counter'
                                  ? 'bg-amber-50 text-gray-900 border border-amber-200'
                                  : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {message.type === 'proposal' && (
                            <div className="flex items-center mb-2">
                              <CheckCircle className={`w-4 h-4 mr-2 ${message.sender === 'user' ? 'text-white' : 'text-blue-600'}`} />
                              <span className={`text-sm font-semibold ${message.sender === 'user' ? 'text-white' : 'text-blue-600'}`}>Trade Proposal</span>
                            </div>
                          )}
                          {message.type === 'counter' && (
                            <div className="flex items-center mb-2">
                              <Clock className={`w-4 h-4 mr-2 ${message.sender === 'user' ? 'text-white' : 'text-amber-600'}`} />
                              <span className={`text-sm font-semibold ${message.sender === 'user' ? 'text-white' : 'text-amber-600'}`}>Counter Offer</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender === 'user' 
                              ? message.type === 'proposal' 
                                ? 'text-blue-100' 
                                : message.type === 'counter' 
                                  ? 'text-amber-100' 
                                  : 'text-green-100'
                            : 'text-gray-500'
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
                            {item.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                            <span className="text-sm text-gray-600">{item.profiles?.full_name?.split(' ')[0] || 'Owner'} is typing...</span>
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
                      disabled={!newMessage.trim() || loading || !user}
                      className="bg-green-600 hover:bg-green-700 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Quick Response Buttons - These provide fallbacks if AI is unavailable */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNewMessage(`What's the lowest value you'd accept for your ${item?.title}?`)}
                      className="text-xs bg-gray-50 hover:bg-gray-100"
                    >
                      Ask price
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNewMessage(`Would you consider a trade plus $${Math.round(item?.value * 0.1)} cash?`)}
                      className="text-xs bg-gray-50 hover:bg-gray-100"
                    >
                      Offer cash
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNewMessage("Can you tell me more about the condition?")}
                      className="text-xs bg-gray-50 hover:bg-gray-100"
                    >
                      Ask condition
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNewMessage("I'm interested! When and where can we meet?")}
                      className="text-xs bg-gray-50 hover:bg-gray-100"
                    >
                      Arrange meeting
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
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}