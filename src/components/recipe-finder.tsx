"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat, Loader, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMealPlan, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  availableIngredients: z.string().min(2, "Please list some ingredients.").max(200),
});

type RecipeFinderProps = {
  addToShoppingList: (item: string) => void;
};

export default function RecipeFinder({ addToShoppingList }: RecipeFinderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availableIngredients: "paneer, peas, tomatoes, onion, ginger",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMealPlan(null);
    try {
      const result = await generateMealPlan({
          ...values,
          mood: "creative",
          dietaryGoals: "using up what I have"
      });
      setMealPlan(result);
    } catch (error) {
      console.error("Error finding recipes:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with finding recipes for you.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-primary/50 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><ChefHat className="text-primary"/>Recipe Finder</CardTitle>
        <CardDescription>Got ingredients? Let's turn them into a delicious meal plan for your day.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="availableIngredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's in your fridge? (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., eggs, bread, milk, spinach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Cooking up ideas...
                </>
              ) : "Find Recipes"}
            </Button>
          </form>
        </Form>
        
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 bg-muted rounded w-full" />
                  <Skeleton className="h-4 bg-muted rounded w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {mealPlan && (
          <div className="mt-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold font-headline mb-4">Here's a plan based on your ingredients:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(mealPlan.mealPlan).map(([mealType, meal]) => (
                <Card key={mealType} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-headline capitalize">{mealType.replace(/([A-Z])/g, ' $1')}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p>{meal}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary/90" onClick={() => addToShoppingList(meal)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add to List
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
