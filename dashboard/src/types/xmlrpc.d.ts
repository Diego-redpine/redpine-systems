declare module 'xmlrpc' {
  interface ClientOptions {
    host: string;
    port: number;
    path: string;
  }

  interface Client {
    methodCall(
      method: string,
      params: unknown[],
      callback: (error: Error | null, value: unknown) => void
    ): void;
  }

  export function createClient(options: ClientOptions): Client;
  export function createSecureClient(options: ClientOptions): Client;
}
