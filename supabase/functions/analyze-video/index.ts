import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, mimeType, fileName } = await req.json();
    
    if (!audioData) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'No video/audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ status: 'error', message: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing video file:', fileName || 'unknown', 'MIME:', mimeType);

    // Step 1: Extract and transcribe audio from video using AI
    const transcriptionPrompt = `You are a speech-to-text transcription expert. Listen to the audio track of this video and transcribe all spoken words accurately.

IMPORTANT: 
- Only transcribe the spoken words
- Do NOT describe what you see in the video
- Do NOT analyze facial expressions or body language
- Only return what was actually SAID

Return ONLY a JSON object with this structure:
{
  "transcription": "the exact words spoken in the video"
}

If there is no speech or the audio is unclear, return:
{
  "transcription": ""
}`;

    const transcriptionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: transcriptionPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Please transcribe ONLY the speech in this video (ignore visual elements):' },
              { 
                type: 'input_audio', 
                input_audio: { 
                  data: audioData, 
                  format: 'mp3'
                } 
              }
            ]
          }
        ],
      }),
    });

    if (!transcriptionResponse.ok) {
      if (transcriptionResponse.status === 429) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (transcriptionResponse.status === 402) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await transcriptionResponse.text();
      console.error('Transcription error:', transcriptionResponse.status, errorText);
      return new Response(
        JSON.stringify({ status: 'error', message: 'Failed to transcribe video audio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcriptionContent = transcriptionResult.choices?.[0]?.message?.content || '';
    
    console.log('Transcription result:', transcriptionContent);

    // Parse transcription
    let transcription = '';
    try {
      const jsonMatch = transcriptionContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        transcription = parsed.transcription || '';
      } else {
        transcription = transcriptionContent.trim();
      }
    } catch (e) {
      transcription = transcriptionContent.trim();
    }

    // Validate transcription - MUST have at least 2 meaningful words
    const words = transcription.split(/\s+/).filter(w => w.length > 1);
    if (!transcription || words.length < 2) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Could not transcribe video audio. Please ensure the video contains clear speech.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transcription:', transcription);

    // Step 2: Analyze sentiment of the transcribed text ONLY
    const sentimentPrompt = `You are a sentiment analysis expert. Analyze ONLY the given TEXT and return emotion scores.

CRITICAL: Base your analysis ONLY on the words provided. Do NOT consider tone of voice, facial expressions, or any visual elements.

Respond with ONLY this JSON structure, no other text:
{
  "emotions": {
    "Happy": <0-100>,
    "Sad": <0-100>,
    "Anger": <0-100>,
    "Fear": <0-100>,
    "Surprise": <0-100>,
    "Neutral": <0-100>
  },
  "keyThemes": ["theme1", "theme2", "theme3"]
}

The emotion scores must sum to approximately 100.`;

    const sentimentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: sentimentPrompt },
          { role: 'user', content: `Analyze the sentiment of this transcribed speech (text only, ignore any context about video): "${transcription}"` }
        ],
      }),
    });

    if (!sentimentResponse.ok) {
      const errorText = await sentimentResponse.text();
      console.error('Sentiment analysis error:', sentimentResponse.status, errorText);
      return new Response(
        JSON.stringify({ status: 'error', message: 'Failed to analyze sentiment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sentimentResult = await sentimentResponse.json();
    const sentimentContent = sentimentResult.choices?.[0]?.message?.content;

    if (!sentimentContent) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Failed to get sentiment analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sentiment result:', sentimentContent);

    // Parse sentiment analysis
    let analysisResult;
    try {
      const jsonMatch = sentimentContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in sentiment response');
      }
    } catch (parseError) {
      console.error('Failed to parse sentiment:', parseError);
      return new Response(
        JSON.stringify({ status: 'error', message: 'Failed to parse sentiment analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!analysisResult.emotions) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid analysis result structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'analyzed',
        transcription: transcription,
        emotions: analysisResult.emotions,
        keyThemes: analysisResult.keyThemes || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
