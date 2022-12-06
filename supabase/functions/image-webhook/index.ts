// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { decode }  from "https://esm.sh/base64-arraybuffer@1.0.2?target=deno&deno-std=0.132.0";

serve(async (req: Request) => {

  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    { 
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      db: {
        schema: 'public',
      }
    },
    
  )

  const { images } = await req.json()
  if (!images) { 
    console.log("No images returned"); 
    return new Response(
      JSON.stringify({"message": "No images returned"}),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    var filePaths: string[] = []
    for (const image of images) {
      const uuid = Math.floor(Math.random() * 1000000)
      const filePath = `processed/${uuid}.png`
      filePaths.push(filePath)

      let { error: uploadError } = await supabaseClient.storage
        .from('images')
        .upload(filePath, decode(image), {
          contentType: 'image/png'
        })

      if (uploadError) {
        throw uploadError
      }

      const { error: insertError } = await supabaseClient.from('filePaths')
        .insert({ filePath: filePath  }).single()

      if (insertError) {
        throw insertError
      }                       
      
    }
    
  } catch (error) {
    console.log('Error uploading images!')
    console.log(error)
    return new Response(
      JSON.stringify({"message": "Error uploading images"}),
      { status: 500,
        headers: { "Content-Type": "application/json" } },
    )
  }
  return new Response(
    JSON.stringify({"message": "Success"}),
    { headers: { "Content-Type": "application/json" } },
  )

})