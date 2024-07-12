'use client'

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const { data: session } = useSession();

    const user: User = session?.user as User;

    const handleLogout = () => {
        signOut();
    };

    return (
        <nav className="px-4 py-3 shadow-md">
            <div className="mx-auto flex flex-col md:flex-row justify-between items-center">
                <Link href="#" className="text-lg font-bold mb-4 md:mb-0">Anonymous Message</Link>
                {
                    session ? (
                        <>
                            <span className="mr-4">
                                Welcome, {user?.username || user?.email}
                            </span>
                            <Button onClick={handleLogout} className="w-full md:w-auto">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link href="/signin" className="w-full md:w-auto">
                            <Button>
                                Sign In
                            </Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
};