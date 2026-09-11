export const num = (n: string | number | bigint) =>
  BigInt(n).toLocaleString("en-US");
export const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;
