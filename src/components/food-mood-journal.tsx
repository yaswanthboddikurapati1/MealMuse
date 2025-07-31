
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Smile, Frown, Meh, Annoyed, Heart, Lock } from "lucide-react";
import type { User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JournalEntry } from "@/app/page";

const formSchema = z.object({
  mood: z.string().min(1, "Please select a mood."),
  food: z.string().min(3, "Please describe what you ate.").max(500),
});

type FoodMoodJournalProps = {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  user: User | null;
  isLoadingAuth: boolean;
};

const moodIcons: { [key: string]: React.ElementType } = {
  Happy: Smile,
  Comforted: Heart,
  Sad: Frown,
  Neutral: Meh,
  Stressed: Annoyed,
};

export default function FoodMoodJournal({ entries, onAddEntry, user, isLoadingAuth }: FoodMoodJournalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
      food: "",
    },
  });

  const isAuthenticated = !isLoadingAuth && user;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isAuthenticated) return;
    onAddEntry(values);
    form.reset({ mood: "", food: "" });
  }

  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card className="sticky top-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">How are you feeling?</CardTitle>
            <CardDescription>Log your meal and mood to connect with your food story.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Mood</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select how you feel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(moodIcons).map(mood => (
                              <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="food"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What did you eat?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the meal that made you feel this way..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Add to Journal</Button>
                </form>
              </Form>
            ) : (
                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-6 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <p className="font-semibold">Sign in to start your journal</p>
                    <p className="text-sm text-muted-foreground">Discover the connection between food and mood.</p>
                    <Link href="/signin" className="w-full">
                        <Button className="mt-2 w-full">Sign In</Button>
                    </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Your Weekly Digest</CardTitle>
                <CardDescription>A summary of your food journey.</CardDescription>
            </CardHeader>
            <CardContent>
                {entries.length > 0 && isAuthenticated ? (
                    <div className="flex flex-wrap gap-4">
                        {Object.entries(moodCounts).map(([mood, count]) => {
                            const Icon = moodIcons[mood] || Meh;
                            return (
                                <div key={mood} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{mood}:</span>
                                    <span>{count} {count > 1 ? 'times' : 'time'}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground">{isAuthenticated ? 'Start logging to see your weekly digest!' : 'Sign in to see your journal entries and weekly digest.'}</p>
                )}
            </CardContent>
        </Card>
        
        <h3 className="text-2xl font-bold font-headline mt-8">Journal Entries</h3>
        <div className="space-y-4">
        {entries.length > 0 && isAuthenticated ? (
          entries.map((entry) => {
            const Icon = moodIcons[entry.mood] || Meh;
            return (
              <Card key={entry.id} className="relative overflow-hidden animate-in fade-in-50">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent/50"></div>
                <CardHeader className="pl-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-semibold"><Icon className="h-5 w-5 text-accent" /> {entry.mood}</CardTitle>
                    <CardDescription>{entry.date}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pl-6">
                  <p className="whitespace-pre-wrap">{entry.food}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="text-center text-muted-foreground py-12 border-dashed">
            <p className="font-semibold">{isAuthenticated ? 'No journal entries yet.' : 'Sign in to view your entries.'}</p>
            <p className="text-sm">{isAuthenticated ? 'Log your first meal to begin your story.' : 'Your food story awaits.'}</p>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
