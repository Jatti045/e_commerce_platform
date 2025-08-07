import { Input } from "@/components/ui/input";
import ProductCards from "@/components/product/ProductCards";
import { fetchProductsFromQuery } from "@/store/slices/product-slice";
import { SEOHead } from "@/components/seo";
import {
  Loader2,
  ArrowDownUp,
  Frown,
  Filter,
  Check,
  Search,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Memoize URL params parsing
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const category = queryParams.get("category");
  const type = queryParams.get("type");
  const sort = queryParams.get("sort");

  const [userSearch, setUserSearch] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { filteredProductsByQuery, isProductSliceLoadingState } = useSelector(
    (state) => state.product
  );

  // Memoized product types for better performance
  const productTypes = useMemo(
    () => [
      { value: "shirt", label: "Shirts" },
      { value: "shoes", label: "Shoes" },
      { value: "pants", label: "Pants" },
      { value: "accessories", label: "Accessories" },
      { value: "jackets", label: "Jackets" },
      { value: "hoodies", label: "Hoodies" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "asc", label: "Price: Low To High", sortKey: "price" },
      { value: "desc", label: "Price: High To Low", sortKey: "price" },
    ],
    []
  );

  useEffect(() => {
    const getProductsFromQuery = async () => {
      try {
        await dispatch(fetchProductsFromQuery({ category, type, sort }));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    getProductsFromQuery();
  }, [category, type, sort, dispatch]);

  const updateQuery = useCallback(
    (newParams) => {
      const searchParams = new URLSearchParams(location.search);
      Object.keys(newParams).forEach((key) => {
        if (newParams[key] === null) searchParams.delete(key);
        else searchParams.set(key, newParams[key]);
      });

      navigate(`?${searchParams.toString()}`);
    },
    [location.search, navigate]
  );

  // Memoized filtered products for better performance
  const filteredProductsBySearch = useMemo(() => {
    if (!filteredProductsByQuery || filteredProductsByQuery.length === 0) {
      return [];
    }

    if (!userSearch.trim()) {
      return filteredProductsByQuery;
    }

    return filteredProductsByQuery.filter((product) =>
      product.productName
        .toLowerCase()
        .replace(/[^a-zA-Z]/g, "")
        .includes(userSearch.toLowerCase().replace(/[^a-zA-Z]/g, ""))
    );
  }, [filteredProductsByQuery, userSearch]);

  // Loading state with proper spinner
  if (isProductSliceLoadingState || isInitialLoad) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg font-medium dark:text-white">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Search Products - Billify | Find Your Perfect Item"
        description="Search through thousands of premium fashion products at Billify. Find exactly what you're looking for in our extensive collection of clothing, accessories, and more."
        keywords="search products, billify search, find fashion, product search, clothing search, accessories search, ecommerce search, vercel search"
        canonicalUrl="/user/search"
      />
      <div className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 dark:bg-gradient-to-b min-h-screen dark:from-black dark:to-zinc-900 dark:text-white">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-zinc-700 pb-4 mb-8">
          <div>
            <h1 className="text-2xl mt-6 md:mt-0 sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Search Products
            </h1>
            {filteredProductsBySearch && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredProductsBySearch.length} product
                {filteredProductsBySearch.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  <ArrowDownUp size={16} />
                  Sort By
                  {sort && <Check size={14} className="text-green-500" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() =>
                      updateQuery({ sort: option.value, type: null })
                    }
                    className="dark:hover:bg-zinc-700 flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    {sort === option.value && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="dark:bg-zinc-700" />
                <DropdownMenuItem
                  onClick={() => updateQuery({ sort: null })}
                  className="dark:hover:bg-zinc-700 flex items-center justify-between"
                >
                  <span>Default Order</span>
                  {!sort && <Check size={16} className="text-green-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  <Filter size={16} />
                  Filter
                  {type && <Check size={14} className="text-green-500" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                {productTypes.map((productType) => (
                  <DropdownMenuItem
                    key={productType.value}
                    onClick={() =>
                      updateQuery({ type: productType.value, sort: null })
                    }
                    className="dark:hover:bg-zinc-700 flex items-center justify-between"
                  >
                    <span>{productType.label}</span>
                    {type === productType.value && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="dark:bg-zinc-700" />
                <DropdownMenuItem
                  onClick={() => updateQuery({ type: null, sort: null })}
                  className="dark:hover:bg-zinc-700 flex items-center justify-between"
                >
                  <span>Show All</span>
                  {!type && <Check size={16} className="text-green-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <Input
              className="pl-10 py-3 text-lg dark:bg-zinc-900 dark:text-white dark:placeholder-gray-400 dark:border-zinc-700 border-gray-300 focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Search for products..."
              type="text"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProductsBySearch && filteredProductsBySearch.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredProductsBySearch.map((product) => (
              <div key={product._id} className="w-full flex justify-center">
                <ProductCards product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="text-center max-w-md mx-auto">
              <Frown className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {userSearch.trim()
                  ? `No products match "${userSearch}". Try a different search term or adjust your filters.`
                  : "No products match your selected filters. Try adjusting your search criteria or browse all products."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {userSearch.trim() && (
                  <Button
                    onClick={() => setUserSearch("")}
                    variant="outline"
                    className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setUserSearch("");
                    updateQuery({ type: null, sort: null, category: null });
                  }}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
