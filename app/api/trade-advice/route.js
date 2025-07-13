export const dynamic = 'force-dynamic';

import { generateTradeAdvice } from '@/lib/aiLogic';

export async function POST(request) {
  try {
    const { userItem, targetItem } = await request.json();
    
    if (!userItem || !targetItem) {
      return Response.json(
        { error: 'Both userItem and targetItem are required' },
        { status: 400 }
      );
    }

    const advice = await generateTradeAdvice(userItem, targetItem);
    
    return Response.json({ 
      advice,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to generate trade advice' },
      { status: 500 }
    );
  }
}