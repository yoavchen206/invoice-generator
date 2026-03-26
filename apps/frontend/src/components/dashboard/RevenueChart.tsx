import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendDataPoint } from '@yoavchu/shared';
import { formatCurrency } from '@/lib/formatCurrency';

interface RevenueChartProps {
  data: TrendDataPoint[];
}

interface TooltipPayload {
  value: number;
  name: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border-default rounded-md p-3 shadow-lg">
        <p className="text-body-sm text-text-secondary mb-1">{label}</p>
        <p className="text-body font-semibold text-accent-primary">
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-caption text-text-muted">
          {payload[1]?.value} invoices
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#8A9BB0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#8A9BB0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61, 214, 140, 0.05)' }} />
          <Bar dataKey="earned" fill="#3DD68C" radius={[4, 4, 0, 0]} />
          <Bar dataKey="invoiceCount" fill="#2EBDB8" radius={[4, 4, 0, 0]} hide />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
