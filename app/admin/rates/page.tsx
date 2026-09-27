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
  buildRatesBoard,
  elizBoardFromQuote,
  ELIZ_CURRENCY,
  marketBoardForMetal,
  metalLabel,
  OFFSETTABLE_ROWS,
} from "@/lib/metal-quotes";
import { formatInZone, RATE_TIMEZONE } from "@/lib/rate-time";

export default async function AdminRatesPage() {
  const [quotes, times, latest, books, manualIdrMyr] = await Promise.all([
    getMetalQuotes(),
    getRateRefreshTimes(),
    getLatestQuoteFetch(),
    getRateBooks(),
    getManualFxRates(),
  ]);
  const goldMarket = marketBoardForMetal(quotes, "XAU");
  const silverMarket = marketBoardForMetal(quotes, "XAG");
  const goldEliz = elizBoardFromQuote(quotes, "XAU");
  const silverEliz = elizBoardFromQuote(quotes, "XAG");
  const elizQuotes = quotes.filter((quote) => quote.currency === ELIZ_CURRENCY);
  const combinedBoard = buildRatesBoard(goldMarket, silverMarket, manualIdrMyr);
  const combinedUpdatedAt = goldEliz.updatedAt ?? silverEliz.updatedAt;

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Rates Setting</h1>
      <p className="mt-2 mb-8 max-w-2xl text-mist">
        Live market rows come from Eliz. IDR/MYR is set manually below and shared across the
        rates board. Create price books with add/subtract offsets on the physical MYR/KG rows,
        then assign a book to each member.
      </p>

      <section className="mb-10 rounded-xl border border-gold/25 p-6">
        <h2 className="font-display text-xl">Manual IDR/MYR</h2>
        <p className="mt-1 mb-6 text-sm text-mist">
          Not from the API. This base price appears once on the rates board, shared by Gold and
          Silver.
        </p>
        <SaveFeedbackForm
          action={saveManualFxRates}
          className="flex flex-wrap gap-4"
          successMessage="IDR/MYR rate saved successfully."
        >
          <label className="text-sm">
            <span className="mb-1 block text-mist">Buy</span>
            <input
              name="idr_buy"
              type="number"
              step="any"
              defaultValue={manualIdrMyr.buy}
              className="w-36 rounded border border-gold/30 bg-ink px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-mist">Sell</span>
            <input
              name="idr_sell"
              type="number"
              step="any"
              defaultValue={manualIdrMyr.sell}
              className="w-36 rounded border border-gold/30 bg-ink px-3 py-2"
            />
          </label>
          <div className="flex items-end">
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
            <div className="mt-6 w-full">
              <MetalRateTable rows={combinedBoard} updatedAt={combinedUpdatedAt} />
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
          Positive values add to the market price; negative values subtract. Offsets apply to
          the Physical Gold / Physical Silver MYR/KG rows, Gold(Spot) USD/OZ, IDR/MYR, and
          USD/MYR. Assign a book to a member under Members so they see that price list after
          login.
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

                  {(() => {
                    const goldAdjusted = applyAdjustments(goldMarket, "XAU", book.adjustments);
                    const silverAdjusted = applyAdjustments(silverMarket, "XAG", book.adjustments);
                    const idrMyrAdj = adjLookup(book.adjustments, "XAU", "idr-myr");
                    const bookPreview = buildRatesBoard(
                      goldAdjusted,
                      silverAdjusted,
                      manualIdrMyr,
                      idrMyrAdj,
                    );
                    return (
                      <div>
                        <p className="mb-3 font-display text-lg">Rate offsets</p>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-lg text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.14em] text-gold">
                              <tr>
                                <th className="py-2 pr-3">Row</th>
                                <th className="py-2 pr-3">Market buy / sell</th>
                                <th className="py-2 pr-3">Buy +/−</th>
                                <th className="py-2 pr-3">Sell +/−</th>
                                <th className="py-2">Member sees</th>
                              </tr>
                            </thead>
                            <tbody>
                              {OFFSETTABLE_ROWS.map((row) => {
                                const marketRow = combinedBoard.find((r) => r.key === row.boardKey);
                                const previewRow = bookPreview.find((r) => r.key === row.boardKey);
                                const adj = adjLookup(book.adjustments, row.metal, row.unitKey);
                                const digits = marketRow?.digits ?? row.digits;
                                return (
                                  <tr key={row.boardKey} className="border-t border-gold/15">
                                    <td className="py-2 pr-3">{row.label}</td>
                                    <td className="py-2 pr-3 text-mist">
                                      {marketRow
                                        ? `${formatPrice(marketRow.buy, digits)} / ${formatPrice(marketRow.sell, digits)}`
                                        : "—"}
                                    </td>
                                    <td className="py-2 pr-3">
                                      <input
                                        name={`adj_${row.metal}_${row.unitKey}_buy`}
                                        type="number"
                                        step="any"
                                        defaultValue={adj.buyDelta}
                                        className="w-28 rounded border border-gold/30 bg-ink px-2 py-1"
                                      />
                                    </td>
                                    <td className="py-2 pr-3">
                                      <input
                                        name={`adj_${row.metal}_${row.unitKey}_sell`}
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
                  })()}

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
