"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader, MapPin, PlusCircle, Gift, Flame, Moon, Sun, UtensilsCrossed, BookOpen, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { suggestFestivalMeals, SuggestFestivalMealsOutput } from "@/ai/flows/suggest-festival-meals";
import { getRecipe, GetRecipeOutput } from "@/ai/flows/get-recipe";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  location: z.string().min(2, "Please enter a location.").max(50),
});

type FestiveFoodsProps = {
  addToShoppingList: (item: string) => void;
};

const festivalIcons: { [key: string]: React.ElementType } = {
    diwali: Flame,
    eid: Moon,
    christmas: Gift,
    thanksgiving: UtensilsCrossed,
    pongal: Sun,
    onam: Sparkles,
    default: Sparkles,
};

const getFestivalIcon = (festivalName: string) => {
    const lowerCaseName = festivalName.toLowerCase();
    for (const key in festivalIcons) {
        if (lowerCaseName.includes(key)) {
            return festivalIcons[key];
        }
    }
    return festivalIcons.default;
};

export default function FestiveFoods({ addToShoppingList }: FestiveFoodsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestFestivalMealsOutput | null>(null);
  const { toast } = useToast();

  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipe, setRecipe] = useState<GetRecipeOutput | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "Mumbai, India",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestFestivalMeals(values);
      setSuggestion(result);
    } catch (error) {
      console.error("Error suggesting festival meals:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with getting festival suggestions.",
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
  
  const FestivalIcon = suggestion ? getFestivalIcon(suggestion.festival) : Sparkles;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><MapPin className="text-primary"/>Discover Festive Flavors</CardTitle>
              <CardDescription>Enter your location to find dishes for current cultural celebrations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New Delhi, London" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : "Suggest Festive Meals"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
              <Card className="h-full min-h-96 flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground p-8">
                      <Loader className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="font-semibold">Searching for celebrations...</p>
                      <p className="text-sm">Unearthing delicious traditions for you.</p>
                  </div>
              </Card>
          )}
          {suggestion && (
            <Card className="h-full shadow-lg shadow-primary/20 border-primary/50 bg-gradient-to-br from-card to-primary/10 animate-in fade-in duration-500">
              <CardHeader className="flex flex-row items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                      <FestivalIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                      <CardDescription>We're celebrating</CardDescription>
                      <CardTitle className="text-3xl font-headline text-primary">{suggestion.festival}</CardTitle>
                  </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Suggested Dishes:</h3>
                <ul className="space-y-3">
                  {suggestion.suggestedDishes.map((dish, index) => (
                    <li key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-lg border flex-wrap gap-2">
                      <span className="font-medium">{dish}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleGetRecipe(dish)}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          How to Prepare
                        </Button>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary/90" onClick={() => addToShoppingList(dish)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add to List
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {!isLoading && !suggestion && (
              <Card className="h-full min-h-96 flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground p-8">
                      <Sparkles className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                      <p className="font-semibold">Ready for a culinary adventure?</p>
                      <p className="text-sm">Enter your location to get started.</p>
                  </div>
              </Card>
          )}
        </div>
      </div>

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
