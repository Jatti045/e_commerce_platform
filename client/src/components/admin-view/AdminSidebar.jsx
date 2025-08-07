import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import AdminCreateProduct from "./AdminCreateProduct";
import { uploadImageToCloudinary } from "@/utils/cloudinary-helper";
import {
  addNewProduct,
  fetchAllProducts,
  setIsProductSliceLoadingState,
} from "@/store/slices/product-slice";
import { logoutUser } from "@/store/slices/auth-slice";
import {
  LayoutDashboard,
  PackageSearch,
  SendToBack,
  PlusCircle,
  Menu,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "products",
    label: "Products",
    icon: PackageSearch,
    path: "/admin/products",
  },
  { id: "orders", label: "Orders", icon: SendToBack, path: "/admin/orders" },
];

const AdminSidebar = () => {
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
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmitNewProduct = async (e) => {
    e.preventDefault();
    dispatch(setIsProductSliceLoadingState(true));
    const response = await uploadImageToCloudinary(uploadedImage);

    if (response?.data?.success) {
      const { imageUrl, publicId } = response.data;
      const payload = {
        ...newProduct,
        productImage: imageUrl,
        productImagePublicId: publicId,
      };
      const result = await dispatch(addNewProduct(payload));

      if (result.payload?.success) {
        await dispatch(fetchAllProducts());
        toast({ title: result.payload.message });
        setProductSheetOpen(false);
        setNewProduct((prev) => ({
          ...prev,
          productImage: "",
          productImagePublicId: "",
          productName: "",
          productDescription: "",
          productPrice: "",
          productCategory: "",
          clothingType: "",
          productSize: prev.productSize,
        }));
        setUploadedImage(null);
      } else {
        toast({ variant: "destructive", title: result.payload.message });
      }
    } else {
      toast({ variant: "destructive", title: response?.data?.message });
    }
  };

  const onLogout = async () => {
    const res = await dispatch(logoutUser());
    if (res.payload?.success) {
      toast({
        title: res.payload.message || "Logged out successfully",
        variant: "success",
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
      navigate("/auth/login");
    } else {
      toast({ variant: "destructive", title: res.payload.message });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full overflow-y-auto">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.path);
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <Icon className="mr-2" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="space-y-2 mt-2">
        <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <PlusCircle className="mr-2" /> Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-4 sm:p-6 h-[100vh]">
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
            </SheetHeader>
            <form onSubmit={onSubmitNewProduct} className="mt-4 space-y-4">
              <AdminCreateProduct
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                uploadedImage={uploadedImage}
                setUploadedImage={setUploadedImage}
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600"
          onClick={onLogout}
        >
          <LogOut className="mr-2" /> Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 dark:text-white border-r">
        <div className="px-6 py-4 text-2xl font-bold">Admin Panel</div>
        <div className="flex-1 px-4 pb-4">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="p-2">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-4/5 max-w-xs bg-white dark:bg-gray-900 dark:text-white h-[100vh] p-0"
          >
            <div className="px-6 py-4 text-xl font-semibold border-b">
              Admin Panel
            </div>
            <div className="px-4 py-2 flex-1">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default AdminSidebar;
