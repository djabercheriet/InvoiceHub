import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { gatherBusinessContext } from './context';

export const aiService = {
  /**
   * Analyzes company context and returns formal, actionable business advice.
   */
  async getBusinessAdvice(companyId: string) {
    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error('Missing Google API Key');
      }

      const context = await gatherBusinessContext(companyId);

      const insightsSchema = z.object({
        overview: z.string().describe("A professional, formal 1-2 sentence executive summary of the business's current state."),
        insights: z.array(z.object({
          type: z.enum(['warning', 'success', 'opportunity', 'info']),
          title: z.string().describe("Short, professional title"),
          description: z.string().describe("Formal explanation of the insight based directly on provided numbers."),
          recommendedAction: z.string().optional().describe("A specific action to take (e.g. 'Generate Payment Reminder', 'Create Draft PO')"),
          actionPayload: z.record(z.any()).optional().describe("Associated data required for the action (like invoiceId or productId)")
        })).min(1).max(3)
      });

      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: insightsSchema,
        prompt: `You are a formal, highly analytical corporate financial advisor for a B2B business.
Review the following real-time business data and provide 2-3 highly actionable insights.
Always maintain a professional, corporate tone. Do not use generic advice, refer strictly to the numbers provided.
If there are overdue invoices, suggest sending a payment reminder. If there is low stock, suggest restocking.

Company Data Context:
${JSON.stringify(context, null, 2)}`
      });

      return object;
    } catch (e: any) {
      console.error("[AI Advisor Error]", e.message);
      return {
        overview: "AI Advisor is currently unavailable. Please ensure your Google Gemini API key is configured.",
        insights: []
      };
    }
  },

  /**
   * Forecasts the next 3 months of revenue based on historical trend data.
   */
  async getForecast(trendData: { date: string; billed: number; received: number }[]) {
    if (trendData.length < 2) return [];

    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
         throw new Error('Missing Google API Key');
      }

      const forecastSchema = z.object({
        forecast: z.array(z.object({
          date: z.string().describe("Next month name, e.g. 'Oct 2026'"),
          billed: z.number().describe("Projected billed revenue"),
          received: z.number().describe("Projected received revenue")
        }))
      });

      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: forecastSchema,
        prompt: `Based on the following historical monthly revenue data, forecast the next 3 months.
Take into account any growth trajectories or seasonal trends from the data.
Keep the projections realistic and mathematically sound.

Historical Data:
${JSON.stringify(trendData, null, 2)}`
      });

      return object.forecast;
    } catch (e) {
      console.error("[AI Forecast Error]", e);
      return [];
    }
  }
};
