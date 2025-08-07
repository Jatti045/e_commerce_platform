import React from "react";
import { Card } from "@/components/ui/card";

const MetricCard = ({ icon, label, value, color, trend, trendValue }) => {
  return (
    <Card className="p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 card-animation group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center mt-1 text-xs ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {trend === "up" && <span>↗</span>}
                {trend === "down" && <span>↘</span>}
                {trendValue && <span className="ml-1">{trendValue}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
