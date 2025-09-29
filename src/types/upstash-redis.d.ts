// Type shim for @upstash/redis if type declarations are not picked up
declare module '@upstash/redis' {
  interface RedisConfig { url: string; token: string; }
  export class Redis {
    constructor(config: RedisConfig);
    get<T=any>(key: string): Promise<T | null>;
    set(key: string, value: any): Promise<any>;
    hgetall(key: string): Promise<any>;
    hset(key: string, data: Record<string, unknown>): Promise<any>;
    del(key: string): Promise<any>;
    scan(cursor: number): Promise<[number, string[]]>;
  }
}
