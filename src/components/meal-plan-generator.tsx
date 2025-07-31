"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrainCircuit, Loader, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMealPlan, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  mood: z.string().min(2, "Please share your mood.").max(50),
  dietaryGoals: z.string().min(2, "What are your goals?").max(100),
  availableIngredients: z.string().min(2, "What ingredients do you have?").max(200),
});

type MealPlanGeneratorProps = {
  addToShoppingList: (item: string) => void;
};

export default function MealPlanGenerator({ addToShoppingList }: MealPlanGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "craving something comforting",
      dietaryGoals: "balanced and healthy",
      availableIngredients: "tomatoes, bread, cheese, garlic",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMealPlan(null);
    try {
      const result = await generateMealPlan(values);
      setMealPlan(result);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with generating your meal plan.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-accent/50 shadow-lg shadow-accent/10">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="text-accent"/>AI Meal Planner</CardTitle>
        <CardDescription>Tell us how you feel and what you have. We'll handle the rest.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Mood</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., tired, festive, adventurous" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., low-carb, high-protein" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="availableIngredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Ingredients (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., chicken, rice, spinach, garlic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : "Generate My Meal Plan"}
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="mt-8 space-y-4">
            <Card className="bg-primary/5">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                        <CardFooter><Skeleton className="h-8 w-24" /></CardFooter>
                    </Card>
                ))}
            </div>
          </div>
        )}
        {mealPlan && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Chef's Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{mealPlan.reasoning}</p>
                </CardContent>
            </Card>

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
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent-foreground hover:bg-accent/90" onClick={() => addToShoppingList(meal)}>
                      not working
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
