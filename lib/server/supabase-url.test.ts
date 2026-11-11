import { describe, expect, it } from "vitest";
import { buildSupabaseRestaurantUrl, supabaseContainsPattern } from "@/lib/server/restaurants";

const config = { url: "https://example.supabase.co" };
const orFilter = (q: string) =>
  new URL(buildSupabaseRestaurantUrl(config, { q })).searchParams.get("or");

describe("supabaseContainsPattern", () => {
  it("quotes the term so filter punctuation stays literal", () => {
    expect(supabaseContainsPattern("Joe's, Pizza (Bklyn)")).toBe(`"*Joe's, Pizza (Bklyn)*"`);
  });

  it("escapes quotes and backslashes", () => {
    expect(supabaseContainsPattern('say "hi" \\ bye')).toBe(`"*say \\"hi\\" \\\\ bye*"`);
  });

  it("drops the user's own wildcards", () => {
    expect(supabaseContainsPattern("a*b%c")).toBe(`"*a b c*"`);
  });
});

describe("buildSupabaseRestaurantUrl", () => {
  it("builds one quoted ilike condition per searchable column", () => {
    expect(orFilter("a,b")).toBe(
      `(name.ilike."*a,b*",cuisine.ilike."*a,b*",neighborhood.ilike."*a,b*",borough.ilike."*a,b*",search_text.ilike."*a,b*")`
    );
  });

  it("cannot inject an extra filter through the search term", () => {
    const filter = orFilter('x*",grade.eq.C,name.ilike."*y') ?? "";
    // Five conditions, all on the searchable columns: the injected grade filter stays inside a quoted value.
    const conditions = filter.match(/(?:^\(|,)(\w+)\.ilike\."/g) ?? [];
    expect(conditions).toHaveLength(5);
    expect(filter).toContain('\\"');
  });
});
