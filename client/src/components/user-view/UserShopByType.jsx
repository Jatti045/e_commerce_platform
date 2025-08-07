import { Shirt, Box, Footprints, Gift, Layers, Cloud } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import React from "react";

const shopByType = [
  {
    title: "Shirt",
    icon: <Shirt size={30} className="text-gray-600 dark:text-white" />,
    id: "shirtHomepage",
    path: "/user/products?type=shirt",
    },
    {
      title: "Pants",
      icon: <Box size={30} className="text-gray-600 dark:text-white" />,
      id: "pantsHomepage",
      path: "/user/products?type=pants",
    },
    {
      title: "Shoes",
      icon: <Footprints size={30} className="text-gray-600 dark:text-white" />,
      id: "shoesHomepage",
      path: "/user/products?type=shoes",
    },
    {
      title: "Accessories",
      icon: <Gift size={30} className="text-gray-600 dark:text-white" />,
      id: "accessoriesHomepage",
      path: "/user/products?type=accessories",
    },
    {
      title: "Jackets",
      icon: <Layers size={30} className="text-gray-600 dark:text-white" />,
      id: "jacketsHomepage",
      path: "/user/products?type=jackets",
    },
    {
      title: "Hoodies",
      icon: <Cloud size={30} className="text-gray-600 dark:text-white" />,
    id: "hoodiesHomepage",
    path: "/user/products?type=hoodies",
  },
];

const UserShopByType = React.memo(() => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-center py-10 text-2xl font-bold">Shop By Type</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 px-10">
        {shopByType.map((type) => (
          <Card
            key={type.id}
            onClick={() => navigate(type.path)}
            className="shadow-md hover:scale-105 dark:bg-black dark:border-zinc-900 dark:hover:border-zinc-700 duration-300 flex justify-center items-center cursor-pointer"
          >
            <CardHeader className="flex items-center justify-center">
              <CardTitle className>{type.icon}</CardTitle>
              <CardDescription className="dark:text-white">
                {type.title}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default UserShopByType;
