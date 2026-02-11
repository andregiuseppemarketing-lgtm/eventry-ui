"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopEventsChartProps {
  data: Array<{
    id: string;
    title: string;
    ticketsSold: number;
  }>;
}

export function TopEventsChart({ data }: TopEventsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Top 5 Eventi per Biglietti Venduti</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="title"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="ticketsSold" fill="#3b82f6" name="Biglietti" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
