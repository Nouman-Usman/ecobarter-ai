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
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured, using fallback responses');
      return getFallbackResponse(userMessage, itemContext);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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

// New function to analyze image and extract item details
export async function analyzeImageAndExtractDetails(imageFile) {
  try {
    // Check if API key is available
    console.log('Starting image analysis...');
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured, using fallback image analysis');
      return getFallbackImageAnalysis();
    }

    // Validate image file
    if (!imageFile || !imageFile.type || !imageFile.type.startsWith('image/')) {
      console.error('Invalid image file provided');
      return getFallbackImageAnalysis();
    }

    // Check file size (limit to 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      console.error('Image file too large (>10MB)');
      return getFallbackImageAnalysis();
    }

    console.log('Converting image to base64...');
    const base64Image = await convertImageToBase64(imageFile);
    console.log('Image converted successfully, making API call...');

    // List of vision models to try, in order of preference
    const visionModels = [
      'meta-llama/llama-4-scout-17b-16e-instruct', // Llama 4 Scout with multimodal capabilities
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20240620',
      'claude-3-haiku-20240307'
    ];
    
    let response = null;
    let usedModel = null;
    
    // Try each model in sequence until one works
    for (const model of visionModels) {
      try {
        console.log(`Trying vision model: ${model}`);
        
        const requestBody = {
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are an expert item appraiser and cataloger for EcoBarter AI. Analyze the provided image and extract detailed information about the item.

              Available categories: Electronics, Musical Instruments, Kitchen, Books, Clothing, Sports, Tools, Art & Crafts, Home & Garden, Toys & Games

              Available conditions: excellent (like new), good (minor wear), fair (some wear), poor (functional but worn)

              Respond with a valid JSON object containing:
              {
                "title": "Specific item name (e.g., 'Vintage Acoustic Guitar', 'iPhone 12 Pro')",
                "description": "Detailed description highlighting key features, brand, model, and visible condition",
                "category": "One of the available categories",
                "condition": "One of the available conditions based on visible wear",
                "value": "Estimated market value in USD (number only)",
                "confidence": "Confidence level (1-100) in the analysis"
              }

              Be specific with titles and descriptions. Include brand names if visible. Base value estimates on current market prices for similar items in the observed condition.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this image and provide detailed item information in the specified JSON format.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageFile.type};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        };

        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        // If successful, break out of the loop
        if (response.ok) {
          usedModel = model;
          console.log(`Successfully used model: ${usedModel}`);
          break;
        } else {
          const errorText = await response.text();
          console.warn(`Model ${model} failed with status ${response.status}: ${errorText}`);
          // Continue to next model
        }
      } catch (modelError) {
        console.warn(`Error with model ${model}:`, modelError);
        // Continue to next model
      }
    }

    // If all models failed
    if (!response || !response.ok) {
      console.error('All vision models failed, using enhanced fallback analysis');
      return getEnhancedFallbackAnalysis(imageFile);
    }

    const data = await response.json();
    console.log(`Vision API (${usedModel}) response received:`, data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Vision API response structure:', data);
      throw new Error('Invalid Vision API response format');
    }

    try {
      const content = data.choices[0].message.content.trim();
      console.log('API response content:', content);
      
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in API response');
        throw new Error('No JSON found in response');
      }
      
      const extractedData = JSON.parse(jsonMatch[0]);
      console.log('Extracted data:', extractedData);
      
      // Validate required fields
      if (!extractedData.title || !extractedData.category || !extractedData.condition || !extractedData.value) {
        console.error('Missing required fields in extracted data:', extractedData);
        throw new Error('Missing required fields in extracted data');
      }
      
      const result = {
        title: extractedData.title,
        description: extractedData.description || '',
        category: extractedData.category,
        condition: extractedData.condition,
        value: parseFloat(extractedData.value) || 0,
        confidence: extractedData.confidence || 85,
        analyzedBy: usedModel // Add information about which model was used
      };
      
      console.log('Successfully analyzed image:', result);
      return result;
      
    } catch (parseError) {
      console.error('Error parsing Vision API JSON response:', parseError);
      console.error('Raw response content:', data.choices[0].message.content);
      return getEnhancedFallbackAnalysis(imageFile);
    }
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback with error information
    return {
      ...getFallbackImageAnalysis(),
      error: error.message || 'Unknown error occurred during image analysis'
    };
  }
}

