"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface QuizAverage {
  quiz: string;
  average: number;
}

interface QuizAverageChartProps {
  quizStats: QuizAverage[];
}

export default function QuizAverageChart({ quizStats }: QuizAverageChartProps) {
  //console.log("Quiz Stats:", quizStats);
  return (
    <div className="w-full flex justify-center items-center bg-white">
      <ResponsiveContainer width="90%" height={250}>
        <LineChart
          data={quizStats}
          margin={{ top: 30, right: 30, bottom: 30, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="quiz"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[70, 90]}
            tick={{ fontSize: 12 }}
            label={{
              value: "Average %",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#4C8C2B"
            strokeWidth={3}
            dot={{ r: 5, fill: "#4C8C2B", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#113604" }}
          ></Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
