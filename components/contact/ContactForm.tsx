"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject = String(form.get("subject") ?? "Contact from Madeline Barbush's website").trim();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!response.ok) throw new Error("Unable to send enquiry");
      event.currentTarget.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__fields">
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Subject</span>
          <input name="subject" type="text" />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows={7} required />
        </label>
      </div>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      {status === "sent" ? <p className="contact-form__note" role="status">Thanks — your enquiry has been sent.</p> : null}
      {status === "error" ? <p className="contact-form__note" role="alert">Sorry, something went wrong. Please email directly instead.</p> : null}
    </form>
  );
}