// Enhanced fallback function that analyzes filename and provides better suggestions
function getEnhancedFallbackAnalysis(imageFile) {
  const filename = imageFile.name.toLowerCase();
  
  // Analyze filename for clues about the item
  const categoryKeywords = {
    'Electronics': ['phone', 'laptop', 'computer', 'tablet', 'camera', 'headphones', 'speaker', 'tv', 'monitor', 'iphone', 'android', 'samsung', 'apple', 'sony', 'canon', 'nikon'],
    'Musical Instruments': ['guitar', 'piano', 'violin', 'drum', 'bass', 'trumpet', 'saxophone', 'flute', 'keyboard', 'acoustic', 'electric'],
    'Kitchen': ['coffee', 'blender', 'toaster', 'microwave', 'oven', 'pot', 'pan', 'knife', 'mixer', 'kettle', 'cuisinart', 'kitchenaid'],
    'Sports': ['bike', 'bicycle', 'ball', 'gym', 'fitness', 'tennis', 'soccer', 'basketball', 'football', 'golf', 'running', 'shoes', 'nike', 'adidas'],
    'Home & Garden': ['chair', 'table', 'lamp', 'sofa', 'bed', 'desk', 'plant', 'vase', 'mirror', 'shelf', 'ikea', 'furniture'],
    'Art & Crafts': ['paint', 'brush', 'canvas', 'easel', 'pencil', 'marker', 'craft', 'art', 'drawing', 'sketch'],
    'Books': ['book', 'novel', 'textbook', 'magazine', 'journal', 'diary', 'guide', 'manual'],
    'Clothing': ['shirt', 'pants', 'dress', 'jacket', 'shoes', 'hat', 'bag', 'purse', 'belt', 'watch'],
    'Tools': ['hammer', 'drill', 'saw', 'wrench', 'screwdriver', 'toolbox', 'dewalt', 'craftsman'],
    'Toys & Games': ['toy', 'game', 'puzzle', 'doll', 'action', 'board', 'card', 'lego', 'nintendo', 'playstation']
  };

  // Find matching category based on filename
  let detectedCategory = 'Electronics'; // default
  let detectedTitle = 'Unknown Item';
  let estimatedValue = 100; // default

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (filename.includes(keyword)) {
        detectedCategory = category;
        detectedTitle = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        
        // Estimate value based on category and keyword
        const valueEstimates = {
          'Electronics': { phone: 300, laptop: 500, computer: 400, tablet: 200, camera: 350, headphones: 150, speaker: 100, tv: 300, monitor: 200 },
          'Musical Instruments': { guitar: 300, piano: 800, violin: 400, drum: 250, bass: 350, trumpet: 200, keyboard: 300 },
          'Kitchen': { coffee: 80, blender: 60, toaster: 40, microwave: 120, oven: 200, mixer: 150, kettle: 50 },
          'Sports': { bike: 400, bicycle: 400, ball: 25, gym: 200, fitness: 150, tennis: 100, shoes: 80 },
          'Home & Garden': { chair: 150, table: 200, lamp: 80, sofa: 400, bed: 300, desk: 180, plant: 30 },
          'Art & Crafts': { paint: 50, brush: 20, canvas: 40, easel: 100, pencil: 15, craft: 60 },
          'Books': { book: 15, novel: 12, textbook: 80, magazine: 5, journal: 25, guide: 20 },
          'Clothing': { shirt: 25, pants: 35, dress: 45, jacket: 60, shoes: 70, hat: 20, bag: 50, watch: 150 },
          'Tools': { hammer: 30, drill: 80, saw: 60, wrench: 20, screwdriver: 15, toolbox: 100 },
          'Toys & Games': { toy: 25, game: 40, puzzle: 20, doll: 30, board: 35, lego: 50 }
        };

        estimatedValue = valueEstimates[category]?.[keyword] || 100;
        break;
      }
    }
    if (detectedTitle !== 'Unknown Item') break;
  }

  // Generate more specific title based on detected keywords
  if (detectedTitle !== 'Unknown Item') {
    const brandKeywords = ['apple', 'samsung', 'sony', 'canon', 'nikon', 'nike', 'adidas', 'ikea', 'kitchenaid', 'dewalt', 'nintendo'];
    const conditionKeywords = ['new', 'mint', 'excellent', 'good', 'used', 'vintage', 'refurbished'];
    
    let brandFound = '';
    let conditionFound = 'good';
    
    for (const brand of brandKeywords) {
      if (filename.includes(brand)) {
        brandFound = brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
    
    for (const condition of conditionKeywords) {
      if (filename.includes(condition)) {
        conditionFound = condition === 'new' || condition === 'mint' ? 'excellent' : 
                        condition === 'used' ? 'good' : condition;
        break;
      }
    }
    
    detectedTitle = brandFound ? `${brandFound} ${detectedTitle}` : detectedTitle;
    
    // Adjust value based on condition
    if (conditionFound === 'excellent') estimatedValue *= 1.2;
    else if (conditionFound === 'fair') estimatedValue *= 0.8;
    else if (conditionFound === 'poor') estimatedValue *= 0.6;
  }

  const result = {
    title: detectedTitle,
    description: `${detectedTitle} uploaded via image. Please add more details about condition, features, and specifications.`,
    category: detectedCategory,
    condition: 'good',
    value: Math.round(estimatedValue),
    confidence: 65,
    note: 'Analysis based on filename. Please verify and update details as needed.'
  };

  console.log('Enhanced fallback analysis result:', result);
  return result;
}

// Fallback function when API is not available
function getFallbackImageAnalysis() {
  const fallbackItems = [
    { title: 'Smartphone', category: 'Electronics', value: 250, description: 'Mobile phone device' },
    { title: 'Acoustic Guitar', category: 'Musical Instruments', value: 300, description: 'String musical instrument' },
    { title: 'Coffee Maker', category: 'Kitchen', value: 150, description: 'Coffee brewing appliance' },
    { title: 'Novel Book', category: 'Books', value: 15, description: 'Fiction book' },
    { title: 'Running Shoes', category: 'Sports', value: 80, description: 'Athletic footwear' },
    { title: 'Desk Lamp', category: 'Home & Garden', value: 45, description: 'Lighting fixture' },
    { title: 'Art Supplies', category: 'Art & Crafts', value: 60, description: 'Creative materials' },
    { title: 'Board Game', category: 'Toys & Games', value: 30, description: 'Entertainment game' }
  ];
  
  const randomItem = fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
  
  return {
    title: randomItem.title,
    description: 'Please add a detailed description for this item including brand, model, and condition.',
    category: randomItem.category,
    condition: 'good',
    value: randomItem.value,
    confidence: 50,
    note: 'Random suggestion. Please update with actual item details.'
  };
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
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      return getDefaultDescription(itemTitle, category);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      return getDefaultTradeAdvice(userItem, targetItem);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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

// Helper function to convert image file to base64
function convertImageToBase64(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Extract the base64 string from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } catch (error) {
        console.error('Error processing image data:', error);
        reject(new Error('Failed to convert image to base64 format'));
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Error reading image file'));
    };
    reader.readAsDataURL(imageFile);
  });
}