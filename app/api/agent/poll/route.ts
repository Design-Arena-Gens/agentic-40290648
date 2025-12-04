import { NextRequest, NextResponse } from "next/server";
import { classifyBasic, draftReply } from "@/lib/ai";
import { fetchRecent, sendEmail } from "@/lib/email";
import { getStore, markAutoReplied, setAutoReply, upsertMessages } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await parseJSON(req);
  if (typeof body?.autoReply === "boolean") setAutoReply(body.autoReply);

  const store = getStore();

  // Fetch recent emails (IMAP if configured, else demo inbox)
  const incoming = await fetchRecent(10);

  // Enrich with classification + draft
  for (const msg of incoming) {
    const cls = await classifyBasic({ subject: msg.subject, body: msg.body });
    const draft = await draftReply({ from: msg.from, subject: msg.subject, body: msg.body });
    upsertMessages([
      {
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        date: msg.date,
        snippet: msg.body.slice(0, 240),
        draft,
        basic: cls.basic
      }
    ]);

    // Auto-reply if enabled and considered basic
    if (store.autoReply && cls.basic) {
      await sendEmail({ to: msg.from, subject: `Re: ${msg.subject}`.slice(0, 200), text: draft });
      markAutoReplied(msg.id);
    }
  }

  return NextResponse.json({ ok: true, autoReply: store.autoReply, messages: store.messages });
}

async function parseJSON(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
