"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat, Loader, PlusCircle, BookOpen, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMealPlan, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { getRecipe, GetRecipeOutput } from "@/ai/flows/get-recipe";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


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

  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipe, setRecipe] = useState<GetRecipeOutput | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);

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
