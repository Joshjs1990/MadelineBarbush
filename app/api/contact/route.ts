import { getEnvValue } from "@/lib/env";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const apiKey = await getEnvValue("RESEND_API_KEY");
  const from = await getEnvValue("CONTACT_FROM_EMAIL");
  const to = await getEnvValue("CONTACT_TO_EMAIL");

  if (!apiKey || !from || !to) {
    return Response.json({ error: "Contact email is not configured." }, { status: 503 });
  }

  let payload: { name?: unknown; email?: unknown; subject?: unknown; message?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "Contact from Madeline Barbush's website").trim();
  const message = String(payload.message ?? "").trim();

  if (!name || !emailPattern.test(email) || !message || name.length > 120 || email.length > 320 || subject.length > 200 || message.length > 10000) {
    return Response.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "Unable to send enquiry." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
