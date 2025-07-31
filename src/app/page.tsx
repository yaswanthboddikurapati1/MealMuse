
"use client";

import { Suspense } from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Utensils, CalendarHeart, ChefHat, ShoppingCart, BookHeart, User as UserIcon, LogOut, Loader, Home as HomeIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation'


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealPlanGenerator from "@/components/meal-plan-generator";
import FestiveFoods from "@/components/festive-foods";
import RecipeFinder from "@/components/recipe-finder";
import ShoppingList from "@/components/shopping-list";
import FoodMoodJournal from "@/components/food-mood-journal";
import { MealMuseLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { firebaseApp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export interface JournalEntry {
  id: number;
  date: string;
  mood: string;
  food: string;
}

function ServicesPage() {
  const [shoppingList, setShoppingList] = useState<string[]>(['1 tbsp olive oil', '2 cloves garlic', '1 can diced tomatoes']);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'meal-plan'

  useEffect(() => {
    // Initialize with a default entry on the client to avoid hydration mismatch
    setJournalEntries([
      { id: 1, date: new Date().toLocaleDateString(), mood: 'Comforted', food: 'A warm bowl of tomato soup and grilled cheese.' }
    ]);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Explicitly set user to null to trigger UI update
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "There was a problem signing you out.",
      });
    }
  };

  const handleTabChange = (value: string) => {
    router.push(`/?tab=${value}`);
  };

  const addToShoppingList = (item: string) => {
    setShoppingList((prev) => [item, ...prev]);
  };

  const removeFromShoppingList = (itemToRemove: string) => {
    setShoppingList((prev) => prev.filter(item => item !== itemToRemove));
  };
  
  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    setJournalEntries(prev => [{ ...entry, id: Date.now(), date: new Date().toLocaleDateString() }, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="py-6 px-4 md:px-8 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
            <MealMuseLogo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">MealMuse</h1>
              <p className="text-sm text-muted-foreground">Cook what your culture craves.</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            { user && (
               <Link href="/dashboard">
                  <Button variant="outline">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
            )}
            {isLoadingAuth ? (
              <Button variant="outline" disabled>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : user ? (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link href="/signin">
                <Button variant="outline">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto md:h-12 mb-6 bg-primary/10">
            <TabsTrigger value="meal-plan" className="flex items-center gap-2 py-2"><Utensils className="h-4 w-4" />AI Meal Plan</TabsTrigger>
            <TabsTrigger value="festive-foods" className="flex items-center gap-2 py-2"><CalendarHeart className="h-4 w-4" />Festive Foods</TabsTrigger>
            <TabsTrigger value="recipe-finder" className="flex items-center gap-2 py-2"><ChefHat className="h-4 w-4" />Recipe Finder</TabsTrigger>
            <TabsTrigger value="shopping-list" className="flex items-center gap-2 py-2"><ShoppingCart className="h-4 w-4" />Shopping List</TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2 py-2"><BookHeart className="h-4 w-4" />Food Journal</TabsTrigger>
          </TabsList>

          <TabsContent value="meal-plan">
            <MealPlanGenerator addToShoppingList={addToShoppingList} />
          </TabsContent>
          <TabsContent value="festive-foods">
            <FestiveFoods addToShoppingList={addToShoppingList} />
          </TabsContent>
          <TabsContent value="recipe-finder">
            <RecipeFinder addToShoppingList={addToShoppingList} />
          </TabsContent>
          <TabsContent value="shopping-list">
            <ShoppingList 
              items={shoppingList} 
              onRemoveItem={removeFromShoppingList} 
              onAddItem={addToShoppingList}
              onClearList={clearShoppingList} 
            />
          </TabsContent>
          <TabsContent value="journal">
            <FoodMoodJournal entries={journalEntries} onAddEntry={addJournalEntry} />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border/50">
        <p>Built with ❤️ and a touch of spice.</p>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesPage />
    </Suspense>
  )
}
