import { Lato } from "next/font/google";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreHistogramProps {
  scores: number[];
}

export default function ScoreHistogram({ scores }: ScoreHistogramProps) {
  const bins = Array(10).fill(0);
  const binSize = 1 / 10;

  scores.forEach((score) => {
    const index = Math.min(Math.floor(score / binSize), 9);
    bins[index]++;
  });

  const histogramData = bins.map((count, i) => ({
    bin: `${(i + 1) * 10}%`,
    count,
  }));

  return (
    <ResponsiveContainer width="50%" height={300}>
      <BarChart
        data={histogramData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="bin"
          tick={{
            fontSize: 14,
            fill: "#333",
            fontFamily: "Lato",
            fontWeight: 500,
          }}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#6aa84f" radius={[12, 12, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
