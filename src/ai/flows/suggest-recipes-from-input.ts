'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recipes based on user input, considering the number of people and budget.
 *
 * - suggestRecipesFromInput - A function that handles the recipe suggestion process.
 * - SuggestRecipesInput - The input type for the suggestRecipesFromInput function.
 * - SuggestRecipesOutput - The return type for the suggestRecipesFromInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input describing the desired meal or ingredients.'),
  numberOfPeople: z.number().describe('The number of people the meal should serve.'),
  budget: z.number().describe('The budget for the meal in US dollars.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The list of ingredients for the recipe.'),
      instructions: z.string().describe('The instructions for preparing the recipe.'),
      estimatedCost: z.number().describe('The estimated cost of the recipe.'),
      suitability: z
        .string()
        .describe(
          'An explanation of how well the recipe fits the user input, number of people, and budget.'
        ),
    })
  ).describe('A list of suggested recipes.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipesFromInput(
  input: SuggestRecipesInput
): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a recipe suggestion expert. Given the user input, number of people to serve, and budget, suggest recipes that would be suitable.

User Input: {{{userInput}}}
Number of People: {{{numberOfPeople}}}
Budget: {{{budget}}}

Consider the budget and number of people when suggesting recipes. If a specific cuisine is mentioned, prioritize recipes from that cuisine. If not, suggest a variety of options.

Format your response as a JSON object with a list of recipes. Each recipe should include the name, ingredients, instructions, estimated cost, and a brief explanation of its suitability for the user's needs.
`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
