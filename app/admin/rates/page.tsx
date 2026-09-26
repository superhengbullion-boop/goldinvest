import {
  addRefreshTime,
  createRateBook,
  deleteRateBook,
  deleteRefreshTime,
  saveManualFxRates,
  saveRateBookAdjustments,
  toggleRateBook,
} from "@/app/actions/admin";
import { FetchNowButton } from "@/components/admin/FetchNowButton";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import { MetalRateTable } from "@/components/MetalRateTable";
import {
  formatPrice,
  formatQuotePrice,
  getLatestQuoteFetch,
  getManualFxRates,
  getMetalQuotes,
  getRateBooks,
  getRateRefreshTimes,
} from "@/lib/data";
import {
  adjLookup,
  applyAdjustments,
  BOARD_UNITS,
  elizBoardFromQuote,
  ELIZ_CURRENCY,
  marketBoardForMetal,
  metalLabel,
  RATE_METALS,
} from "@/lib/metal-quotes";
import { formatInZone, RATE_TIMEZONE } from "@/lib/rate-time";

export default async function AdminRatesPage() {
  const [quotes, times, latest, books, manualFx] = await Promise.all([
    getMetalQuotes(),
    getRateRefreshTimes(),
    getLatestQuoteFetch(),
    getRateBooks(),
    getManualFxRates(),
  ]);
  const goldMarket = marketBoardForMetal(quotes, "XAU", manualFx);
  const silverMarket = marketBoardForMetal(quotes, "XAG", manualFx);
  const goldEliz = elizBoardFromQuote(quotes, "XAU", manualFx);
  const silverEliz = elizBoardFromQuote(quotes, "XAG", manualFx);
  const elizQuotes = quotes.filter((quote) => quote.currency === ELIZ_CURRENCY);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Rates Setting</h1>
      <p className="mt-2 mb-8 max-w-2xl text-mist">
        Live market rows come from Eliz. IDR/MYR is set manually below for Gold and Silver.
        Create price books with add/subtract offsets, then assign a book to each member.
      </p>

      <section className="mb-10 rounded-xl border border-gold/25 p-6">
        <h2 className="font-display text-xl">Manual IDR/MYR</h2>
        <p className="mt-1 mb-6 text-sm text-mist">
          Not from the API. These base prices appear on the rates board for each metal.
          Rate books can still add or subtract offsets on top.
        </p>
        <SaveFeedbackForm
          action={saveManualFxRates}
          className="grid grid-cols-2 gap-8 max-md:grid-cols-1"
          successMessage="IDR/MYR rates saved successfully."
        >
          {RATE_METALS.map((metal) => {
            const side = metal.key === "XAU" ? manualFx.XAU : manualFx.XAG;
            const prefix = metal.key === "XAU" ? "xau" : "xag";
            return (
              <div key={metal.key} className="rounded-lg border border-gold/15 p-4">
                <p className="mb-4 font-display text-lg text-gold">{metal.label}</p>
                <div className="flex flex-wrap gap-4">
                  <label className="text-sm">
                    <span className="mb-1 block text-mist">Buy</span>
                    <input
                      name={`${prefix}_idr_buy`}
                      type="number"
                      step="any"
                      defaultValue={side.buy}
                      className="w-36 rounded border border-gold/30 bg-ink px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-mist">Sell</span>
                    <input
                      name={`${prefix}_idr_sell`}
                      type="number"
                      step="any"
                      defaultValue={side.sell}
                      className="w-36 rounded border border-gold/30 bg-ink px-3 py-2"
                    />
                  </label>
                </div>
              </div>
            );
          })}
          <div className="col-span-2 flex flex-wrap items-center gap-4 max-md:col-span-1">
            <SaveFeedbackSubmit label="Save IDR/MYR" />
          </div>
        </SaveFeedbackForm>
      </section>

      <section className="mb-10 rounded-xl border border-gold/25 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">Market quotes</h2>
            <p className="mt-1 text-sm text-mist">
              {latest
                ? `Last updated ${formatInZone(latest.fetchedAt)} (${latest.source})`
                : "No quotes stored yet. Use Fetch now or wait for a scheduled time."}
            </p>
          </div>
          <FetchNowButton />
        </div>

        {quotes.length === 0 ? (
          <p className="mt-6 text-mist">No market snapshots in the database yet.</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-8 max-md:grid-cols-1">
              {goldMarket.length > 0 ? (
                <MetalRateTable
                  metal="Gold"
                  rows={goldMarket}
                  updatedAt={goldEliz.updatedAt}
                  tone="gold"
                />
              ) : null}
              {silverMarket.length > 0 ? (
                <MetalRateTable
                  metal="Silver"
                  rows={silverMarket}
                  updatedAt={silverEliz.updatedAt}
                  tone="silver"
                />
              ) : null}
            </div>
            {elizQuotes.length > 0 ? (
              <ul className="mt-6 space-y-1 text-sm text-mist">
                {elizQuotes.map((quote) => (
                  <li key={quote.id}>
                    {metalLabel(quote.metal)} Eliz · updated {formatInZone(quote.fetchedAt)} ·{" "}
                    {quote.source}
                  </li>
                ))}
              </ul>
            ) : null}
            <details className="mt-4 text-sm text-mist">
              <summary className="cursor-pointer text-gold">GoldAPI backup rows</summary>
              <ul className="mt-2 space-y-1">
                {quotes
                  .filter((quote) => quote.currency !== ELIZ_CURRENCY)
                  .map((quote) => (
                    <li key={quote.id}>
                      {metalLabel(quote.metal)} {quote.currency} · {quote.symbol} ·{" "}
                      {formatQuotePrice(quote.price, quote.currency)} / oz
                    </li>
                  ))}
              </ul>
            </details>
          </>
        )}
      </section>

      <section className="mb-10 rounded-xl border border-gold/25 p-6">
        <h2 className="font-display text-xl">Price books</h2>
        <p className="mt-1 mb-6 text-sm text-mist">
          Positive values add to the market price; negative values subtract. Assign a
          book to a member under Members so they see that price list after login.
        </p>

        <SaveFeedbackForm
          action={createRateBook}
          className="mb-8 flex flex-wrap items-end gap-3"
          successMessage="Price book created successfully."
          feedbackClassName="w-full text-sm"
        >
          <input
            name="name"
            required
            placeholder="Name (e.g. Book A)"
            className="rounded border border-gold/30 bg-ink px-3 py-2"
          />
          <SaveFeedbackSubmit label="Add price book" />
        </SaveFeedbackForm>

        {books.length === 0 ? (
          <p className="text-mist">No price books yet. Add one, then assign it to members.</p>
        ) : (
          <div className="space-y-10">
            {books.map((book) => (
              <article key={book.id} className="rounded-xl border border-gold/20 p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-ivory">{book.name}</p>
                    <p className="text-xs text-mist">
                      {book.isActive ? "Active" : "Disabled"} · members assigned this book see the preview below
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <SaveFeedbackForm
                      action={toggleRateBook}
                      successMessage={book.isActive ? "Book disabled." : "Book enabled."}
                      feedbackClassName="text-xs"
                    >
                      <input type="hidden" name="id" value={book.id} />
                      <SaveFeedbackSubmit
                        label={book.isActive ? "Disable" : "Enable"}
                        pendingLabel="Updating…"
                        className="text-sm text-gold disabled:opacity-60"
                      />
                    </SaveFeedbackForm>
                    <SaveFeedbackForm
                      action={deleteRateBook}
                      successMessage=""
                      feedbackClassName="text-xs"
                    >
                      <input type="hidden" name="id" value={book.id} />
                      <SaveFeedbackSubmit
                        label="Delete"
                        pendingLabel="Deleting…"
                        className="text-sm text-red-400 disabled:opacity-60"
                      />
                    </SaveFeedbackForm>
                  </div>
                </div>

                <SaveFeedbackForm
                  action={saveRateBookAdjustments}
                  className="space-y-8"
                  successMessage="Price book offsets saved successfully."
                >
                  <input type="hidden" name="id" value={book.id} />
                  <label className="block max-w-sm text-sm">
                    <span className="mb-1 block text-mist">Display name</span>
                    <input
                      name="name"
                      defaultValue={book.name}
                      className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
                    />
                  </label>

                  {RATE_METALS.map((metal) => {
                    const market = metal.key === "XAU" ? goldMarket : silverMarket;
                    const preview = applyAdjustments(market, metal.key, book.adjustments);
                    return (
                      <div key={metal.key}>
                        <p className="mb-3 font-display text-lg">{metal.label} offsets</p>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-lg text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.14em] text-gold">
                              <tr>
                                <th className="py-2 pr-3">Unit</th>
                                <th className="py-2 pr-3">Market buy / sell</th>
                                <th className="py-2 pr-3">Buy +/−</th>
                                <th className="py-2 pr-3">Sell +/−</th>
                                <th className="py-2">Member sees</th>
                              </tr>
                            </thead>
                            <tbody>
                              {BOARD_UNITS.map((unit) => {
                                const marketRow = market.find((row) => row.key === unit.key);
                                const previewRow = preview.find((row) => row.key === unit.key);
                                const adj = adjLookup(book.adjustments, metal.key, unit.key);
                                const digits = marketRow?.digits ?? 2;
                                return (
                                  <tr key={unit.key} className="border-t border-gold/15">
                                    <td className="py-2 pr-3">{unit.label}</td>
                                    <td className="py-2 pr-3 text-mist">
                                      {unit.source === "manual"
                                        ? "Manual"
                                        : marketRow
                                          ? `${formatPrice(marketRow.buy, digits)} / ${formatPrice(marketRow.sell, digits)}`
                                          : "—"}
                                      {unit.source === "manual" && marketRow
                                        ? ` · ${formatPrice(marketRow.buy, digits)} / ${formatPrice(marketRow.sell, digits)}`
                                        : ""}
                                    </td>
                                    <td className="py-2 pr-3">
                                      <input
                                        name={`adj_${metal.key}_${unit.key}_buy`}
                                        type="number"
                                        step="any"
                                        defaultValue={adj.buyDelta}
                                        className="w-28 rounded border border-gold/30 bg-ink px-2 py-1"
                                      />
                                    </td>
                                    <td className="py-2 pr-3">
                                      <input
                                        name={`adj_${metal.key}_${unit.key}_sell`}
                                        type="number"
                                        step="any"
                                        defaultValue={adj.sellDelta}
                                        className="w-28 rounded border border-gold/30 bg-ink px-2 py-1"
                                      />
                                    </td>
                                    <td className="py-2 text-gold">
                                      {previewRow
                                        ? `${formatPrice(previewRow.buy, digits)} / ${formatPrice(previewRow.sell, digits)}`
                                        : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center gap-4">
                    <SaveFeedbackSubmit label="Save offsets" />
                  </div>
                </SaveFeedbackForm>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gold/25 p-6">
        <h2 className="font-display text-xl">Refresh times</h2>
        <p className="mt-1 mb-6 text-sm text-mist">
          The API is called only at these clock times each day, in {RATE_TIMEZONE}.
          Each run fetches Eliz snapshots and GoldAPI quotes for gold and silver.
        </p>

        <SaveFeedbackForm
          action={addRefreshTime}
          className="mb-6 flex flex-wrap items-end gap-3"
          successMessage="Refresh time saved successfully."
          feedbackClassName="w-full text-sm"
        >
          <label className="text-sm">
            <span className="mb-1 block text-mist">Add time</span>
            <input
              name="time"
              type="time"
              required
              className="rounded border border-gold/30 bg-ink px-3 py-2"
            />
          </label>
          <SaveFeedbackSubmit label="Save time" />
        </SaveFeedbackForm>

        {times.length === 0 ? (
          <p className="text-mist">No refresh times set. Quotes will not update until you add one or click Fetch now.</p>
        ) : (
          <ul className="divide-y divide-gold/15 rounded-lg border border-gold/20">
            {times.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-display text-lg tracking-wide">{slot.time}</span>
                <SaveFeedbackForm
                  action={deleteRefreshTime}
                  successMessage=""
                  feedbackClassName="text-xs"
                >
                  <input type="hidden" name="id" value={slot.id} />
                  <SaveFeedbackSubmit
                    label="Remove"
                    pendingLabel="Removing…"
                    className="text-sm text-red-400 disabled:opacity-60"
                  />
                </SaveFeedbackForm>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
