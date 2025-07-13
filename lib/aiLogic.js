// AI Logic for EcoBarter AI Platform using OpenRouter API

export function matchItems(userItem) {
  // Simulated AI matching algorithm
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

  // Calculate compatibility scores based on value similarity and category preferences
  const matches = allItems.map(item => {
    let score = 70; // Base score

    // Value similarity (higher score for similar values)
    const valueDiff = Math.abs(item.value - userItem.value);
    const valueScore = Math.max(0, 30 - (valueDiff / userItem.value) * 30);
    score += valueScore;

    // Category preference (bonus for complementary categories)
    const categoryBonus = getCategoryBonus(userItem.category, item.category);
    score += categoryBonus;

    // Condition bonus
    if (item.condition === 'excellent') score += 5;

    return {
      ...item,
      compatibility: Math.min(98, Math.round(score))
    };
  });

  // Sort by compatibility score
  return matches.sort((a, b) => b.compatibility - a.compatibility);
}

export async function generateResponse(userMessage, itemContext) {
  try {
    // Check if API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured, using fallback responses');
      return getFallbackResponse(userMessage, itemContext);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a friendly and helpful bartering assistant for EcoBarter AI, a sustainable trading platform. 
            
            Current item context: ${itemContext?.title} (Value: $${itemContext?.value}, Category: ${itemContext?.category}, Condition: ${itemContext?.condition})
            
            Your role:
            - Help users negotiate fair and mutually beneficial trades
            - Be encouraging and positive about sustainable bartering
            - Suggest reasonable counter-offers based on item values
            - Keep responses conversational and under 100 words
            - Focus on finding win-win solutions
            - Consider environmental benefits of reusing items
            - Be knowledgeable about item values and market trends
            
            Guidelines:
            - Always be friendly and professional
            - Ask clarifying questions when needed
            - Suggest creative trade combinations
            - Mention sustainability benefits when appropriate
            - Help bridge value gaps with add-ons or cash adjustments`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return getFallbackResponse(userMessage, itemContext);
  }
}

function getFallbackResponse(userMessage, itemContext) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Contextual responses based on message content
  if (lowerMessage.includes('trade') || lowerMessage.includes('swap') || lowerMessage.includes('exchange')) {
    return `That sounds like a great trade opportunity! I'd love to learn more about what you're offering for my ${itemContext?.title}. What items do you have available for trade?`;
  }
  
  if (lowerMessage.includes('value') || lowerMessage.includes('price') || lowerMessage.includes('worth') || lowerMessage.includes('cost')) {
    return `My ${itemContext?.title} is valued at $${itemContext?.value}. What's the estimated value of your item? I'm open to discussing trades with similar values or adding something to balance the difference.`;
  }
  
  if (lowerMessage.includes('condition') || lowerMessage.includes('quality') || lowerMessage.includes('state')) {
    return `The ${itemContext?.title} is in ${itemContext?.condition} condition. I can provide more detailed photos if you'd like to see specific aspects. What's the condition of your item?`;
  }
  
  if (lowerMessage.includes('negotiate') || lowerMessage.includes('offer') || lowerMessage.includes('deal')) {
    return `I'm definitely open to negotiating! Let's work together to find a fair trade that benefits both of us. What are you thinking in terms of the trade structure?`;
  }
  
  if (lowerMessage.includes('cash') || lowerMessage.includes('money') || lowerMessage.includes('add')) {
    const suggestedAmount = Math.round(itemContext?.value * 0.1) || 50;
    return `Adding some cash to balance the trade values is totally reasonable! Based on the values, maybe around $${suggestedAmount} could work? What do you think?`;
  }
  
  if (lowerMessage.includes('accept') || lowerMessage.includes('agree') || lowerMessage.includes('yes')) {
    return `Fantastic! I'm excited about this trade. Let's finalize the details and arrange a safe meeting location for the exchange. This is going to be great for both of us!`;
  }
  
  if (lowerMessage.includes('decline') || lowerMessage.includes('no') || lowerMessage.includes('not interested')) {
    return `No worries at all! Thanks for considering the trade. Feel free to reach out if you change your mind or if you have other items you'd like to discuss. Happy bartering!`;
  }
  
  // Default friendly response
  return `Thanks for your message! I'm interested in discussing this trade further. Could you tell me more about what you're offering for my ${itemContext?.title}? I'm looking for fair trades that work well for both of us.`;
}

