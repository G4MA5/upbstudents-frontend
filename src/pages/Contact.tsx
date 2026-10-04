import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Alert, SuccessMark } from "../components/ui/Feedback";
import { Honeypot, Input, Textarea } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, errorMessage } from "../lib/api";
import { validateEmail } from "../lib/validation";
import { useSeoHead } from "../lib/useSeoHead";

const CHANNELS = [
  {
    icon: MapPin,
    label: "Adresse",
    value: "Université Polytechnique de Bingerville, Route de Bingerville, Bingerville, Abidjan, Côte d'Ivoire",
  },
  { icon: Mail, label: "E-mail", value: "contact@upb.edu.ci", href: "mailto:contact@upb.edu.ci" },
  { icon: Phone, label: "Téléphone", value: "+225 01 72 48 93 31", href: "tel:+2250172489331" },
];

type Errors = { nom?: string; email?: string; objet?: string; message?: string };

export default function Contact() {
  useSeoHead();
  const { profile } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ nom: "", email: "", objet: params.get("objet") ?? "", message: "" });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        nom: f.nom || [profile.prenom, profile.nom].filter(Boolean).join(" "),
        email: f.email || profile.email,
      }));
    }
  }, [profile]);

  useEffect(() => {
    const objet = params.get("objet");
    if (objet) setForm((f) => ({ ...f, objet }));
  }, [params]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: "" }));
  };

  const validate = (): Errors => ({
    nom: form.nom.trim() ? "" : "Indiquez votre nom.",
    email: validateEmail(form.email),
    objet: form.objet.trim() ? "" : "Indiquez l'objet de votre message.",
    message:
      form.message.trim().length >= 10 ? "" : "Votre message doit contenir au moins 10 caractères.",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setLoading(true);
    setFailure(null);
    try {
      const res = await api<{ message: string }>("/api/contact", {
        body: {
          nom: form.nom.trim(),
          email: form.email.trim(),
          objet: form.objet.trim(),
          message: form.message.trim(),
          website,
        },
      });
      setSent(res.message);
      toast.success("Message envoyé", "Merci, nous vous répondrons rapidement.");
    } catch (err) {
      setFailure(errorMessage(err));
      toast.error("Message non envoyé", errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      <section>
        <div className="page-head">
          <p className="eyebrow !text-accent">Contact</p>
          <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">Contactez-nous</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Une question, un problème sur le site ou un document introuvable ?
            Écrivez-nous, nous vous répondrons par e-mail.
          </p>
        </div>
      </section>

      <div className="container-page mt-6 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-3">
          {CHANNELS.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl border border-line bg-card p-4 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
                {href ? (
                  <a href={href} className="mt-0.5 block break-words font-medium text-ink hover:text-accent">
                    {value}
                  </a>
                ) : (
                  <p className="mt-0.5 font-medium text-ink">{value}</p>
                )}
              </div>
            </div>
          ))}
        </aside>

        <div className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-10 text-center" role="status">
                <SuccessMark size={80} />
                <h2 className="mt-6 text-2xl font-extrabold">Message envoyé</h2>
                <p className="mt-2 max-w-md text-ink-muted">{sent}</p>
                <Button
                  variant="outline"
                  className="mt-8"
                  onClick={() => {
                    setSent(null);
                    setForm((f) => ({ ...f, objet: "", message: "" }));
                  }}
                >
                  Envoyer un autre message
                </Button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} noValidate className="relative flex flex-col gap-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden /> Votre message
                </h2>
                <Honeypot value={website} onChange={setWebsite} />
                <AnimatePresence>{failure && <Alert tone="error" title="Le message n'a pas été envoyé">{failure}</Alert>}</AnimatePresence>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nom" autoComplete="name" value={form.nom} onChange={set("nom")} error={errors.nom} />
                  <Input
                    label="Adresse e-mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={form.email}
                    onChange={set("email")}
                    error={errors.email}
                  />
                </div>
                <Input label="Objet" value={form.objet} onChange={set("objet")} error={errors.objet} maxLength={150} />
                <Textarea
                  label="Message"
                  rows={6}
                  value={form.message}
                  onChange={set("message")}
                  error={errors.message}
                  maxLength={5000}
                  hint={`${form.message.length} / 5000`}
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="lg" loading={loading} loadingText="Envoi en cours…" icon={<Send className="h-4 w-4" />} className="w-full sm:w-auto">
                    Envoyer le message
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="container-page mt-12">
        <h2 className="mb-4 text-2xl font-extrabold">Où nous trouver ?</h2>
        <div className="h-[320px] overflow-hidden rounded-3xl border border-line bg-sunken shadow-card sm:h-[420px]">
          <iframe
            title="Plan d'accès à l'Université Polytechnique de Bingerville"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.1509163875135!2d-3.898872889165489!3d5.393961335234709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc18d10bfa0efe5%3A0x6552832fd69de896!2sUniversit%C3%A9%20Polytechnique%20de%20Bingerville%20(UPB)!5e0!3m2!1sfr!2sci!4v1753669226398!5m2!1sfr!2sci"
            className="h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
