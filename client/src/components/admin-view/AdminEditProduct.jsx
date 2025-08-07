import { useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useDispatch } from "react-redux";
import { fetchSingleProduct } from "@/store/slices/product-slice";

const sizeOptions = ["xs", "s", "m", "l", "xl", "2xl"];

export default function AdminEditProduct({
  id,
  editProduct,
  setEditProduct,
  uploadedImage,
  setUploadedImage,
}) {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  // Fetch existing product details
  const fetchSingleProductFromApi = async () => {
    const response = await dispatch(fetchSingleProduct(id));
    if (response?.payload?.success) {
      const {
        productImage,
        productImagePublicId,
        productName,
        productDescription,
        productPrice,
        productCategory,
        clothingType,
        productSize,
      } = response.payload.product;

      setUploadedImage(productImage);
      setEditProduct({
        productImage,
        productImagePublicId,
        productName,
        productDescription,
        productPrice,
        productCategory,
        clothingType,
        productSize,
      });
    }
  };

  useEffect(() => {
    fetchSingleProductFromApi();
  }, [id]);

  // Basic field change
  const onEditProductChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Size quantity change
  const onSizeChange = (size, value) => {
    setEditProduct((prev) => ({
      ...prev,
      productSize: {
        ...prev.productSize,
        [size]: parseInt(value, 10) || 0,
      },
    }));
  };

  // File handlers
  const onAddFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImage(file);
  };
  const onRemoveFile = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleOnDragOver = (e) => e.preventDefault();

  return (
    <div className="mx-auto w-[80%] h-[60vh] overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Image Upload */}
      <Label
        htmlFor="upload-image"
        className="border-dashed border-2 rounded-md w-full h-40 flex justify-center items-center p-2"
      >
        {uploadedImage ? (
          <div className="flex items-center gap-2">
            {uploadedImage.name ? (
              uploadedImage.name.slice(0, 24) + "..."
            ) : (
              <img src={uploadedImage} alt="product" className="h-32" />
            )}
            <XIcon
              size={20}
              className="cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud size={40} className="text-neutral-200" />
            <span>Drag & drop or click to upload image</span>
          </div>
        )}
      </Label>
      <Input
        ref={fileInputRef}
        id="upload-image"
        type="file"
        accept="image/*"
        name="productImage"
        onChange={onAddFileChange}
        onDragOver={handleOnDragOver}
        className="hidden"
      />

      {/* Text Fields */}
      <Label className="mt-6 mb-2">Name</Label>
      <Input
        name="productName"
        value={editProduct.productName || ""}
        onChange={onEditProductChange}
      />

      <Label className="mt-6 mb-2">Description</Label>
      <Textarea
        name="productDescription"
        value={editProduct.productDescription || ""}
        onChange={onEditProductChange}
      />

      <Label className="mt-6 mb-2">Price</Label>
      <Input
        name="productPrice"
        value={editProduct.productPrice || ""}
        onChange={onEditProductChange}
        type="number"
        step="0.01"
      />

      {/* Selects */}
      <Label className="mt-6 mb-2">Category</Label>
      <Select
        value={editProduct.productCategory}
        onValueChange={(value) =>
          setEditProduct((prev) => ({ ...prev, productCategory: value }))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="unisex">Unisex</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Label className="mt-6 mb-2">Clothing Type</Label>
      <Select
        value={editProduct.clothingType}
        onValueChange={(value) =>
          setEditProduct((prev) => ({ ...prev, clothingType: value }))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select clothing type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Clothing Types</SelectLabel>
            <SelectItem value="shirt">Shirt</SelectItem>
            <SelectItem value="pants">Pants</SelectItem>
            <SelectItem value="shoes">Shoes</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="jackets">Jackets</SelectItem>
            <SelectItem value="hoodies">Hoodies</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Sizes & Quantity */}
      <Label className="mt-6 mb-2">Sizes & Quantity</Label>
      <div className="grid grid-cols-2 gap-4">
        {sizeOptions.map((size) => (
          <div key={size} className="flex flex-col">
            <Label htmlFor={`size-${size}`} className="text-sm">
              {size.toUpperCase()}
            </Label>
            <Input
              id={`size-${size}`}
              type="number"
              min={0}
              value={editProduct.productSize?.[size] ?? 0}
              onChange={(e) => onSizeChange(size, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
