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

const quizData: QuizAverage[] = [
  { quiz: "Quiz 1", average: 78 },
  { quiz: "Quiz 2", average: 80 },
  { quiz: "Quiz 3", average: 82 },
  { quiz: "Quiz 4", average: 82 },
  { quiz: "Quiz 5", average: 84 },
  { quiz: "Quiz 6", average: 86 },
];

export default function QuizAverageChart() {
  return (
    <div className="w-full h-[300px] flex justify-center items-center bg-white">
      <ResponsiveContainer width="90%" height={250}>
        <LineChart
          data={quizData}
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
          >
            <LabelList
              dataKey="average"
              position="top"
              style={{ fill: "#113604", fontWeight: "bold", fontSize: 14 }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
