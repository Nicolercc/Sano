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
          Sano is designed to interpret official inspection-history fields alongside
          familiar discovery signals. The MVP uses a stable app-ready seed so the
          experience does not depend on live APIs during a demo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Data source</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The ingestion path targets NYC DOHMH Restaurant Inspection Results fields:
            restaurant identifiers, business names, cuisine, borough, inspection dates,
            scores, grades, violation codes, descriptions, and critical flags.
          </p>
        </section>
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Reliability score</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The score is rules-based. It weighs inspection burden, recent score,
            critical flags, repeated patterns, volatility, and improvement. Lower raw
            inspection scores generally improve the derived reliability signal.
          </p>
        </section>
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Confidence</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Confidence reflects history depth and data freshness. Records with limited
            inspection history should show restrained labels and avoid strong
            interpretation.
          </p>
        </section>
        <section className="rounded-md bg-oat p-4">
          <h2 className="text-lg font-bold text-ink">Trust gap</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Trust gap compares popularity percentile with inspection reliability
            percentile inside the demo cohort. A high rating with weaker inspection
            history creates a larger gap.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-md border border-coral/20 bg-coral/10 p-4">
        <h2 className="text-lg font-bold text-ink">Ethical display rules</h2>
        <ul className="mt-2 grid gap-2 text-sm leading-6 text-ink/70">
          <li>Use neutral phrases such as volatile inspection history and repeat pattern.</li>
          <li>Explain every derived label in plain language.</li>
          <li>Do not imply causation or certainty from public records.</li>
          <li>Show the current public grade alongside Sano context.</li>
          <li>Make data recency and confidence visible.</li>
        </ul>
      </section>
    </article>
  );
}
