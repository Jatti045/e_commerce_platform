import { Mars, Venus, Users, Baby } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import React from "react";

const shopByCategory = [
  {
    icon: <Mars size={30} className="text-gray-600 dark:text-white" />,
    title: "Men",
    id: "menHomepage",
    path: "/user/products?category=men",
  },
  {
    icon: <Venus size={30} className="text-gray-600 dark:text-white" />,
    title: "Women",
    id: "womenHomepage",
    path: "/user/products?category=women",
  },
  {
    icon: <Users size={30} className="text-gray-600 dark:text-white" />,
    title: "Unisex",
    id: "unisexHomepage",
    path: "/user/products?category=unisex",
  },
  {
    icon: <Baby size={30} className="text-gray-600 dark:text-white" />,
    title: "Kids",
    id: "kidsHomepage",
    path: "/user/products?category=kids",
  },
];

const UserShopByCategory = React.memo(() => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-center py-10 text-2xl font-bold">Shop By Category</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-10">
        {shopByCategory.map((category) => (
          <Card
            key={category.id}
            onClick={() => navigate(category.path)}
            className="shadow-md hover:scale-105 duration-300 dark:bg-black dark:border-zinc-900 dark:hover:border-zinc-700 flex justify-center items-center cursor-pointer"
          >
            <CardHeader className="flex items-center  justify-center">
              <CardTitle>{category.icon}</CardTitle>
              <CardDescription className="dark:text-white">
                {category.title}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default UserShopByCategory;
