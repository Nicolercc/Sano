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
        <h2 className="text-lg font-bold text-ink">Official data disclosure</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          The restaurants in this demo come from a curated offline extract
          generated from NYC DOHMH Restaurant Inspection Results. The extract is
          not live synchronization, not comprehensive citywide coverage, and not
          an official NYC rating. Sano prepares public inspection records into an
          app-ready layer and keeps a synthetic fallback only for failure
          containment.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">What the fields mean</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Sano is built around NYC DOHMH-style fields: restaurant identity,
            cuisine, borough, inspection dates, scores, grades, violation codes,
            descriptions, and critical flags. The official inspection source does
            not include public rating, review count, or price metadata, so those
            popularity signals are shown as unavailable unless a separate source
            is added later.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Reliability score</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            A rules-based 0–100 signal computed from the inspection history.
            Official inspection scores count points against a restaurant, so
            lower inspection scores raise it. It starts at 100 and subtracts:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-ink/70">
            <li>1.7 × the average inspection score</li>
            <li>0.6 × the most recent inspection score</li>
            <li>4 for every critical flag in the history</li>
            <li>5 for every inspection that repeats a violation code cited at an earlier inspection</li>
            <li>12 if the trajectory is volatile</li>
          </ul>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            It adds 7 if the trajectory is improving, then rounds and keeps the
            result between 0 and 100. A long or troubled history can reach 0
            even when the current letter grade is an A; the grade on the door
            is shown alongside so the two are never confused.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Trajectory and confidence</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            <strong className="text-ink">Trajectory</strong> needs at least
            three inspections (otherwise it reads as stable). Any jump of 12 or
            more points between consecutive inspections makes it volatile.
            Otherwise Sano compares the average of the earlier half of the
            history with the later half: 4 or more points lower is improving,
            4 or more points higher is declining, anything in between is
            stable.
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            <strong className="text-ink">Confidence</strong> is history depth:
            five or more inspections is high, three or four is medium, fewer is
            limited. It is not proof the data is complete, current, or
            error-free — only a cue about how much timeline there is.
          </p>
        </section>

        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Review matching</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Consumer ratings and review counts stay unavailable until a reviewed
            source is attached to the record. In the official DOHMH-only mode,
            Sano does not invent popularity signals or blend them into the
            inspection score.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-md bg-oat p-4">
        <h2 className="text-lg font-bold text-ink">Labels</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Each restaurant gets the first label that applies, in this order:
        </p>
        <ol className="mt-2 list-decimal pl-5 text-sm leading-6 text-ink/70">
          <li><strong className="text-ink">Recent critical flag</strong>: either of the two latest inspections has a critical flag.</li>
          <li><strong className="text-ink">Limited data</strong>: fewer than three inspections.</li>
          <li><strong className="text-ink">Volatile history</strong>: a volatile trajectory or a reliability score below 62.</li>
          <li><strong className="text-ink">Improving record</strong>: an improving trajectory.</li>
          <li><strong className="text-ink">Consistent record</strong>: everything else.</li>
        </ol>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          <strong className="text-ink">Worked example.</strong> Inspection
          scores of 41, 2, 0 and 2 (oldest first), with two critical flags at
          the first inspection and no repeats. The jump from 41 to 2 makes it
          volatile. 100 − 1.7 × 11.25 − 0.6 × 2 − 2 × 4 − 12 = 59.7, which
          rounds to 60. The latest two inspections have no critical flags and
          there are four inspections, so the label is Volatile history (volatile
          trajectory).
        </p>
      </section>

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
