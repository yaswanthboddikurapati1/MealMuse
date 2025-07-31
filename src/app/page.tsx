
"use client";

import { Suspense } from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Utensils, CalendarHeart, ChefHat, ShoppingCart, BookHeart, User as UserIcon, LogOut, Loader, HomeIcon, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation'


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealPlanGenerator from "@/components/meal-plan-generator";
import FestiveFoods from "@/components/festive-foods";
import RecipeFinder from "@/components/recipe-finder";
import ShoppingList from "@/components/shopping-list";
import FoodMoodJournal from "@/components/food-mood-journal";
import { CulinaryCanvasLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { firebaseApp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export interface JournalEntry {
  id: number;
  date: string;
  mood: string;
  food: string;
}

const services = [
  {
    title: 'AI Meal Plan',
    description: 'Get personalized meal plans based on your mood and diet.',
    icon: Utensils,
    href: '/services?tab=meal-plan',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    title: 'Festive Foods',
    description: 'Discover dishes for current cultural celebrations near you.',
    icon: CalendarHeart,
    href: '/services?tab=festive-foods',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Recipe Finder',
    description: 'Turn the ingredients you have into delicious meals.',
    icon: ChefHat,
    href: '/services?tab=recipe-finder',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Shopping List',
    description: 'Keep track of your grocery needs all in one place.',
    icon: ShoppingCart,
    href: '/services?tab=shopping-list',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Food Journal',
    description: 'Connect your mood with your meals and find patterns.',
    icon: BookHeart,
    href: '/services?tab=journal',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];


function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const auth = getAuth(firebaseApp);
  const { toast } = useToast();

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
      setUser(null);
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


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
       <header className="py-6 px-4 md:px-8 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
            <CulinaryCanvasLogo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">CulinaryCanvas</h1>
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
              <>
                <Link href="/services">
                    <Button variant="ghost">Services</Button>
                </Link>
                <Link href="/signin">
                    <Button>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Sign In
                    </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto py-16 px-4 md:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Welcome to CulinaryCanvas</h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Your personal AI chef that blends culture, mood, and the ingredients you have into delicious, meaningful meals. Explore our services below.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Link href={service.href} key={service.title}>
                    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-4">
                        <div className={`p-3 rounded-lg ${service.bgColor}`}>
                            <service.icon className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <div>
                            <CardTitle>{service.title}</CardTitle>
                            <CardDescription>{service.description}</CardDescription>
                        </div>
                        </CardHeader>
                        <CardContent className="flex-grow"></CardContent>
                        <div className="p-6 pt-0 flex justify-end">
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </Card>
                    </Link>
                ))}
            </div>
        </div>
      </main>
      
      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border/50">
        <p>Built with ❤️ and a touch of spice.</p>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
    }>
      <LandingPage />
    </Suspense>
  )
}
