import SearchShell from "@/components/SearchShell";
import { restaurants } from "@/lib/mock-data";

export default function HomePage() {
  return <SearchShell restaurants={restaurants} />;
}
