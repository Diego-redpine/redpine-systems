import xmlrpc from 'xmlrpc';

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

interface OdooClient {
  uid: number;
  config: OdooConfig;
}

// Create XML-RPC clients
function createClient(url: string, path: string) {
  const urlObj = new URL(url);
  const isSecure = urlObj.protocol === 'https:';
  const port = urlObj.port ? parseInt(urlObj.port) : (isSecure ? 443 : 80);

  const clientFn = isSecure ? xmlrpc.createSecureClient : xmlrpc.createClient;
  return clientFn({
    host: urlObj.hostname,
    port,
    path,
  });
}

// Promisify XML-RPC method call
function methodCall(client: xmlrpc.Client, method: string, params: unknown[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

// Authenticate with Odoo
export async function authenticate(config: OdooConfig): Promise<OdooClient | null> {
  try {
    const commonClient = createClient(config.url, '/xmlrpc/2/common');

    const uid = await methodCall(commonClient, 'authenticate', [
      config.db,
      config.username,
      config.password,
      {},
    ]) as number;

    if (!uid) {
      console.error('Odoo authentication failed');
      return null;
    }

    return { uid, config };
  } catch (error) {
    console.error('Odoo connection error:', error);
    return null;
  }
}

// Execute Odoo model method
export async function execute(
  client: OdooClient,
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<unknown> {
  const objectClient = createClient(client.config.url, '/xmlrpc/2/object');

  return methodCall(objectClient, 'execute_kw', [
    client.config.db,
    client.uid,
    client.config.password,
    model,
    method,
    args,
    kwargs,
  ]);
}

// Search and read records
export async function searchRead(
  client: OdooClient,
  model: string,
  domain: unknown[][] = [],
  fields: string[] = [],
  limit: number = 100,
  offset: number = 0,
  order: string = ''
): Promise<Record<string, unknown>[]> {
  const result = await execute(client, model, 'search_read', [domain], {
    fields,
    limit,
    offset,
    order,
  });
  return result as Record<string, unknown>[];
}

// Create record
export async function create(
  client: OdooClient,
  model: string,
  values: Record<string, unknown>
): Promise<number> {
  const result = await execute(client, model, 'create', [values]);
  return result as number;
}

// Update record
export async function write(
  client: OdooClient,
  model: string,
  ids: number[],
  values: Record<string, unknown>
): Promise<boolean> {
  const result = await execute(client, model, 'write', [ids, values]);
  return result as boolean;
}

// Delete record
export async function unlink(
  client: OdooClient,
  model: string,
  ids: number[]
): Promise<boolean> {
  const result = await execute(client, model, 'unlink', [ids]);
  return result as boolean;
}

// Get default Odoo config from environment
export function getDefaultConfig(): OdooConfig {
  return {
    url: process.env.ODOO_URL || 'http://localhost:8069',
    db: process.env.ODOO_DB || 'redpine_dev',
    username: process.env.ODOO_USERNAME || 'admin',
    password: process.env.ODOO_PASSWORD || 'admin',
  };
}

// Helper to get authenticated client
export async function getOdooClient(): Promise<OdooClient | null> {
  const config = getDefaultConfig();
  return authenticate(config);
}
