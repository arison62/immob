// frontend/js/layouts/AuthenticatedLayout.tsx
import React, { PropsWithChildren, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/js/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/js/components/ui/sheet';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
        href={href}
        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200"
    >
        {children}
    </Link>
);

const SidebarNav = () => (
    <nav className="mt-6 flex flex-col">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/tenants">Locataires</NavLink>
        <NavLink href="/contrats">Contrats</NavLink>
        <NavLink href="/payments">Paiements</NavLink>
    </nav>
);

const AuthenticatedLayout = ({ children }: PropsWithChildren) => {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar for larger screens */}
            <aside className="w-64 bg-white border-r hidden lg:block">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Immob</h2>
                </div>
                <SidebarNav />
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm lg:hidden p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Immob</h2>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className="p-4">
                                <h2 className="text-xl font-bold">Immob</h2>
                            </div>
                            <SidebarNav />
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
