import { NextResponse } from 'next/server';
import { forecastingService } from '@/lib/domain/inventory/forecasting.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const companyId = searchParams.get('companyId');

  if (!productId || !companyId) {
    return NextResponse.json({ error: 'Product ID and Company ID are required' }, { status: 400 });
  }

  try {
    const forecast = await forecastingService.getProductForecast(productId, companyId);
    return NextResponse.json({ data: forecast });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
