import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { AboutPageContent } from "@/components/AboutPageContent";

export default function AboutPage() {
  return (
    <div className="calculator-shell">
      <AppHeader compact />
      <AboutPageContent />
      <AppFooter />
    </div>
  );
}
