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
  festival: z.string().describe('The current or an upcoming festival being celebrated.'),
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
  prompt: `You are a meal suggestion AI that specializes in recommending dishes for festivals. Your task is to identify a festival that is either currently being celebrated or is upcoming in the next few weeks in the user's provided location.

It is critical that you use today's date to determine this. Under no circumstances should you suggest a festival that has already passed. For example, if it is May, do not suggest a festival from March. Focus only on current or near-future celebrations.

The user is currently in {{location}}.

Based on this location and the current date, identify a relevant festival and suggest traditional dishes for it. If no major festival is happening, you can suggest a popular local dish.

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
