import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllOrders } from "@/store/slices/product-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frown, Eye, Truck, CheckCircle, Loader2 } from "lucide-react";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, isProductSliceLoadingState: isLoading } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const formatDate = (iso) => new Date(iso).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg font-medium dark:text-white">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-900 p-6 overflow-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold dark:text-white">Orders</h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <Frown size={48} className="mb-4" />
          <p className="text-lg">There are currently no orders to display</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-100 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-950 divide-y divide-gray-200 dark:divide-zinc-700">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center gap-1">
                    {order.status === "shipped" ? (
                      <CheckCircle className="text-green-500" />
                    ) : (
                      <Truck className="text-yellow-500" />
                    )}
                    <span className="capitalize dark:text-gray-200 text-gray-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-left text-gray-800 dark:text-gray-200">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;
