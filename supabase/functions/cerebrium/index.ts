// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'test': 'testing'
}

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { prompt } = await req.json()
  const result = await fetch("<CEREBRIUM_ENDPOINT>", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: prompt,
        "hf_token": "<HF_TOKEN>",
        "model_id": "<HF_MODEL_ID>",
        "webhook_endpoint": "<SUPABASE_IMAGE_WEEKBOOK_URL>",
        "num_images_per_prompt": 3})
    })

  return new Response(
    JSON.stringify({"message": "Success"}),
    { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } },
  )
})

