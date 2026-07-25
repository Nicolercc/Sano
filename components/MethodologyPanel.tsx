export default function MethodologyPanel() {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-moss">
          Methodology and limitations
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">
          How Sano turns inspection history into plain-language context
        </h1>
        <p className="mt-4 text-sm leading-6 text-ink/70">
          Public grades compress years of inspections into a letter on the door.
          Sano reads the same kind of inspection fields a diner could look up and
          surfaces trajectory, repeat patterns, and how much history backs the
          view. It is context for comparison — not a safety verdict.
        </p>
      </div>

      <section className="mt-6 rounded-md border border-amber/30 bg-amber/10 p-4">
        <h2 className="text-lg font-bold text-ink">Demo data disclosure</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          The restaurants in this demo are a hand-authored seed shaped to match
          NYC DOHMH inspection fields (names, grades, violation codes, dates).
          They are illustrative for product and scoring UX — not live extracts
          from the official dataset, and not claims about specific real
          businesses. When live ingestion is wired, this page will describe that
          source and freshness instead.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">What the fields mean</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Sano is built around NYC DOHMH-style fields: restaurant identity,
            cuisine, borough, inspection dates, scores, grades, violation codes,
            descriptions, and critical flags. Popularity signals (ratings, review
            counts) sit beside that history so you can see when the two diverge.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Reliability score</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            A rules-based 0–100 signal derived from average and recent inspection
            burden, critical flags, repeat patterns, volatility, and improvement.
            Lower official inspection scores (fewer points against the restaurant)
            generally raise the derived reliability number. Example: a place with
            a recent critical flag and a repeat pattern scores lower than one with
            a clean recent cycle and a steady trajectory.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Confidence</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Confidence tracks history depth in this demo: more inspections mean
            higher confidence. Limited history gets restrained labels (often
            &ldquo;Limited data&rdquo;) so thin records are not over-interpreted.
            Confidence is not proof the data is complete, current, or
            error-free — only a cue about how much timeline we have to work with.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Trust gap</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Trust gap is the spread between popularity percentile and inspection
            reliability percentile inside this small demo cohort — not citywide
            ranking. A high public rating with a weaker inspection trajectory
            shows a larger gap. Treat it as a directional contrast within the
            seed, not a statistical claim about NYC restaurants overall.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-md bg-oat p-4">
        <h2 className="text-lg font-bold text-ink">How to read alternatives</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Suggested alternatives highlight places in the demo set with stronger
          derived trajectory or confidence signals. They are directional
          comparison aids — not an endorsement that one restaurant is healthier,
          cleaner, or officially preferred over another.
        </p>
      </section>

      <section className="mt-6 rounded-md border border-coral/20 bg-coral/10 p-4">
        <h2 className="text-lg font-bold text-ink">What Sano does not claim</h2>
        <ul className="mt-2 grid gap-2 text-sm leading-6 text-ink/70">
          <li>
            No &ldquo;safe,&rdquo; &ldquo;unsafe,&rdquo; &ldquo;dangerous,&rdquo;
            or &ldquo;sick&rdquo; language — only neutral history labels.
          </li>
          <li>
            Derived scores and labels are Sano context, not official NYC grades
            or consumer ratings.
          </li>
          <li>
            Public records do not prove causation; a critical flag is a recorded
            finding, not a prediction of future risk.
          </li>
          <li>
            The current grade stays visible next to Sano context so official and
            derived signals are not confused.
          </li>
          <li>
            Recency and confidence stay on the page so thin or older history is
            obvious.
          </li>
        </ul>
      </section>
    </article>
  );
}
