'use server';

/**
 * @fileOverview A meal plan generator AI agent.
 *
 * - generateMealPlan - A function that handles the meal plan generation process.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealPlanInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., tired, festive, anxious).'),
  dietaryGoals: z
    .string()
    .describe('The dietary goals of the user (e.g., low-carb, high-protein, vegetarian).'),
  availableIngredients: z
    .string()
    .describe(
      'A list of available ingredients that the user has on hand. Separate each ingredient by a comma.'
    ),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z.object({
    breakfast: z.string().describe('A suggestion for breakfast.'),
    lunch: z.string().describe('A suggestion for lunch.'),
    dinner: z.string().describe('A suggestion for dinner.'),
    snacks: z.string().describe('Suggestions for snacks.'),
  }),
  reasoning: z
    .string()
    .describe(
      'Reasoning behind the generated meal plan (how it fits the mood, dietary goals, and available ingredients)'
    ),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const generateMealPlanPrompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are an AI meal planning assistant that generates meal plans based on the user's mood, dietary goals, and available ingredients.

  Mood: {{{mood}}}
  Dietary Goals: {{{dietaryGoals}}}
  Available Ingredients: {{{availableIngredients}}}

  Generate a meal plan consisting of breakfast, lunch, dinner, and snacks that aligns with the user's mood, dietary goals, and available ingredients. Also, provide reasoning on why you generated this meal plan.
  Format your response as a JSON object matching the schema. Ensure the mealPlan properties for breakfast, lunch, dinner, and snacks are included, as well as the reasoning.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const {output} = await generateMealPlanPrompt(input);
    return output!;
  }
);
