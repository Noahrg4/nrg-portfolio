"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = { name?: string; phone?: string; project?: string };

const PHONE_REGEX = /^\+?1?\s*[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;

function clientValidate(values: { name: string; phone: string; project: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Please tell me your name.";
  else if (values.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

  if (!values.phone.trim()) errors.phone = "A phone number helps me reach you fast.";
  else if (!PHONE_REGEX.test(values.phone.trim()))
    errors.phone = "Use a 10-digit US format like 713-555-0123.";

  const msg = values.project.trim();
  if (!msg) errors.project = "Tell me a little about your project.";
  else if (msg.length < 10) errors.project = "A few more details, please — at least 10 characters.";
  else if (msg.length > 500) errors.project = "Keep it under 500 characters.";

  return errors;
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerMessage(null);

    const values = { name, phone, project };
    const clientErrors = clientValidate(values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        errors?: FieldErrors;
      };

      if (res.ok && data.success) {
        setSuccessMessage(
          data.message ?? "Got it — I'll reach back out within one business day, usually same day."
        );
        setStatus("success");
        setName("");
        setPhone("");
        setProject("");
        return;
      }

      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }

      setServerMessage(
        data.message ??
          (res.status === 429
            ? "Too many submissions. Please email noah@nrgwebsites.com directly."
            : "Something went wrong. Email directly: noah@nrgwebsites.com")
      );
      setStatus("error");
    } catch {
      setServerMessage("Network error. Email directly: noah@nrgwebsites.com");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none";
  const inputErrorClass = "border-red-500/60 focus:border-red-500";

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col gap-4 rounded-xl border border-accent/40 bg-accent/10 p-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
          ▸ Inquiry received
        </p>
        <h2 className="text-display text-3xl text-ink md:text-4xl">Thanks — talk soon.</h2>
        <p className="text-base leading-relaxed text-ink-secondary">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
          disabled={status === "submitting"}
        />
        {errors.name && (
          <p id="name-error" className="font-mono text-xs text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="phone"
          className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
        >
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={`${inputClass} ${errors.phone ? inputErrorClass : ""}`}
          disabled={status === "submitting"}
        />
        {errors.phone && (
          <p id="phone-error" className="font-mono text-xs text-red-400">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="project"
          className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
        >
          Tell me about your project
        </label>
        <textarea
          id="project"
          name="project"
          required
          rows={6}
          maxLength={500}
          placeholder="What kind of business, what you need, and your timeline."
          value={project}
          onChange={(e) => setProject(e.target.value)}
          aria-invalid={!!errors.project}
          aria-describedby={errors.project ? "project-error" : "project-hint"}
          className={`${inputClass} resize-y ${errors.project ? inputErrorClass : ""}`}
          disabled={status === "submitting"}
        />
        <div className="flex items-center justify-between">
          {errors.project ? (
            <p id="project-error" className="font-mono text-xs text-red-400">
              {errors.project}
            </p>
          ) : (
            <span id="project-hint" className="font-mono text-[11px] text-ink-secondary">
              {project.length}/500
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? (
          <>
            <span
              aria-hidden
              className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-canvas border-r-transparent"
            />
            Sending…
          </>
        ) : (
          <>
            Send inquiry
            <span aria-hidden>→</span>
          </>
        )}
      </button>

      {status === "error" && serverMessage && (
        <p
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
        >
          {serverMessage}
        </p>
      )}
    </form>
  );
}
