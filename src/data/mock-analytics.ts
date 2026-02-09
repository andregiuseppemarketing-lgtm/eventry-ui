export interface AnalyticsData {
  totalRevenue: number;
  averageTicketPrice: number;
  conversionRate: number;
  topEvent: {
    name: string;
    revenue: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  ticketTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export const mockAnalyticsData: AnalyticsData = {
  totalRevenue: 65420.50,
  averageTicketPrice: 35.42,
  conversionRate: 12.8,
  topEvent: {
    name: 'Summer Music Festival 2024',
    revenue: 28450.00,
  },
  revenueByMonth: [
    { month: 'Gen', revenue: 12500 },
    { month: 'Feb', revenue: 15200 },
    { month: 'Mar', revenue: 18900 },
    { month: 'Apr', revenue: 22100 },
    { month: 'Mag', revenue: 19800 },
    { month: 'Giu', revenue: 24300 },
  ],
  ticketTypeDistribution: [
    { type: 'Standard', count: 1245, percentage: 67.4 },
    { type: 'VIP', count: 412, percentage: 22.3 },
    { type: 'Early Bird', count: 190, percentage: 10.3 },
  ],
};
