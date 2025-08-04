import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes-from-input';
import type { EstimatePriceAndAdjustBudgetOutput } from '@/ai/flows/estimate-price-and-adjust-budget';

export type Recipe = SuggestRecipesOutput['recipes'][0];
export type SuggestedRecipes = SuggestRecipesOutput;

export type FinalShoppingList = EstimatePriceAndAdjustBudgetOutput;
export type EstimatedProduct = EstimatePriceAndAdjustBudgetOutput['estimatedShoppingList'][0];

export type ShoppingListItem = {
    productName: string;
    price?: number;
}
