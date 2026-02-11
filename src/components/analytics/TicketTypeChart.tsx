"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TicketTypeChartProps {
  data: Array<{
    type: string;
    count: number;
  }>;
}

const COLORS: Record<string, string> = {
  FREE_LIST: "#10b981", // verde
  DOOR_ONLY: "#f59e0b", // giallo
  PRE_SALE: "#3b82f6", // blu
  FULL_TICKET: "#ef4444", // rosso
  FREE: "#6ee7b7",
  LIST: "#fde047",
  PAID: "#f87171",
};

const LABELS: Record<string, string> = {
  FREE_LIST: "Evento Gratuito",
  DOOR_ONLY: "Pagamento Botteghino",
  PRE_SALE: "Prevendita",
  FULL_TICKET: "Biglietto Intero",
  FREE: "Gratuito (Legacy)",
  LIST: "Lista (Legacy)",
  PAID: "Pagato (Legacy)",
};

export function TicketTypeChart({ data }: TicketTypeChartProps) {
  const chartData = data.map((item) => ({
    name: LABELS[item.type] || item.type,
    value: item.count,
    color: COLORS[item.type] || "#94a3b8",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎫 Distribuzione Tipologie Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
