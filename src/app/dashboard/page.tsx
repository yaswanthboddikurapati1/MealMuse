"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Utensils, CalendarHeart, ChefHat, ShoppingCart, BookHeart, User as UserIcon, LogOut, Loader, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { MealMuseLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { firebaseApp } from "@/lib/firebase";

const services = [
  {
    title: 'AI Meal Plan',
    description: 'Get personalized meal plans based on your mood and diet.',
    icon: Utensils,
    href: '/?tab=meal-plan',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    title: 'Festive Foods',
    description: 'Discover dishes for current cultural celebrations near you.',
    icon: CalendarHeart,
    href: '/?tab=festive-foods',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Recipe Finder',
    description: 'Turn the ingredients you have into delicious meals.',
    icon: ChefHat,
    href: '/?tab=recipe-finder',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Shopping List',
    description: 'Keep track of your grocery needs all in one place.',
    icon: ShoppingCart,
    href: '/?tab=shopping-list',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Food Journal',
    description: 'Connect your mood with your meals and find patterns.',
    icon: BookHeart,
    href: '/?tab=journal',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Redirect to signin if not authenticated
        router.push('/signin');
      } else {
        setUser(currentUser);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Oh no!",
        description: "There was a problem signing you out.",
      });
    }
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="py-6 px-4 md:px-8 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <MealMuseLogo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">MealMuse</h1>
              <p className="text-sm text-muted-foreground">Your Culinary Dashboard</p>
            </div>
          </Link>
          <div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline">Welcome, {user.email}!</h2>
          <p className="text-muted-foreground">What would you like to explore today?</p>
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
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border/50">
        <p>Built with ❤️ and a touch of spice.</p>
      </footer>
    </div>
  );
}