export async function generateItemDescription(itemTitle, category) {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return getDefaultDescription(itemTitle, category);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing compelling, accurate descriptions for items being traded on a bartering platform. Write descriptions that highlight key features, condition, and appeal to potential traders.'
          },
          {
            role: 'user',
            content: `Write a brief, appealing description for a ${itemTitle} in the ${category} category. Keep it under 50 words and focus on key features that would interest someone looking to trade.`
          }
        ],
        max_tokens: 80,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('Error generating description:', error);
  }
  
  return getDefaultDescription(itemTitle, category);
}

function getDefaultDescription(itemTitle, category) {
  const descriptions = {
    'Electronics': `High-quality ${itemTitle} in excellent working condition. Perfect for tech enthusiasts looking for reliable equipment.`,
    'Musical Instruments': `Beautiful ${itemTitle} with rich sound quality. Ideal for musicians of all skill levels.`,
    'Kitchen': `Premium ${itemTitle} that makes cooking a joy. Great for food lovers and home chefs.`,
    'Sports': `Professional-grade ${itemTitle} perfect for active individuals. Well-maintained and ready for action.`,
    'Home & Garden': `Stylish ${itemTitle} that enhances any living space. Functional and aesthetically pleasing.`,
    'Art & Crafts': `Creative ${itemTitle} perfect for artistic projects. High-quality materials for best results.`
  };
  
  return descriptions[category] || `Quality ${itemTitle} in great condition, perfect for trade.`;
}

export function calculateAddOns(itemValue) {
  // Suggest items to balance trade values
  const baseValue = itemValue || 100;
  
  const addOnSuggestions = [
    { 
      name: "Cash", 
      value: Math.round(baseValue * 0.1),
      description: "Small cash amount to balance values"
    },
    { 
      name: "Gift Card", 
      value: Math.round(baseValue * 0.15),
      description: "Popular retailer gift card"
    },
    { 
      name: "Small Electronics", 
      value: Math.round(baseValue * 0.2),
      description: "Phone accessories, cables, etc."
    },
    { 
      name: "Books/Media", 
      value: Math.round(baseValue * 0.05),
      description: "Books, DVDs, or games"
    },
    { 
      name: "Accessories", 
      value: Math.round(baseValue * 0.12),
      description: "Related accessories or tools"
    }
  ];

  return addOnSuggestions.slice(0, 3); // Return top 3 suggestions
}

export async function generateTradeAdvice(userItem, targetItem) {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return getDefaultTradeAdvice(userItem, targetItem);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a trading advisor for a bartering platform. Provide brief, practical advice for successful trades.'
          },
          {
            role: 'user',
            content: `Give trading advice for someone wanting to trade their ${userItem?.title} (value: $${userItem?.value}) for a ${targetItem?.title} (value: $${targetItem?.value}). Keep it under 60 words.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('Error generating trade advice:', error);
  }
  
  return getDefaultTradeAdvice(userItem, targetItem);
}

function getDefaultTradeAdvice(userItem, targetItem) {
  const valueDiff = Math.abs((userItem?.value || 0) - (targetItem?.value || 0));
  const higherValue = (userItem?.value || 0) > (targetItem?.value || 0) ? userItem : targetItem;
  
  if (valueDiff < 50) {
    return "Values are well-matched! This should be a straightforward trade. Focus on condition and timing.";
  } else if (valueDiff < 150) {
    return `Consider adding $${valueDiff} or a small item to balance the trade values fairly.`;
  } else {
    return `Significant value difference. The ${higherValue?.title} owner might need to add cash or additional items.`;
  }
}

function getCategoryBonus(userCategory, itemCategory) {
  // Define category compatibility matrix
  const compatibilityMatrix = {
    'Electronics': ['Electronics', 'Musical Instruments', 'Art & Crafts'],
    'Musical Instruments': ['Electronics', 'Musical Instruments', 'Art & Crafts'],
    'Kitchen': ['Kitchen', 'Home & Garden'],
    'Sports': ['Sports', 'Electronics'],
    'Home & Garden': ['Home & Garden', 'Kitchen', 'Art & Crafts'],
    'Art & Crafts': ['Art & Crafts', 'Musical Instruments', 'Electronics']
  };

  const compatible = compatibilityMatrix[userCategory] || [];
  return compatible.includes(itemCategory) ? 10 : 0;
}