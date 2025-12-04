import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getStore, markAutoReplied } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const store = getStore();
  const body = await parseJSON(req);
  const msg = store.messages.find(m => m.id === body?.id);
  if (!msg) return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });
  if (!msg.draft) return NextResponse.json({ ok: false, error: "No draft available" }, { status: 400 });
  await sendEmail({ to: msg.from, subject: `Re: ${msg.subject}`.slice(0, 200), text: msg.draft });
  markAutoReplied(msg.id);
  return NextResponse.json({ ok: true });
}

async function parseJSON(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
