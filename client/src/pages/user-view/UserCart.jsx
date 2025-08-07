import ProductCards from "@/components/product/ProductCards";
import CartItem from "@/components/user-view/CartItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Loader2,
  ShoppingCart,
  Package,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  addUserAddress,
  deleteUserAddress,
  fetchUserAddress,
} from "@/store/slices/checkout-slice";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import UpdateAddress from "@/components/user-view/UpdateAddress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StripeCheckoutButton from "@/components/payment-view/StripeCheckoutButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchUserOrders } from "@/store/slices/checkout-slice";
import { fetchUserCart } from "@/store/slices/product-slice";
import { useNavigate } from "react-router-dom";

const UserCart = () => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { toast } = useToast();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [isUpdateAddressOpen, setIsUpdateAddressOpen] = useState(false);

  const [isAddAddressLoading, setIsAddAddressLoading] = useState(false);
  const [isDeleteAddressLoading, setIsDeleteAddressLoading] = useState(false);

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user } = authState;

  const productState = useSelector((state) => state.product);
  const { userCart, totalCost } = productState;

  const checkoutState = useSelector((state) => state.checkout);
  const { userAddress, userOrders } = checkoutState;

  // Fetch orders and cart when component mounts or user changes
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchUserOrders({ id: user.userId }));
      dispatch(fetchUserCart({ id: user.userId }));
      dispatch(fetchUserAddress(user.userId));
    }
  }, [dispatch, user?.userId]);

  // Listen for URL changes to detect successful payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success");

    if (isSuccess === "true" && user?.userId) {
      // Payment was successful, refresh data
      setTimeout(() => {
        dispatch(fetchUserOrders({ id: user.userId }));
        dispatch(fetchUserCart({ id: user.userId }));
        toast({
          title: "Payment successful!",
          description: "Your order has been placed successfully.",
          style: {
            color: "white",
            backgroundColor: "green",
            border: "none",
          },
        });
      }, 1000); // Small delay to ensure webhook has processed
    }
  }, [dispatch, user?.userId, toast]);

  const onHandleAddressFormSubmit = async (addressFormData) => {
    setIsAddAddressLoading(true);

    const updatedAddressFormData = {
      ...addressFormData,
      isAuthenticated,
      user,
    };
    const response = await dispatch(addUserAddress(updatedAddressFormData));

    setIsAddAddressLoading(false);

    if (response?.payload?.success) {
      reset();
      dispatch(fetchUserAddress(user.userId));
      toast({
        title: response?.payload?.message,
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
    } else {
      toast({
        variant: "destructive",
        title: response?.payload?.message,
      });
    }
  };

  const handleDeleteUserAddress = async () => {
    setIsDeleteAddressLoading(true);
    const response = await dispatch(deleteUserAddress(user.userId));

    setIsDeleteAddressLoading(false);

    if (response?.payload?.success) {
      dispatch(fetchUserAddress(user.userId));
      toast({
        title: response?.payload?.message,
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
    } else {
      toast({
        variant: "destructive",
        title: response?.payload?.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
      {/* Header */}
      {/* <div className="bg-white mt-20 dark:bg-black border-b dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {userCart?.items?.length > 0
              ? `${userCart.items.length} item${
                  userCart.items.length > 1 ? "s" : ""
                } in your cart`
              : "Your cart is empty"}
          </p>
        </div>
      </div> */}

      <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="cart" className="w-full">
              <TabsList className="grid w-full grid-cols-2 place-content-center">
                <TabsTrigger
                  value="cart"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({userCart?.items?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Package className="w-5 h-5" />
                  Orders ({userOrders?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cart" className="space-y-4">
                {userCart?.items?.length > 0 ? (
                  <div className="space-y-4">
                    {userCart.items.map((item) => (
                      <CartItem
                        key={`${item.product._id}-${item.size}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent className="pt-6">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start shopping to see items appear here
                      </p>
                      <Button onClick={() => navigate("/user/products")}>
                        Continue Shopping
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                {userOrders && userOrders.length > 0 ? (
                  <div className="space-y-6">
                    {userOrders.map((order) => (
                      <Card key={order._id} className="shadow-sm">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <CardTitle className="text-lg">
                                Order #{order._id.slice(-8)}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  order.orderStatus === "delivered"
                                    ? "default"
                                    : "secondary"
                                }
                                className="mb-2"
                              >
                                {order.orderStatus}
                              </Badge>
                              <p className="text-lg font-semibold">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Shipping Address */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Shipping Address
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>{order.addressInfo.name}</p>
                              <p>{order.addressInfo.streetAddress}</p>
                              <p>
                                {order.addressInfo.city},{" "}
                                {order.addressInfo.region}{" "}
                                {order.addressInfo.postalCode}
                              </p>
                              <p>{order.addressInfo.country}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold mb-3">
                              Items Ordered
                            </h4>
                            <div className="space-y-3">
                              {order.cartItems.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {item.product.productName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Qty: {item.quantity} • Size:{" "}
                                      {item.size?.toUpperCase()}
                                    </p>
                                  </div>
                                  <p className="font-semibold">
                                    $
                                    {(
                                      item.product.productPrice * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent className="pt-6">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your order history will appear here once you make a
                        purchase
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Address and Checkout */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Address Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userAddress ? (
                    <div className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{userAddress.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {userAddress.streetAddress}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {userAddress.city}, {userAddress.region}{" "}
                          {userAddress.postalCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {userAddress.country}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Drawer
                          open={isUpdateAddressOpen}
                          onOpenChange={setIsUpdateAddressOpen}
                        >
                          <DrawerTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent className="dark:bg-gradient-to-b dark:from-black dark:to-zinc-900 dark:text-white dark:border-zinc-900">
                            <DrawerHeader>
                              <DrawerDescription asChild>
                                <div>
                                  <UpdateAddress
                                    isUpdateAddressOpen={isUpdateAddressOpen}
                                    setIsUpdateAddressOpen={
                                      setIsUpdateAddressOpen
                                    }
                                  />
                                </div>
                              </DrawerDescription>
                            </DrawerHeader>
                          </DrawerContent>
                        </Drawer>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={isDeleteAddressLoading}
                            >
                              {isDeleteAddressLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="dark:bg-black dark:text-white dark:border-zinc-900">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Address?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your shipping address.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:border-zinc-800 dark:hover:bg-zinc-950 dark:text-white dark:bg-zinc-900">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteUserAddress}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add a shipping address to proceed with checkout
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Address Form */}
              {!userAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onHandleAddressFormSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          {...register("name", {
                            required: "Name is required",
                          })}
                          placeholder="John Doe"
                          className="mt-1"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="streetAddress"
                          className="text-sm font-medium"
                        >
                          Street Address
                        </Label>
                        <Input
                          id="streetAddress"
                          {...register("streetAddress", {
                            required: "Address is required",
                          })}
                          placeholder="123 Main St"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">
                            City
                          </Label>
                          <Input
                            id="city"
                            {...register("city", {
                              required: "City is required",
                            })}
                            placeholder="New York"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="region"
                            className="text-sm font-medium"
                          >
                            State
                          </Label>
                          <Input
                            id="region"
                            {...register("region")}
                            placeholder="NY"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="postalCode"
                            className="text-sm font-medium"
                          >
                            Zip Code
                          </Label>
                          <Input
                            id="postalCode"
                            {...register("postalCode")}
                            placeholder="10001"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="country"
                            className="text-sm font-medium"
                          >
                            Country
                          </Label>
                          <Input
                            id="country"
                            {...register("country", {
                              required: "Country is required",
                            })}
                            placeholder="USA"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isAddAddressLoading}
                      >
                        {isAddAddressLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </div>
                        ) : (
                          "Add Address"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              {userCart?.items?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {userCart.items.map((item) => (
                        <div
                          key={`${item.product._id}-${item.size}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.product.productName} (x{item.quantity})
                          </span>
                          <span className="font-medium">
                            $
                            {(
                              item.product.productPrice * item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total</span>
                      <span>${totalCost || "0.00"}</span>
                    </div>

                    <StripeCheckoutButton />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCart;
