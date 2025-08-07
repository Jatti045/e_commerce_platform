import React from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const AdminPieChart = ({ dataType = "orderStatus" }) => {
  const { orderStatusDistribution = [], categoryPerformance = [] } =
    useSelector((state) => state.admin);

  const data =
    dataType === "orderStatus" ? orderStatusDistribution : categoryPerformance;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {dataType === "orderStatus"
              ? "No order status data available"
              : "No category data available"}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Data will appear here once orders are placed
          </p>
        </div>
      </div>
    );
  }

  // Colors for different segments
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const config =
    dataType === "orderStatus"
      ? {
          pending: { label: "Pending", color: "hsl(var(--chart-1))" },
          processing: { label: "Processing", color: "hsl(var(--chart-2))" },
          shipped: { label: "Shipped", color: "hsl(var(--chart-3))" },
          delivered: { label: "Delivered", color: "hsl(var(--chart-4))" },
          cancelled: { label: "Cancelled", color: "hsl(var(--chart-5))" },
        }
      : {
          category: { label: "Category", color: "hsl(var(--chart-1))" },
        };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataType === "orderStatus" ? "count" : "revenue"}
            nameKey={dataType === "orderStatus" ? "status" : "category"}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AdminPieChart;
