import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { images } = body as { images: Array<{ imageBase64: string; mediaType: string }> }

  if (!images?.length) {
    throw createError({ statusCode: 400, statusMessage: 'At least one image is required' })
  }

  const config = useRuntimeConfig()
  if (!config.anthropicApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'ANTHROPIC_API_KEY is not configured' })
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          ...images.map(img => ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: img.imageBase64,
            },
          })),
          {
            type: 'text',
            text: `Please extract the recipe from ${images.length > 1 ? 'these images (front and back of a recipe card)' : 'this image'} and return it as a JSON object with exactly these fields:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences, or empty string if none)",
  "prepTime": "e.g. 20 minutes (or empty string if not specified)",
  "cookTime": "e.g. 45 minutes (or empty string if not specified)",
  "servings": "e.g. 8 servings (or empty string if not specified)",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["Step 1 text", "Step 2 text", ...],
  "notes": "Any tips, variations, or additional notes (or empty string if none)"
}

Rules:
- Each instruction should be a complete sentence describing one step
- Each ingredient should include quantity, unit, and item (e.g. "2 cups all-purpose flour")
- Return ONLY the JSON object, no other text`,
          },
        ],
      },
    ],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    const recipe = JSON.parse(jsonText)
    return recipe
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Failed to parse recipe from image' })
  }
})
