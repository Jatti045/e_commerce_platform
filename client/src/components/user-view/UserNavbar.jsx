import React, { useState } from "react";
import {
  HouseIcon,
  LogOut,
  LogIn,
  ShoppingCart,
  Logs,
  Loader2,
  Rabbit,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/slices/auth-slice";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useTheme from "@/hooks/useTheme";

const navElements = [
  {
    id: "home",
    title: "Home",
    path: "/user/home",
  },
  {
    id: "products",
    title: "Products",
    path: "/user/products",
  },
  {
    id: "men",
    title: "Men",
    path: "/user/products?category=men",
  },
  {
    id: "women",
    title: "Women",
    path: "/user/products?category=women",
  },
  {
    id: "unisex",
    title: "Unisex",
    path: "/user/products?category=unisex",
  },
  {
    id: "kids",
    title: "Kids",
    path: "/user/products?category=kids",
  },
  {
    id: "search",
    title: "Search",
    path: "/user/search",
  },
];

const UserNavbar = React.memo(() => {
  const { theme, toggleTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated } = authState;

  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    const response = await dispatch(logoutUser());

    if (response?.payload?.success) {
      toast({
        title: response.payload.message,
        variant: "success",
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
      navigate("/auth/login");
    } else {
      toast({
        variant: "destructive",
        title: response.payload.message,
      });
    }
  };

  const productState = useSelector((state) => state.product);
  const { userCartCount, isProductSliceLoadingState } = productState;

  return (
    <>
      <div className="hidden lg:flex">
        <nav className="fixed  top-0 z-50 w-full bg-white dark:bg-black dark:text-white dark:border-zinc-900 flex justify-between items-center px-10 py-4 border-b font-medium">
          <Link to="/user/home">
            <div className="flex gap-2 justify-center items-center text-lg">
              <Rabbit
                size={30}
                onClick={() => {
                  scrollTo({
                    top: 0,
                  });
                }}
              />
              <h1 className="text-xl">Billify</h1>
            </div>
          </Link>

          <div>
            <ul className="flex gap-8">
              {navElements.map((navElement) => (
                <li
                  className="hover:text-zinc-500 transition-colors duration-200"
                  onClick={() =>
                    scrollTo({
                      top: 0,
                    })
                  }
                  key={navElement.id}
                >
                  <Link to={navElement.path}>{navElement.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex">
            <TooltipProvider>
              {/* {
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="dark:bg-zinc-950 dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                      onClick={toggleTheme}
                    >
                      {theme === "light" ? (
                        <Sun className="text-black" size={20} />
                      ) : (
                        <Moon
                          className="dark:text-white text-bg-transparent hover:bg-gray-100 "
                          size={20}
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-black dark:border-zinc-900">
                    <p>Mode</p>
                  </TooltipContent>
                </Tooltip>
              } */}
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="relative dark:bg-zinc-950 dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                    onClick={() => {
                      scrollTo({
                        top: 0,
                      });
                      navigate("/user/cart");
                    }}
                  >
                    <ShoppingCart
                      className="dark:text-white text-black"
                      size={20}
                    />

                    <p className="absolute text-black dark:text-white top-0 right-3">
                      {userCartCount}
                    </p>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-black dark:border-zinc-900">
                  <p>Cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isAuthenticated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="dark:bg-zinc-950 text-black dark:text-white dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                      onClick={logout}
                    >
                      <LogOut
                        className="dark:text-white text-black"
                        size={20}
                      />
                      Log Out
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-black dark:border-zinc-900">
                    <p>Log Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="dark:bg-zinc-950 text-black dark:text-white dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                      onClick={() => navigate("/auth/login")}
                    >
                      <LogIn className="dark:text-white text-black" size={20} />
                      Sign In
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-black dark:border-zinc-900">
                    <p>Sign In</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </nav>
      </div>
      <div className="flex lg:hidden">
        <nav className="flex fixed dark:border-b-zinc-800 top-0 bg-white dark:bg-black dark:text-white z-50 justify-between items-center w-full border-b px-4 py-4">
          <div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Logs size={30} />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="dark:bg-black text-black dark:border-r-zinc-900"
              >
                <SheetHeader>
                  <SheetTitle className="flex gap-4 justify-start items-center px-10">
                    <Link to="/user/home">
                      <div
                        onClick={() => {
                          scrollTo({ top: 0 });
                          setIsSheetOpen(false);
                        }}
                        className="flex gap-2 justify-center items-center"
                      >
                        <Rabbit size={30} />
                        <span className="text-xl font-medium">Billify</span>
                      </div>
                    </Link>
                  </SheetTitle>
                  <SheetDescription asChild>
                    <div>
                      <ul className="flex flex-col items-start text-lg dark:text-white text-black px-10 py-10 gap-8 overflow-y-auto max-h-[80vh]">
                        {navElements.map((navElement) => (
                          <li
                            className="px-4"
                            key={navElement.id}
                            onClick={() => {
                              scrollTo({ top: 0 });
                              setIsSheetOpen(false);
                            }}
                          >
                            <Link to={navElement.path}>{navElement.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="relative dark:text-white text-black dark:bg-zinc-950 dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                    onClick={() => {
                      scrollTo({
                        top: 0,
                      });
                      navigate("/user/cart");
                    }}
                  >
                    <ShoppingCart />

                    <p className="absolute text-black dark:text-white top-0 right-3">
                      {userCartCount}
                    </p>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark:bg-black dark:border-zinc-900">
                  <p>Cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isAuthenticated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="dark:bg-zinc-950 dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                      onClick={logout}
                    >
                      <LogOut
                        className="dark:text-white text-black"
                        size={20}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-black dark:border-zinc-900">
                    <p>Log Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="dark:bg-zinc-950 text-black dark:text-white dark:hover:bg-zinc-900 bg-transparent hover:bg-gray-100"
                      onClick={() => navigate("/auth/login")}
                    >
                      <LogIn className="dark:text-white text-black" size={20} />
                      Sign In
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-black dark:border-zinc-900">
                    <p>Sign In</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </nav>
      </div>
    </>
  );
});

export default UserNavbar;
