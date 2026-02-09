export interface DashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeUsers: number;
}

export const mockStats: DashboardStats = {
  totalEvents: 12,
  totalTicketsSold: 1847,
  totalRevenue: 65420.50,
  activeUsers: 3421
};
