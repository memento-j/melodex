import { Link } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
  } from "@/components/ui/navigation-menu"


export default function Navbar() {
    return(
        <NavigationMenu className="fixed top-0 left-0 w-full max-w-none bg-transparent shadow-none m-0">
            <div className="mx-auto max-w-screen w-full px-16 py-8">
                <NavigationMenuList className="flex w-full items-center !justify-between">
                    {/* Site name */}
                    <NavigationMenuItem>
                        <Link to="/" >
                            <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent py-4">
                            Melodex
                            </p>
                        </Link>
                    </NavigationMenuItem>

                    {/* GitHub Link */}
                    <NavigationMenuItem>
                        <Link to="https://github.com/memento-j/melodex" target="_blank" rel="noreferrer">
                            <img className="size-8" src="/github-mark-white.svg" alt="GitHub" />
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </div>
        </NavigationMenu>
    );
}