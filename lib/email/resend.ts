import { getEnvValue } from "@/lib/env";

/**
 * Resend delivery.
 *
 * Called over HTTP rather than through the `resend` SDK: the API is one POST,
 * and this keeps the worker bundle free of a dependency that expects Node.
 *
 * Without `RESEND_API_KEY` the message is logged and reported as skipped rather
 * than thrown. A booking must still save when email is misconfigured — losing
 * the record because a notification failed would be the worse outcome.
 */

const ENDPOINT = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  /** Calendar invite attached as a file, so mail clients offer to add it. */
  icsAttachment?: { filename: string; content: string };
};

export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function getFromAddress() {
  return (await getEnvValue("BOOKING_FROM_EMAIL")) ?? "bookings@thecoolmoon.com";
}

export async function isEmailConfigured() {
  return (await getEnvValue("RESEND_API_KEY")) !== null;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = await getEnvValue("RESEND_API_KEY");
  const recipients = Array.isArray(message.to) ? message.to : [message.to];

  if (!apiKey) {
    console.info(
      `[email skipped] RESEND_API_KEY is not set. Would have sent "${message.subject}" to ${recipients.join(", ")}`,
    );
    return { ok: false, skipped: true, reason: "RESEND_API_KEY is not set." };
  }

  const from = await getFromAddress();

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
        attachments: message.icsAttachment
          ? [
              {
                filename: message.icsAttachment.filename,
                content: toBase64(message.icsAttachment.content),
                content_type: "text/calendar; method=REQUEST",
              },
            ]
          : undefined,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[email failed] ${response.status} ${detail}`);
      return { ok: false, skipped: false, reason: `Resend returned ${response.status}.` };
    }

    const body = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: body.id ?? null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error("[email failed]", error);
    return { ok: false, skipped: false, reason };
  }
}

/** Fire-and-forget: notifications must never block or fail a booking write. */
export async function sendEmailQuietly(message: EmailMessage) {
  try {
    return await sendEmail(message);
  } catch (error) {
    console.error("[email failed]", error);
    return { ok: false, skipped: false, reason: "Unexpected failure" } as const;
  }
}
