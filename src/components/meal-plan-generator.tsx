
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrainCircuit, Loader, PlusCircle, BookOpen, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMealPlan, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { getRecipe, GetRecipeOutput } from "@/ai/flows/get-recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipe, setRecipe] = useState<GetRecipeOutput | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);

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

  const handleGetRecipe = async (dishName: string) => {
    setIsRecipeLoading(true);
    setRecipe(null);
    setSelectedDish(dishName);
    setIsRecipeDialogOpen(true);
    try {
      const result = await getRecipe({ dishName });
      setRecipe(result);
    } catch (error) {
      console.error("Error getting recipe:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Could not fetch the recipe for this dish.",
      });
      setIsRecipeDialogOpen(false); // Close dialog on error
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleAddIngredientsToList = () => {
    if (recipe?.ingredients) {
      recipe.ingredients.forEach(ingredient => {
        addToShoppingList(ingredient);
      });
      toast({
        title: "Ingredients Added!",
        description: `Ingredients for ${selectedDish} have been added to your shopping list.`,
      });
    }
  };

  return (
    <>
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
                    <Button variant="outline" size="sm" onClick={() => handleGetRecipe(meal)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        How to Prepare
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">{selectedDish}</DialogTitle>
            <DialogDescription>
              Here's how you can prepare this delicious meal.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="py-4">
              {isRecipeLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {recipe && (
                <div className="space-y-6">
                   <div className="flex justify-around items-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.prepTime}</span>
                      </div>
                       <Separator orientation="vertical" className="h-6" />
                      <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Serves {recipe.servings}</span>
                      </div>
                   </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {recipe.ingredients.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                      {recipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={handleAddIngredientsToList} disabled={!recipe}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredients to List
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
