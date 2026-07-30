/**
 * Cloudflare Pages Function: POST /api/ai
 * Backend proxy for AI API integration (OpenRouter + Gemini with Fallback).
 */

async function callOpenRouter(requestBody, env) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY environment variable is not configured.");
  
  const payload = {
    model: requestBody.model || 'meta-llama/llama-3.1-8b-instruct:free',
    messages: requestBody.messages || [
      {
        role: 'user',
        content: requestBody.prompt || 'Hello',
      },
    ],
    temperature: requestBody.temperature ?? 0.7,
    max_tokens: requestBody.max_tokens ?? 1024,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://hicm-portal.pages.dev',
      'X-Title': 'HICM Portal',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`OpenRouter error: ${JSON.stringify(data)}`);
  return data;
}

async function callGemini(requestBody, env) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not configured.");
  
  const messages = requestBody.messages || [{ role: 'user', content: requestBody.prompt || 'Hello' }];
  let systemInstruction = null;
  let contents = [];
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = { parts: [{ text: msg.content }] };
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: requestBody.temperature ?? 0.7,
      maxOutputTokens: requestBody.max_tokens ?? 1024,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = systemInstruction;
  }
  
  if (systemInstruction?.parts[0]?.text?.includes('JSON')) {
      payload.generationConfig.responseMimeType = "application/json";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini error: ${JSON.stringify(data)}`);
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Map back to OpenAI format
  return {
    choices: [
      {
        message: {
          content: text
        }
      }
    ]
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const requestBody = await request.json();
    const provider = requestBody.provider || 'auto';
    let data;

    if (provider === 'gemini') {
      data = await callGemini(requestBody, env);
    } else if (provider === 'openrouter') {
      data = await callOpenRouter(requestBody, env);
    } else {
      // Auto
      try {
        data = await callOpenRouter(requestBody, env);
      } catch (err) {
        console.warn("OpenRouter failed, falling back to Gemini", err);
        data = await callGemini(requestBody, env);
      }
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: err.message || String(err),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions(context);
  }
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Only POST is supported.' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
