"use client";

import { useState, type FormEvent } from "react";

type ContactFormProps = { recipient: string };

export function ContactForm({ recipient }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject = String(form.get("subject") ?? "Contact from Madeline Barbush's website").trim();
    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");

    setSubmitted(true);
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
      <button type="submit">Send enquiry</button>
      <p className="contact-form__note" aria-live="polite">
        {submitted ? "Your email app should open with the message ready to send." : `Your message will be addressed to ${recipient}.`}
      </p>
    </form>
  );
}
