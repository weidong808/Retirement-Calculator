import type { Metadata } from "next";
import { CalculatorApp } from "@/components/CalculatorApp";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${APP_NAME} — Plan Your Retirement`,
};

export default function Home() {
  return <CalculatorApp />;
}
