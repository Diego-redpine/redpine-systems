// Delivery provider abstraction
// Currently manual workflow (DoorDash Drive portal)
// Ready for API integration when credentials are configured

export interface DeliveryRequest {
  pickup_address: string;
  dropoff_address: string;
  order_value_cents: number;
  items_count: number;
  customer_name: string;
  customer_phone?: string;
  special_instructions?: string;
}

export interface DeliveryQuote {
  id: string;
  provider: string;
  fee_cents: number;
  estimated_pickup_minutes: number;
  estimated_delivery_minutes: number;
  expires_at: string;
}

export interface DeliveryStatus {
  id: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  driver_name?: string;
  driver_phone?: string;
  tracking_url?: string;
  estimated_delivery_at?: string;
}

export interface DeliveryProvider {
  name: string;
  isConfigured(): boolean;
  createQuote(req: DeliveryRequest): Promise<DeliveryQuote>;
  acceptQuote(quoteId: string): Promise<void>;
  getStatus(deliveryId: string): Promise<DeliveryStatus>;
  cancelDelivery(deliveryId: string): Promise<void>;
}

// DoorDash Drive stub — activated when API credentials are set
export class DoorDashDriveProvider implements DeliveryProvider {
  name = 'doordash_drive';

  isConfigured(): boolean {
    return !!(
      process.env.DOORDASH_DEVELOPER_ID &&
      process.env.DOORDASH_KEY_ID &&
      process.env.DOORDASH_SIGNING_SECRET
    );
  }

  async createQuote(_req: DeliveryRequest): Promise<DeliveryQuote> {
    if (!this.isConfigured()) {
      throw new Error('DoorDash Drive not configured. Set DOORDASH_DEVELOPER_ID, DOORDASH_KEY_ID, DOORDASH_SIGNING_SECRET.');
    }
    // TODO: Implement DoorDash Drive API call
    throw new Error('DoorDash Drive API integration coming soon');
  }

  async acceptQuote(_quoteId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getStatus(_deliveryId: string): Promise<DeliveryStatus> {
    throw new Error('Not implemented');
  }

  async cancelDelivery(_deliveryId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

// Uber Direct stub
export class UberDirectProvider implements DeliveryProvider {
  name = 'uber_direct';

  isConfigured(): boolean {
    return !!(process.env.UBER_CLIENT_ID && process.env.UBER_CLIENT_SECRET);
  }

  async createQuote(_req: DeliveryRequest): Promise<DeliveryQuote> {
    throw new Error('Uber Direct API integration coming soon');
  }

  async acceptQuote(_quoteId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getStatus(_deliveryId: string): Promise<DeliveryStatus> {
    throw new Error('Not implemented');
  }

  async cancelDelivery(_deliveryId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

// Get the configured delivery provider (or null if none)
export function getDeliveryProvider(): DeliveryProvider | null {
  const doordash = new DoorDashDriveProvider();
  if (doordash.isConfigured()) return doordash;

  const uber = new UberDirectProvider();
  if (uber.isConfigured()) return uber;

  return null;
}
