import api from "./api";
import { ApiResponse, FinanceOverview, FinanceTransaction } from "../types";

export const financeService = {
  async getOverview(period?: string) {
    const response = await api.get<ApiResponse<FinanceOverview>>(
      "/admin/finance/overview",
      { params: { period } },
    );
    return response.data;
  },

  async getTransactions(limit?: number) {
    const response = await api.get<ApiResponse<FinanceTransaction[]>>(
      "/admin/finance/transactions",
      { params: { limit } },
    );
    return response.data;
  },
};
