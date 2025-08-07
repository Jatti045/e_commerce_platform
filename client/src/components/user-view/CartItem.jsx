import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import {
  increaseProductQuantity,
  decreaseProductQuantity,
  removeProductFromUserCart,
  fetchUserCart,
} from "@/store/slices/product-slice";

const CartItem = ({ item }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  const { product, quantity, size } = item;
  const { _id, productImage, productName, productPrice, productCategory } =
    product;

  const handleIncreaseQuantity = async () => {
    setIsLoading(true);
    const payload = {
      userId: user.userId,
      productId: _id,
      size: size,
    };

    const response = await dispatch(increaseProductQuantity(payload));

    if (response?.payload?.success) {
      toast({
        title: "Quantity increased",
        variant: "default",
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
    } else {
      toast({
        title: response?.payload?.message || "Failed to increase quantity",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDecreaseQuantity = async () => {
    setIsLoading(true);
    const payload = {
      userId: user.userId,
      productId: _id,
      size: size,
    };

    const response = await dispatch(decreaseProductQuantity(payload));

    if (response?.payload?.success) {
      toast({
        title: "Quantity decreased",
        variant: "default",
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
    } else {
      toast({
        title: response?.payload?.message || "Failed to decrease quantity",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleRemoveFromCart = async () => {
    setIsLoading(true);
    const payload = {
      userId: user.userId,
      productId: _id,
      size: size,
    };

    const response = await dispatch(removeProductFromUserCart(payload));

    if (response?.payload?.success) {
      toast({
        title: "Item removed from cart",
        variant: "default",
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
      await dispatch(fetchUserCart({ id: user.userId }));
    } else {
      toast({
        title: response?.payload?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={productImage}
              alt={productName}
              className="w-24 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* Product Details */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {productName}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFromCart}
                disabled={isLoading}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-8 w-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {productCategory}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Size: {size?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDecreaseQuantity}
                    disabled={isLoading || quantity <= 1}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIncreaseQuantity}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(productPrice * quantity).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ${productPrice} each
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
