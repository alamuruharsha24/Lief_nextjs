import type React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
}

export const BarChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = false,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray={showGridLines ? "3 3" : "0"} stroke="#e0e0e0" />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#e0e0e0" }}
            axisLine={{ stroke: "#e0e0e0" }}
          />
        )}
        {showYAxis && (
          <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: "#e0e0e0" }} axisLine={{ stroke: "#e0e0e0" }} />
        )}
        <Tooltip
          formatter={valueFormatter ? (value) => [valueFormatter(value), ""] : undefined}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = false,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray={showGridLines ? "3 3" : "0"} stroke="#e0e0e0" />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#e0e0e0" }}
            axisLine={{ stroke: "#e0e0e0" }}
          />
        )}
        {showYAxis && (
          <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: "#e0e0e0" }} axisLine={{ stroke: "#e0e0e0" }} />
        )}
        <Tooltip
          formatter={valueFormatter ? (value) => [valueFormatter(value), ""] : undefined}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1000}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

