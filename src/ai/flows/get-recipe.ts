'use server';

/**
 * @fileOverview A recipe generator AI agent.
 *
 * - getRecipe - A function that handles the recipe generation process.
 * - GetRecipeInput - The input type for the getRecipe function.
 * - GetRecipeOutput - The return type for the getRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRecipeInputSchema = z.object({
  dishName: z.string().describe('The name of the dish for which to generate a recipe.'),
});
export type GetRecipeInput = z.infer<typeof GetRecipeInputSchema>;

const GetRecipeOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('A list of step-by-step preparation instructions.'),
  servings: z.string().describe('The number of servings the recipe makes.'),
  prepTime: z.string().describe('The preparation time for the recipe.'),
});
export type GetRecipeOutput = z.infer<typeof GetRecipeOutputSchema>;

export async function getRecipe(input: GetRecipeInput): Promise<GetRecipeOutput> {
  return getRecipeFlow(input);
}

const getRecipePrompt = ai.definePrompt({
  name: 'getRecipePrompt',
  input: {schema: GetRecipeInputSchema},
  output: {schema: GetRecipeOutputSchema},
  prompt: `You are an expert chef. Generate a detailed recipe for the following dish: {{{dishName}}}.

  Include the required ingredients, step-by-step instructions, the number of servings, and the estimated preparation time.
  Format your response as a JSON object matching the schema.
`,
});

const getRecipeFlow = ai.defineFlow(
  {
    name: 'getRecipeFlow',
    inputSchema: GetRecipeInputSchema,
    outputSchema: GetRecipeOutputSchema,
  },
  async input => {
    const {output} = await getRecipePrompt(input);
    return output!;
  }
);
