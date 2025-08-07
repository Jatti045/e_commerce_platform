import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllProducts } from "@/store/slices/product-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import ProductCards from "@/components/product/ProductCards";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminCreateProduct from "@/components/admin-view/AdminCreateProduct";
import { uploadImageToCloudinary } from "@/utils/cloudinary-helper";
import {
  addNewProduct,
  setIsProductSliceLoadingState,
} from "@/store/slices/product-slice";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, isProductSliceLoadingState } = useSelector(
    (state) => state.product
  );
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productImage: "",
    productImagePublicId: "",
    productName: "",
    productDescription: "",
    productPrice: "",
    productCategory: "",
    clothingType: "",
    productSize: { xs: 0, s: 0, m: 0, l: 0, xl: 0, "2xl": 0 },
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const filtered = products
    .filter((p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (p) => categoryFilter === "all" || p.productCategory === categoryFilter
    );

  const categories = Array.from(
    new Set(products.map((p) => p.productCategory))
  );

  const handleAddNew = async (e) => {
    e.preventDefault();
    dispatch(setIsProductSliceLoadingState(true));
    const resp = await uploadImageToCloudinary(uploadedImage);
    if (resp?.data?.success) {
      const { imageUrl, publicId } = resp.data;
      const payload = {
        ...newProduct,
        productImage: imageUrl,
        productImagePublicId: publicId,
      };
      const resAction = await dispatch(addNewProduct(payload));
      if (resAction.payload?.success) {
        toast({ title: resAction.payload.message });
        dispatch(fetchAllProducts());
        setProductSheetOpen(false);
      } else {
        toast({ variant: "destructive", title: resAction.payload.message });
      }
    } else {
      toast({ variant: "destructive", title: resp?.data?.message });
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-900 p-6 overflow-auto">
      <header className="flex flex-col gap-4 md:gap-0 md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold dark:text-white mr-4">
          Products
        </h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select
            onValueChange={(val) => setCategoryFilter(val)}
            value={categoryFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center" variant="primary">
                <PlusCircle className="mr-2" /> Add New
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6">
              <SheetHeader>
                <SheetTitle>Add New Product</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleAddNew} className="mt-4 space-y-4">
                <AdminCreateProduct
                  newProduct={newProduct}
                  setNewProduct={setNewProduct}
                  uploadedImage={uploadedImage}
                  setUploadedImage={setUploadedImage}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProductSliceLoadingState}
                >
                  {isProductSliceLoadingState ? "Saving..." : "Save"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <p className="text-center dark:text-gray-400">No products found.</p>
        ) : (
          <div className="grid place-items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCards key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminProducts;
