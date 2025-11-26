import { create } from 'zustand';

interface StatisticsState {
  totalPaid: number;
  totalPending: number;
  totalLate: number;
  activeContrats: number;
  occupancyRate: number;
  initializeStatistics: (stats: {
    totalPaid: number;
    totalPending: number;
    totalLate: number;
    activeContrats: number;
    occupancyRate: number;
  }) => void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
  totalPaid: 0,
  totalPending: 0,
  totalLate: 0,
  activeContrats: 0,
  occupancyRate: 0,

  initializeStatistics: (stats) => {
    set({
      totalPaid: stats.totalPaid,
      totalPending: stats.totalPending,
      totalLate: stats.totalLate,
      activeContrats: stats.activeContrats,
      occupancyRate: stats.occupancyRate,
    });
  },
}));
