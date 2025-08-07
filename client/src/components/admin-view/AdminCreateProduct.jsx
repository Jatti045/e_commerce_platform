import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, XIcon, FileIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useSelector } from "react-redux";

const sizeOptions = ["xs", "s", "m", "l", "xl", "2xl"];

const AdminCreateProduct = ({
  newProduct,
  setNewProduct,
  uploadedImage,
  setUploadedImage,
}) => {
  const productState = useSelector((state) => state.product);
  const { isProductSliceLoadingState } = productState;
  const fileInputRef = useRef(null);

  // Handle basic text inputs (name, description, price, etc.)
  const onAddNewProductChange = (event) => {
    const { name, value } = event.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  // Handle changes in size quantities
  const onSizeChange = (size, value) => {
    setNewProduct({
      ...newProduct,
      productSize: {
        ...newProduct.productSize,
        [size]: parseInt(value),
      },
    });
  };

  const onAddFileChange = (event) => {
    const uploadedFile = event?.target?.files?.[0];
    if (uploadedFile) {
      setUploadedImage(uploadedFile);
    }
  };

  const onRemoveFile = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOnDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="px-2 overflow-y-auto max-h-[80vh]">
      {/* Image Upload */}
      <Label
        htmlFor="upload-image"
        className="border-dashed border-2 rounded-md w-full h-40 flex justify-center items-center p-2"
      >
        {uploadedImage ? (
          <div className="flex justify-center items-center gap-2">
            <FileIcon />
            {uploadedImage.name.slice(0, 12) + "..."}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
              className="hover:text-red-500 cursor-pointer"
            >
              <XIcon size={20} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-2">
            <UploadCloud className="text-neutral-200" size={40} />
            <span>Click to upload image</span>
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

      {/* Product Name */}
      <Label className="text-left dark:text-white w-full mt-6 mb-2 text-black">
        Name
      </Label>
      <Input
        name="productName"
        value={newProduct.productName || ""}
        onChange={onAddNewProductChange}
        placeholder="Enter product name"
        type="text"
        className="dark:bg-zinc-900 dark:text-white dark:border-zinc-900"
      />

      {/* Description */}
      <Label className="text-left dark:text-white w-full mt-6 mb-2 text-black">
        Description
      </Label>
      <Textarea
        name="productDescription"
        value={newProduct.productDescription || ""}
        onChange={onAddNewProductChange}
        placeholder="Enter product description"
        className="dark:bg-zinc-900 dark:text-white dark:border-zinc-900"
      />

      {/* Price */}
      <Label className="text-left w-full dark:text-white mt-6 mb-2 text-black">
        Price
      </Label>
      <Input
        name="productPrice"
        value={newProduct.productPrice || ""}
        onChange={onAddNewProductChange}
        placeholder="Enter product price"
        type="number"
        step="0.01"
        className="dark:bg-zinc-900 dark:text-white dark:border-zinc-900"
      />

      {/* Category */}
      <Label className="text-left w-full dark:text-white mt-6 mb-2 text-black">
        Category
      </Label>
      <Select
        value={newProduct.productCategory}
        onValueChange={(categoryValue) =>
          setNewProduct((prev) => ({ ...prev, productCategory: categoryValue }))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent className="dark:bg-black dark:text-white dark:border-zinc-900">
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="unisex">Unisex</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Clothing Type */}
      <Label className="text-left w-full mt-6 mb-2 text-black">
        Clothing Type
      </Label>
      <Select
        value={newProduct.clothingType}
        onValueChange={(type) =>
          setNewProduct((prev) => ({ ...prev, clothingType: type }))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select clothing type" />
        </SelectTrigger>
        <SelectContent className="dark:bg-black dark:text-white dark:border-zinc-900">
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
      <Label className="text-left w-full mt-6 mb-2 text-black">
        Sizes & Quantity
      </Label>
      <div className="grid grid-cols-2 gap-4">
        {sizeOptions.map((size) => (
          <div key={size} className="flex flex-col">
            <Label htmlFor={`size-${size}`} className="text-sm dark:text-white">
              {size.toUpperCase()}
            </Label>
            <Input
              id={`size-${size}`}
              type="number"
              min={0}
              name={size}
              value={newProduct.productSize?.[size] ?? 0}
              onChange={(e) => onSizeChange(size, e.target.value)}
              className="dark:bg-zinc-900 dark:text-white dark:border-zinc-900"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCreateProduct;
