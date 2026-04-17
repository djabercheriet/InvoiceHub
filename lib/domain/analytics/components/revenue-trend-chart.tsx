"use client";

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface RevenueTrendData {
  date: string;
  billed?: number;
  received?: number;
  forecastBilled?: number;
  forecastReceived?: number;
}

export function RevenueTrendChart({ companyId }: { companyId: string }) {
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [forecastData, setForecastData] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/analytics/revenue-trend?companyId=${companyId}`);
        const json = await res.json();
        setData(json.data);
      } catch (error) {
        console.error("Failed to fetch revenue trend:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId]);

  const handleToggleForecast = async () => {
    if (showForecast) {
      setShowForecast(false);
      return;
    }

    if (forecastData.length > 0) {
      setShowForecast(true);
      return;
    }

    setLoadingForecast(true);
    try {
      const res = await fetch(`/api/ai/forecast`);
      const json = await res.json();

      const formatted = json.map((f: any) => ({
        date: f.date,
        forecastBilled: f.billed,
        forecastReceived: f.received
      }));
      setForecastData(formatted);
      setShowForecast(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const chartData = showForecast ? [...data, ...forecastData] : data;

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold">Revenue Strategy: Billed vs Received</CardTitle>
          <CardDescription>Comparison of invoiced totals vs. actual cash collected per month</CardDescription>
        </div>
        <Button
          variant={showForecast ? "default" : "outline"}
          size="sm"
          onClick={handleToggleForecast}
          disabled={loadingForecast}
          className={showForecast
            ? "h-8 gap-1.5 font-bold tracking-tight bg-indigo-600 hover:bg-indigo-700 text-white"
            : "h-8 gap-1.5 font-bold tracking-tight bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30"}
        >
          {loadingForecast ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {showForecast ? "Hide Forecast" : "AI Forecast"}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
            <Area
              type="monotone"
              dataKey="billed"
              name="Billed (Revenue)"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorBilled)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="received"
              name="Received (Cash Flow)"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorReceived)"
              strokeWidth={3}
            />
            {showForecast && (
              <>
                <Area
                  type="monotone"
                  dataKey="forecastBilled"
                  name="Projected Billed"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="forecastReceived"
                  name="Projected Received"
                  stroke="#6366f1"
                  fillOpacity={0}
                  fill="none"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
