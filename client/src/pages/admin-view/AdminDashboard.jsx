import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboardData } from "@/store/slices/admin-slice";
import AdminChart from "@/components/admin-view/AdminChart";
import AdminPieChart from "@/components/admin-view/AdminPieChart";
import TopProductsCard from "@/components/admin-view/TopProductsCard";
import RecentActivityChart from "@/components/admin-view/RecentActivityChart";
import MetricCard from "@/components/admin-view/MetricCard";
import {
  BadgeDollarSign,
  BringToFront,
  Users,
  Layers,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    totalSales,
    totalOrders,
    totalUsers,
    totalProducts,
    isAdminStateLoading,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboardData());
  }, [dispatch]);

  if (isAdminStateLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg font-medium dark:text-white">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      id: "sales",
      icon: <BadgeDollarSign size={28} />,
      label: "Total Sales",
      value: `$${totalSales.toLocaleString()}`,
      color:
        "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    },
    {
      id: "orders",
      icon: <BringToFront size={28} />,
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      id: "users",
      icon: <Users size={28} />,
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      color:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    },
    {
      id: "products",
      icon: <Layers size={28} />,
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      color:
        "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-900 p-6 overflow-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(fetchAdminDashboardData())}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </header>

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<BadgeDollarSign size={28} />}
          label="Total Sales"
          value={`$${totalSales.toLocaleString()}`}
          color="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
        />
        <MetricCard
          icon={<BringToFront size={28} />}
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          icon={<Users size={28} />}
          label="Total Users"
          value={totalUsers.toLocaleString()}
          color="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          icon={<Layers size={28} />}
          label="Total Products"
          value={totalProducts.toLocaleString()}
          color="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
        />
      </section>

      {/* Main Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium dark:text-white">
              Sales Overview
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly revenue trends
            </p>
          </CardHeader>
          <AdminChart />
        </Card>
        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium dark:text-white">
              Orders Trend
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly order volume
            </p>
          </CardHeader>
          <AdminChart showOrdersOnly />
        </Card>
      </section>

      {/* Additional Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium dark:text-white">
              Order Status Distribution
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current order statuses
            </p>
          </CardHeader>
          <AdminPieChart dataType="orderStatus" />
        </Card>

        <TopProductsCard />

        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium dark:text-white">
              Category Performance
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Revenue by category
            </p>
          </CardHeader>
          <AdminPieChart dataType="category" />
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium dark:text-white">
              Recent Activity (Last 7 Days)
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily orders and revenue trends
            </p>
          </CardHeader>
          <RecentActivityChart />
        </Card>
      </section>
    </main>
  );
};

export default AdminDashboard;
