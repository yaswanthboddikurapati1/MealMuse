"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Loader } from "lucide-react";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CulinaryCanvasLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Signed In Successfully!",
        description: "Welcome back!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error signing in:", error);
      let description = "There was a problem with signing you in.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      }
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
          <CulinaryCanvasLogo className="h-8 w-8" />
          <span className="font-bold text-xl">CulinaryCanvas</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your meal plans and journal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="underline hover:text-primary">Sign up</Link>
      </footer>
    </div>
  );
}
