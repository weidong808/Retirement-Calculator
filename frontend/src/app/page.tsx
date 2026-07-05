import type { Metadata } from "next";
import "./globals.css";
import { CalculatorApp } from "@/components/CalculatorApp";

export const metadata: Metadata = {
  title: "Retirement Calculator Pro",
  description: "Comprehensive retirement planning calculator for US workers",
};

export default function Home() {
  return <CalculatorApp />;
}
