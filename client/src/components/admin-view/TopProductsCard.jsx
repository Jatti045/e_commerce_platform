import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign } from "lucide-react";

const TopProductsCard = () => {
  const { topProducts = [] } = useSelector((state) => state.admin);

  if (!topProducts || topProducts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center">
            <div>
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No product data available
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Data will appear here once orders are placed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={product._id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-32">
                    {product.productName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.totalSold} sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {typeof product.revenue === "number"
                    ? product.revenue.toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;
