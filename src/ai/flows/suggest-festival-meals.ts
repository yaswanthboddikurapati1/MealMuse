'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest dishes based on current festivals in the user's location.
 *
 * - suggestFestivalMeals - A function that suggests meals based on the user's location and current festivals.
 * - SuggestFestivalMealsInput - The input type for the suggestFestivalMeals function.
 * - SuggestFestivalMealsOutput - The return type for the suggestFestivalMeals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFestivalMealsInputSchema = z.object({
  location: z
    .string()
    .describe('The user\'s location to determine relevant festivals.'),
});

export type SuggestFestivalMealsInput = z.infer<typeof SuggestFestivalMealsInputSchema>;

const SuggestFestivalMealsOutputSchema = z.object({
  festival: z.string().describe('The current festival being celebrated.'),
  suggestedDishes: z.array(z.string()).describe('Dishes suggested for the festival.'),
});

export type SuggestFestivalMealsOutput = z.infer<typeof SuggestFestivalMealsOutputSchema>;

export async function suggestFestivalMeals(input: SuggestFestivalMealsInput): Promise<SuggestFestivalMealsOutput> {
  return suggestFestivalMealsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFestivalMealsPrompt',
  input: {schema: SuggestFestivalMealsInputSchema},
  output: {schema: SuggestFestivalMealsOutputSchema},
  prompt: `You are a meal suggestion AI that specializes in recommending dishes based on the user's location and current festivals.

  The user is currently in {{location}}.

  Identify the current festival being celebrated in that location and suggest dishes that are traditionally eaten during that festival.

  Format your response as a JSON object matching the following schema:
  {
    "festival": "Name of the festival",
    "suggestedDishes": ["Dish 1", "Dish 2", "Dish 3"]
  }
`,
});

const suggestFestivalMealsFlow = ai.defineFlow(
  {
    name: 'suggestFestivalMealsFlow',
    inputSchema: SuggestFestivalMealsInputSchema,
    outputSchema: SuggestFestivalMealsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
