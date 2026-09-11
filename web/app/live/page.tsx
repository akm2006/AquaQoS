import type { Metadata } from "next";
import LiveSession from "./LiveSession";

export const metadata: Metadata = { title: "Live local execution" };

export default function LivePage() {
  return <LiveSession />;
}
