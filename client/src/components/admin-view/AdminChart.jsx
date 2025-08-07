import React from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const AdminChart = ({ showOrdersOnly = false }) => {
  // Extract time series data from admin state
  const { revenueByMonth = [], ordersByMonth = [] } = useSelector(
    (state) => state.admin
  );

  const data = showOrdersOnly ? ordersByMonth : revenueByMonth;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {showOrdersOnly
              ? "No order data available"
              : "No sales data available"}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Data will appear here once orders are placed
          </p>
        </div>
      </div>
    );
  }

  // Configuration for ChartContainer
  const config = showOrdersOnly
    ? {
        orders: {
          label: "Orders",
          color: "hsl(var(--chart-1))",
        },
      }
    : {
        revenue: {
          label: "Revenue",
          color: "hsl(var(--chart-2))",
        },
      };

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        {showOrdersOnly ? (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="opacity-30"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="orders"
              radius={[4, 4, 0, 0]}
              fill="hsl(var(--chart-1))"
            >
              <LabelList
                dataKey="orders"
                position="top"
                className="fill-foreground text-xs font-medium"
              />
            </Bar>
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="opacity-30"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "hsl(var(--chart-2))",
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{
                r: 6,
                fill: "hsl(var(--chart-2))",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AdminChart;
