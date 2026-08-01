import API from "./api";
import { API_URL } from "@/lib/config";

export interface PredictionPayload {
  September: number;
  October: number;
  Branch: string;
  Zone: string;
  notes?: string;
}

export interface PredictionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  zone?: string;
  status?: string;
  month?: number;
  year?: number;
  sort_by?: string;
  sort_order?: string;
}

export const predictionService = {
  // Generate prediction (POST /predictions)
  generatePrediction: async (payload: PredictionPayload) => {
    const res = await API.post("/predictions", payload);
    return res.data;
  },

  // Get predictions list (GET /predictions)
  getPredictions: async (params: PredictionQueryParams) => {
    const res = await API.get("/predictions", { params });
    return res.data;
  },

  // Get prediction details (GET /predictions/{id})
  getPredictionById: async (id: number) => {
    const res = await API.get(`/predictions/${id}`);
    return res.data;
  },

  // Update prediction (PUT /predictions/{id})
  updatePrediction: async (id: number, data: any) => {
    const res = await API.put(`/predictions/${id}`, data);
    return res.data;
  },

  // Delete prediction (DELETE /predictions/{id})
  deletePrediction: async (id: number) => {
    const res = await API.delete(`/predictions/${id}`);
    return res.data;
  },

  // Get reports summary (GET /reports/summary)
  getReportsSummary: async () => {
    const res = await API.get("/reports/summary");
    return res.data;
  },

  // Get reports statistics (GET /reports/statistics)
  getReportsStatistics: async () => {
    const res = await API.get("/reports/statistics");
    return res.data;
  },

  // Get reports charts data (GET /reports/charts)
  getReportsCharts: async () => {
    const res = await API.get("/reports/charts");
    return res.data;
  },

  // Export URLs helper
  getExportUrl: (format: "pdf" | "excel" | "csv") => {
    return `${API_URL}/reports/export/${format}`;
  }
};
