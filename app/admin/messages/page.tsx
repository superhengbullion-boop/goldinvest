import { deleteMessage, markMessageRead } from "@/app/actions/admin";
import { getMessages } from "@/lib/data";

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Messages</h1>
      <p className="mt-2 mb-8 text-mist">Enquiries submitted from Contact Us.</p>
      <div className="space-y-4">
        {messages.map((msg) => (
          <article key={msg.id} className="rounded-xl border border-gold/20 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg">
                  {msg.name}{" "}
                  {!msg.read ? <span className="text-xs text-gold">NEW</span> : null}
                </h2>
                <p className="text-sm text-mist">
                  {msg.email} · {msg.phone} · {msg.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                {!msg.read ? (
                  <form action={markMessageRead}>
                    <input type="hidden" name="id" value={msg.id} />
                    <button type="submit" className="text-sm text-gold">
                      Mark read
                    </button>
                  </form>
                ) : null}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button type="submit" className="text-sm text-red-400">
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-ivory/90">{msg.message}</p>
          </article>
        ))}
        {messages.length === 0 ? <p className="text-mist">No messages yet.</p> : null}
      </div>
    </div>
  );
}
