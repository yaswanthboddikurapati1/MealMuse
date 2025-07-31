"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader, MapPin, PlusCircle, Gift, Flame, Moon, Sun, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { suggestFestivalMeals, SuggestFestivalMealsOutput } from "@/ai/flows/suggest-festival-meals";

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
  
  const FestivalIcon = suggestion ? getFestivalIcon(suggestion.festival) : Sparkles;

  return (
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
                  <li key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-lg border">
                    <span className="font-medium">{dish}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary/90" onClick={() => addToShoppingList(dish)}>
                      not working
                    </Button>
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
  );
}
