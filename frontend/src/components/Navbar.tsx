import { Link } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
  } from "@/components/ui/navigation-menu"


export default function Navbar() {
    return(
        <NavigationMenu className="w-full max-w-none bg-transparent z-50 px-15 py-10">
            <div className="w-full">
                <NavigationMenuList className="justify-between">
                    {/* Site name */}
                    <NavigationMenuItem>
                        <Link to="/" >
                            <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
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