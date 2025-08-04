'use server';

/**
 * @fileOverview Maps ingredients to Walmart products using the SerpAPI.
 *
 * - mapIngredientsToWalmartProducts - A function that handles the mapping of ingredients to Walmart products.
 * - MapIngredientsToWalmartProductsInput - The input type for the mapIngredientsToWalmartProducts function.
 * - MapIngredientsToWalmartProductsOutput - The return type for the mapIngredientsToWalmartProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapIngredientsToWalmartProductsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('An array of ingredients to map to Walmart products.'),
});
export type MapIngredientsToWalmartProductsInput = z.infer<typeof MapIngredientsToWalmartProductsInputSchema>;

const MapIngredientsToWalmartProductsOutputSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      price: z.number().describe('The price of the product.'),
      imageUrl: z.string().describe('The URL of the product image.'),
      productUrl: z.string().describe('The URL of the product page.'),
    })
  ).describe('An array of products found at Walmart.'),
});
export type MapIngredientsToWalmartProductsOutput = z.infer<typeof MapIngredientsToWalmartProductsOutputSchema>;

export async function mapIngredientsToWalmartProducts(input: MapIngredientsToWalmartProductsInput): Promise<MapIngredientsToWalmartProductsOutput> {
  return mapIngredientsToWalmartProductsFlow(input);
}

const getWalmartProducts = ai.defineTool({
  name: 'getWalmartProducts',
  description: 'Retrieves products from Walmart based on a search query for one or more ingredients.',
  inputSchema: z.object({
    queries: z.array(z.string()).describe('The search queries to use to find products.'),
  }),
  outputSchema: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      price: z.number().describe('The price of the product.'),
      imageUrl: z.string().describe('The URL of the product image.'),
      productUrl: z.string().describe('The URL of the product page.'),
    })
  ),
}, async (input) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error('SerpAPI API key is not set.');
  }

  const allProducts: any[] = [];
  for (const query of input.queries) {
    const response = await fetch(`https://serpapi.com/search.json?engine=walmart&query=${encodeURIComponent(query)}&api_key=${apiKey}`);
    const data = await response.json();

    if (data.shopping_results) {
        const products = data.shopping_results.map((product: any) => ({
            name: product.title,
            price: parseFloat(product.price.replace('$', '')),
            imageUrl: product.thumbnail,
            productUrl: product.link,
          }));
      allProducts.push(...products);
    }
  }

  return allProducts;
});

const mapIngredientsToWalmartProductsPrompt = ai.definePrompt({
  name: 'mapIngredientsToWalmartProductsPrompt',
  input: {schema: MapIngredientsToWalmartProductsInputSchema},
  output: {schema: MapIngredientsToWalmartProductsOutputSchema},
  prompt: `You are an AI assistant that maps ingredients to products available at Walmart using the available tools. For each ingredient, find the best matching product.

  Map the following ingredients to products available at Walmart:

  {{#each ingredients}}
  - {{{this}}}
  {{/each}}
  `,
  tools: [getWalmartProducts],
});

const mapIngredientsToWalmartProductsFlow = ai.defineFlow(
  {
    name: 'mapIngredientsToWalmartProductsFlow',
    inputSchema: MapIngredientsToWalmartProductsInputSchema,
    outputSchema: MapIngredientsToWalmartProductsOutputSchema,
  },
  async input => {
    const result = await mapIngredientsToWalmartProductsPrompt(input);
    const products = result.output?.products || [];
    return { products };
  }
);
