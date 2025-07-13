export const dynamic = 'force-dynamic';

import { generateResponse } from '@/lib/aiLogic';

export async function POST(request) {
  try {
    const { message, itemContext } = await request.json();
    
    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await generateResponse(message, itemContext);
    
    return Response.json({ 
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}