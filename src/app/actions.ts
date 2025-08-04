'use server';

import { suggestRecipesFromInput, type SuggestRecipesOutput } from '@/ai/flows/suggest-recipes-from-input';
import { mapIngredientsToWalmartProducts } from '@/ai/flows/map-ingredients-to-walmart-products';
import { estimatePriceAndAdjustBudget } from '@/ai/flows/estimate-price-and-adjust-budget';
import { transcribeSpeechToText } from '@/ai/flows/transcribe-speech-to-text';
import type { ShoppingListItem } from '@/lib/types';

// Simple in-memory cache
const recipeCache = new Map<string, SuggestRecipesOutput>();

export async function handleSuggestRecipes(
  userInput: string,
  numberOfPeople: number,
  budget: number
) {
  const cacheKey = JSON.stringify({ userInput, numberOfPeople, budget });
  if (recipeCache.has(cacheKey)) {
    console.log('Returning cached recipes');
    return { data: recipeCache.get(cacheKey), error: null };
  }

  try {
    console.log('Fetching new recipes');
    const result = await suggestRecipesFromInput({ userInput, numberOfPeople, budget });
    recipeCache.set(cacheKey, result);
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to suggest recipes.' };
  }
}

export async function handleGetShoppingList(ingredients: string[], budget: number) {
    try {
        console.log('Mapping ingredients to Walmart products');
        const productMappingResult = await mapIngredientsToWalmartProducts({ ingredients });

        const shoppingList: ShoppingListItem[] = productMappingResult.products.map(p => ({
            productName: p.name,
            price: p.price,
        }));
        
        console.log('Estimating prices and adjusting budget');
        const finalResult = await estimatePriceAndAdjustBudget({ shoppingList, budget });

        return { data: finalResult, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Failed to create shopping list.' };
    }
}


export async function handleTranscription(audioDataUri: string) {
  try {
    const result = await transcribeSpeechToText({ audioDataUri });
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Failed to transcribe audio.' };
  }
}
