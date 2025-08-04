'use server';
/**
 * @fileOverview Estimates the price of missing products in Walmart, uses 2025 prices as a reference,
 * and suggests final price adjustment if the shopping list exceeds the budget.
 *
 * - estimatePriceAndAdjustBudget - A function that estimates prices and adjusts the budget.
 * - EstimatePriceAndAdjustBudgetInput - The input type for the estimatePriceAndAdjustBudget function.
 * - EstimatePriceAndAdjustBudgetOutput - The return type for the estimatePriceAndAdjustBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatePriceAndAdjustBudgetInputSchema = z.object({
  shoppingList: z.array(
    z.object({
      productName: z.string().describe('The name of the product.'),
      price: z.number().optional().describe('The price of the product if available, otherwise absent.'),
    })
  ).describe('The list of products in the shopping list.'),
  budget: z.number().describe('The budget for the shopping list.'),
});

export type EstimatePriceAndAdjustBudgetInput = z.infer<typeof EstimatePriceAndAdjustBudgetInputSchema>;

const EstimatePriceAndAdjustBudgetOutputSchema = z.object({
  estimatedShoppingList: z.array(
    z.object({
      productName: z.string().describe('The name of the product.'),
      price: z.number().describe('The estimated or actual price of the product.'),
      priceSource: z.string().describe('Where the price was sourced from (Walmart or 2025 estimate).'),
    })
  ).describe('The shopping list with estimated prices for missing products.'),
  totalEstimatedCost: z.number().describe('The total estimated cost of the shopping list.'),
  budgetAdherence: z.string().describe('Whether the shopping list fits within the budget, or suggestions for adjustment.'),
});

export type EstimatePriceAndAdjustBudgetOutput = z.infer<typeof EstimatePriceAndAdjustBudgetOutputSchema>;

export async function estimatePriceAndAdjustBudget(input: EstimatePriceAndAdjustBudgetInput): Promise<EstimatePriceAndAdjustBudgetOutput> {
  return estimatePriceAndAdjustBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePriceAndAdjustBudgetPrompt',
  input: {schema: EstimatePriceAndAdjustBudgetInputSchema},
  output: {schema: EstimatePriceAndAdjustBudgetOutputSchema},
  prompt: `You are an AI assistant specializing in estimating grocery prices and adjusting budgets.

  You will receive a shopping list with product names and their prices, if available. For any products where the price is not available, you will estimate the price based on 2025 prices.

  After estimating the missing prices, you will calculate the total estimated cost of the shopping list.  Finally, determine whether the shopping list fits within the given budget. If the total cost exceeds the budget, provide suggestions on how to adjust the list (e.g., remove an item, choose a cheaper alternative).

  Shopping List:
  {{#each shoppingList}}
  - Product: {{productName}}, Price: \${{price}}
  {{/each}}

  Budget: \${{budget}}

  Output the estimated shopping list with prices, the source of the price (Walmart or 2025 estimate), the total estimated cost, and whether the list adheres to the budget, alongside any suggestions on what to remove.`,
});

const estimatePriceAndAdjustBudgetFlow = ai.defineFlow(
  {
    name: 'estimatePriceAndAdjustBudgetFlow',
    inputSchema: EstimatePriceAndAdjustBudgetInputSchema,
    outputSchema: EstimatePriceAndAdjustBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
