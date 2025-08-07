import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductToUserCart,
  decreaseProductQuantity,
  deleteExistingProduct,
  editExistingProduct,
  fetchAllProducts,
  fetchUserCart,
  increaseProductQuantity,
  removeProductFromUserCart,
  setIsProductSliceLoadingState,
} from "@/store/slices/product-slice";
import {
  addItem,
  increaseQty,
  decreaseQty,
  removeItem,
} from "@/store/slices/local-cart-slice";
import { useToast } from "@/hooks/use-toast";
import AdminEditProduct from "../admin-view/AdminEditProduct";
import { uploadImageToCloudinary } from "@/utils/cloudinary-helper";
import { Loader2, ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

const ProductCards = ({ product, quantity, size }) => {
  const {
    _id,
    productImage,
    productName,
    productDescription,
    productPrice,
    productCategory,
    clothingType,
    productSize,
  } = product;

  const editProductInitialState = {
    productImage: "",
    productImagePublicId: "",
    productName: "",
    productDescription: "",
    productPrice: "",
    productCategory: "",
    clothingType: "",
  };

  const productState = useSelector((state) => state.product);
  const { isProductSliceLoadingState } = productState;

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user } = authState;

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editProduct, setEditProduct] = useState(editProductInitialState);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCartActivityLoading, setIsCartActivityLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsCartActivityLoading(true);

    const response = await dispatch(
      addProductToUserCart({
        productId: _id,
        userId: user?.userId,
        size: selectedSize,
      })
    );

    if (response?.payload?.success) {
      dispatch(fetchUserCart({ id: user.userId }));
      toast({
        title: response.payload.message,
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
      scrollTo({
        top: 0,
      });
      navigate("/user/cart");
    } else {
      toast({
        variant: "destructive",
        title: response.payload.message,
      });
    }
    setIsCartActivityLoading(false);
  };

  const handleRemoveFromCart = async () => {
    setIsCartActivityLoading(true);
    const response = await dispatch(
      removeProductFromUserCart({ productId: _id, userId: user.userId, size })
    );

    if (response?.payload?.success) {
      dispatch(fetchUserCart({ id: user.userId }));
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
    setIsCartActivityLoading(false);
  };

  const handleDeleteProduct = async () => {
    const response = await dispatch(deleteExistingProduct(_id));
    if (response?.payload?.success) {
      await dispatch(fetchAllProducts());
      toast({
        title: response?.payload?.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: response?.payload?.message,
      });
    }
  };

  const handleEditProductFormSubmit = async (event) => {
    event.preventDefault();
    dispatch(setIsProductSliceLoadingState(true));

    let productData;

    if (uploadedImage.name) {
      const response = await uploadImageToCloudinary(uploadedImage);

      if (response?.data?.success) {
        const { imageUrl, publicId } = response?.data;
        productData = {
          ...editProduct,
          productImage: imageUrl,
          productImagePublicId: publicId,
        };
      }
    } else {
      productData = editProduct;
    }

    const updatedProduct = await dispatch(
      editExistingProduct({ productId: _id, updatedProductData: productData })
    );

    if (updatedProduct?.payload?.success) {
      await dispatch(fetchAllProducts());
      setOpenDrawer(false);
      toast({
        title: updatedProduct?.payload?.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: updatedProduct?.payload?.message,
      });
    }
  };

  const handleIncreaseQuantity = async () => {
    const response = await dispatch(
      increaseProductQuantity({ userId: user.userId, productId: _id })
    );
  };

  const handleDecreaseQuantity = async () => {
    const response = await dispatch(
      decreaseProductQuantity({ userId: user.userId, productId: _id })
    );
  };

  return (
    <Card
      className={`mb-4 overflow-auto flex flex-col w-[280px] dark:bg-zinc-950 dark:border-zinc-900 dark:hover:border-zinc-700 dark:text-white justify-between items-start bg-white rounded-lg shadow-md  duration-300 lg:hover:scale-105 hover:shadow-lg ${
        location.pathname.includes("admin")
          ? "h-fit md:min-h-[620px]"
          : "min-h-[400px] sm:min-h-[500px]"
      }`}
    >
      <CardHeader className="w-full relative">
        <Dialog className="w-[80%]">
          <DialogTrigger className="w-full">
            <img
              className="w-full h-22 sm:h-56 object-cover rounded-lg"
              src={productImage}
              alt={productName}
            />
          </DialogTrigger>
          <DialogContent
            className="
  dark:bg-black dark:border-zinc-900 dark:text-white
   max-w-xs sm:max-w-sm md:max-w-md
   mx-auto rounded-lg   max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>{productName}</DialogTitle>
            </DialogHeader>

            <img
              className="w-full h-64 object-contain rounded-lg"
              src={productImage}
              alt={productName}
            />

            <p className="text-gray-600 dark:text-white mt-2">
              {productDescription}
            </p>

            <p className="text-lg font-semibold dark:text-white text-gray-800 mt-2">
              Price: ${productPrice}
            </p>
            <p className="text-sm text-gray-500 dark:text-white">
              Category: {productCategory}
            </p>
            <p className="text-sm dark:text-white text-gray-500">
              Type: {clothingType}
            </p>

            <div className="mt-4">
              <p className="mb-1 text-sm font-medium dark:text-white">
                Select Size:
              </p>
              <Select
                value={selectedSize}
                onValueChange={(size) => setSelectedSize(size)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-950">
                  {["xs", "s", "m", "l", "xl", "2xl"].map((sz) => {
                    const stock = productSize[sz] ?? 0;
                    const isOut = stock === 0;
                    return (
                      <SelectItem
                        key={sz}
                        value={sz}
                        disabled={isOut}
                        className={
                          isOut
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-200"
                        }
                      >
                        {sz.toUpperCase()} {isOut && "(Out of stock)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="mt-6 w-full flex justify-center items-center gap-2"
              onClick={() => handleAddToCart(selectedSize)}
              disabled={isCartActivityLoading || !selectedSize}
            >
              {isCartActivityLoading ? (
                <div className="animate-spin flex justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                <div className="flex justify-center items-center gap-4">
                  Add To Cart
                </div>
              )}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="absolute top-2 right-2 dark:bg-white dark:text-black bg-black text-white text-sm font-semibold py-1 px-2 rounded">
          ${productPrice}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col space-y-2 ">
        <CardTitle className="text-lg font-bold dark:text-white text-gray-800">
          {productName}
        </CardTitle>
        {location.pathname.includes("admin") && (
          <CardDescription className="text-gray-600 line-clamp-3">
            {productDescription}
          </CardDescription>
        )}
      </CardContent>
      <CardFooter className=" px-4 pb-4 flex flex-col justify-center items-start space-y-1">
        {location.pathname === "/user/cart" ? (
          <p className=" dark:text-white text-sm text-gray-500 flex justify-center items-center gap-2">
            Quantity: {quantity}
          </p>
        ) : null}
        <p className="dark:text-white hidden text-sm text-gray-500 sm:flex justify-center items-center gap-2">
          {location.pathname === "/user/cart"
            ? `Size: ${size?.toUpperCase()}`
            : `Size: ${Object.keys(productSize)
                .map((size) => size?.toUpperCase())
                .join(", ")}`}
        </p>

        <p className="text-sm dark:text-white text-gray-500">
          Category:{" "}
          <span className="font-medium dark:text-white text-gray-700">
            {productCategory}
          </span>
        </p>
        <p className="text-sm dark:text-white text-gray-500">
          Type:{" "}
          <span className="font-medium dark:text-white text-gray-700">
            {clothingType}
          </span>
        </p>
      </CardFooter>
      {location.pathname.includes("user") ? (
        location.pathname === "/user/cart" ? (
          <div className="flex mb-4 justify-center items-center gap-2 mx-auto w-[80%]">
            <Button onClick={handleDecreaseQuantity}>
              <Minus />
            </Button>
            <Button onClick={handleIncreaseQuantity}>
              <Plus />
            </Button>
            <Button className="flex-1" onClick={handleRemoveFromCart}>
              {isCartActivityLoading ? (
                <div className="animate-spin flex justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <Trash2 />
                </div>
              )}
            </Button>
          </div>
        ) : (
          <Dialog className="w-[80%]">
            <DialogTrigger className="w-full">
              <Button className="w-[90%] mx-auto border-2 border-black mb-2 flex justify-center items-center gap-3">
                <ShoppingCart />
                Add To Cart
              </Button>
            </DialogTrigger>
            <DialogContent
              className="
  dark:bg-black dark:border-zinc-900 dark:text-white
   max-w-xs sm:max-w-sm md:max-w-md
   mx-auto rounded-lg   max-h-[90vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle>{productName}</DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <p className="mb-1 text-sm font-medium dark:text-white">
                  Select Size:
                </p>
                <Select
                  value={selectedSize}
                  onValueChange={(size) => setSelectedSize(size)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a size" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-950">
                    {["xs", "s", "m", "l", "xl", "2xl"].map((sz) => {
                      const stock = productSize[sz] ?? 0;
                      const isOut = stock === 0;
                      return (
                        <SelectItem
                          key={sz}
                          value={sz}
                          disabled={isOut}
                          className={
                            isOut
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }
                        >
                          {sz.toUpperCase()} {isOut && "(Out of stock)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="mt-6 w-full flex justify-center items-center gap-2"
                onClick={() => handleAddToCart(selectedSize)}
                disabled={isCartActivityLoading || !selectedSize}
              >
                {isCartActivityLoading ? (
                  <div className="animate-spin flex justify-center items-center">
                    <Loader2 />
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-4">
                    <ShoppingCart />
                    Add To Cart
                  </div>
                )}
              </Button>
            </DialogContent>
          </Dialog>
        )
      ) : (
        <div className="w-[80%] mx-auto mb-2 flex flex-col gap-2">
          <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
            <DrawerTrigger asChild>
              <Button className="w-full">Edit Product </Button>
            </DrawerTrigger>
            <DrawerContent className="dark:bg-black dark:text-white dark:border-zinc-900">
              <form onSubmit={handleEditProductFormSubmit}>
                <DrawerHeader>
                  <DrawerTitle className="text-center text-xl">
                    Edit Product
                  </DrawerTitle>
                  <DrawerDescription asChild>
                    <AdminEditProduct
                      id={_id}
                      editProduct={editProduct}
                      setEditProduct={setEditProduct}
                      uploadedImage={uploadedImage}
                      setUploadedImage={setUploadedImage}
                    />
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="mx-auto w-[80%]">
                  <Button type="submit">
                    {isProductSliceLoadingState ? (
                      <div className="animate-spin z-50 overflow-hidden flex justify-center items-center">
                        <Loader2 />
                      </div>
                    ) : (
                      <span>Confirm Changes</span>
                    )}
                  </Button>
                </DrawerFooter>
              </form>
            </DrawerContent>
          </Drawer>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full">Delete Product</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-black dark:text-white dark:border-zinc-900">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-zinc-900 dark:hover:bg-black dark:border-zinc-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteProduct()}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
};

export default ProductCards;
