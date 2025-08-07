import { useSelector, useDispatch } from "react-redux";
import ProductCards from "@/components/product/ProductCards";
import UserShopByCategory from "@/components/user-view/UserShopByCategory";
import UserShopByType from "@/components/user-view/UserShopByType";
import UserHeader from "@/components/user-view/UserHeader";
import { SEOHead } from "@/components/seo";
import { fetchAllProducts } from "@/store/slices/product-slice";
import { Loader2, Frown } from "lucide-react";
import { useEffect, useState } from "react";

const UserHomepage = () => {
  const dispatch = useDispatch();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const productState = useSelector((state) => state.product);
  const { products, isProductSliceLoadingState } = productState;

  // Ensure products are fetched if not already loaded
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!products || products.length === 0) {
          await dispatch(fetchAllProducts());
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchProducts();
  }, [dispatch, products]);

  return (
    <>
      <SEOHead
        title="Billify - Premium E-commerce Platform | Shop Fashion Online"
        description="Welcome to Billify - your premier destination for online fashion shopping. Discover quality products for men, women, kids, and unisex categories. Fast shipping, secure payments, and exceptional customer service."
        keywords="billify, ecommerce, online shopping, vercel, fashion store, premium clothing, men fashion, women fashion, kids clothing, unisex fashion, secure shopping, fast delivery, fashion trends"
        canonicalUrl="/user/home"
        type="website"
      />
      <div>
        <UserHeader />
        <div className="dark:bg-gradient-to-b from-zinc-900 to-black dark:text-white bg-slate-50 py-10 ">
          <UserShopByCategory />
          <UserShopByType />
        </div>
      </div>
      <div className="bg-gradient-to-b from-gray-50 to-white dark:bg-gradient-to-b dark:from-black dark:to-zinc-900 dark:text-white">
        {/* Header Section */}
        <div className="text-center px-4 sm:px-6 lg:px-10 pt-10 pb-6">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
            Discover Our Exclusive Collection
          </h1>
        </div>

        {/* Products Grid */}
        {isProductSliceLoadingState || isInitialLoad ? (
          <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
              <p className="text-lg font-medium dark:text-white">
                Loading products...
              </p>
            </div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-10">
            {products.map((product) => (
              <div key={product._id} className="w-full">
                <ProductCards product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
            <div className="text-center max-w-md mx-auto">
              <Frown className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No products are currently available. Please check back later or
                contact support if this persists.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserHomepage;
