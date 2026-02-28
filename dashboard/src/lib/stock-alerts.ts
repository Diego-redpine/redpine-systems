import { SupabaseClient } from '@supabase/supabase-js';

export interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
}

export async function checkLowStock(userId: string, supabase: SupabaseClient): Promise<LowStockItem[]> {
  const { data } = await supabase
    .from('packages')
    .select('id, name, quantity, low_stock_threshold')
    .eq('user_id', userId)
    .eq('item_type', 'product')
    .not('quantity', 'is', null)
    .order('quantity', { ascending: true });

  return (data || []).filter(
    (p: any) => p.quantity <= (p.low_stock_threshold || 10)
  ) as LowStockItem[];
}
