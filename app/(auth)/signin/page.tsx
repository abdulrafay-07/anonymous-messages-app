'use client'

import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signinSchema } from "@/schemas/signin";
import { signIn } from "next-auth/react";

import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Signin = () => {
   const router = useRouter();
   const { toast } = useToast();

   const form = useForm<z.infer<typeof signinSchema>>({
      resolver: zodResolver(signinSchema),
      defaultValues: {
         identifier: "",
         password: "",
      },
   });

   const onSubmit = async (data: z.infer<typeof signinSchema>) => {
      const result = await signIn("credentials", {
         redirect: false,
         identifier: data.identifier,
         password: data.password,
      });

      if (result?.error) {
         if (result.error === "CredentialsSignin") {
            toast({
               title: "Login failed",
               description: "Incorrect username or password",
               variant: "destructive",
            });
         } else {
            toast({
               title: "Error",
               description: result.error,
               variant: "destructive",
            });
         };
      };
      
      if (result?.url) {
         router.replace("/dashboard");
      };
   };

   return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
         <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
               <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                  Welcome Back to Anonymous Message
               </h1>
               <p className="mb-4">Sign in to continue your secret conversations</p>
            </div>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                     name="identifier"
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Email/Username
                           </FormLabel>
                           <Input placeholder="Tyler Durden/tylerdurden@fightclub.com" {...field} />
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     name="password"
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Password</FormLabel>
                           <FormControl>
                                 <Input
                                    type="password"
                                    placeholder="youdonottalkaboutfightclub"
                                    {...field}
                                 />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button type="submit" className="w-full">
                     Sign in
                  </Button>
               </form>
            </Form>
            <div className="text-center mt-4">
               <p>
                  Not a member yet?{' '}
                  <Link href="/signup" className="text-cyan-700 hover:text-cyan-600 duration-100 transition">
                     Sign up
                  </Link>
               </p>
            </div>
         </div>
      </div>
   )
};

export default Signin;