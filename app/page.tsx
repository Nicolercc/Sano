import SearchShell from "@/components/SearchShell";
import { restaurants } from "@/lib/server/restaurants";

export default function HomePage() {
  return <SearchShell restaurants={restaurants} />;
}
