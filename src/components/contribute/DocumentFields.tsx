import { ANNEES, CATEGORIES, FILIERES, NIVEAUX, SESSIONS, typeHasSession } from "../../lib/constants";
import type { DocumentMetadata } from "../../types";
import { Input, Select } from "../ui/Field";

export type MetaErrors = Partial<Record<keyof DocumentMetadata, string>>;

export const EMPTY_META: DocumentMetadata = {
  filiere: "",
  type: "",
  annee: "",
  niveau: "",
  matiere: "",
  session: "",
};

export function validateMeta(m: DocumentMetadata): MetaErrors {
  return {
    type: m.type ? "" : "Choisissez le type de document.",
    filiere: m.filiere ? "" : "Choisissez la filière.",
    niveau: m.niveau ? "" : "Choisissez le niveau.",
    annee: m.annee ? "" : "Choisissez l'année.",
    matiere: m.matiere.trim() ? "" : "Indiquez la matière ou le titre.",
  };
}

export function DocumentFields({
  value,
  onChange,
  errors,
}: {
  value: DocumentMetadata;
  onChange: (next: DocumentMetadata) => void;
  errors: MetaErrors;
}) {
  const set = (key: keyof DocumentMetadata) => (e: { target: { value: string } }) => {
    const next = { ...value, [key]: e.target.value };
    if (key === "type" && !typeHasSession(next.type)) next.session = "";
    onChange(next);
  };
  const sessionAllowed = typeHasSession(value.type);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Type de document"
        placeholder="Choisir…"
        options={CATEGORIES.map((c) => ({ value: c.value, label: c.singular }))}
        value={value.type}
        onChange={set("type")}
        error={errors.type}
      />
      <Select label="Filière" placeholder="Choisir…" options={FILIERES} value={value.filiere} onChange={set("filiere")} error={errors.filiere} />
      <Input
        label={value.type === "Livre" ? "Titre du livre" : "Matière"}
        placeholder={value.type === "Livre" ? "Titre de l'ouvrage" : "Ex. : Analyse numérique"}
        value={value.matiere}
        onChange={set("matiere")}
        error={errors.matiere}
        maxLength={120}
        wrapperClassName="sm:col-span-2"
      />
      <Select label="Niveau" placeholder="Choisir…" options={NIVEAUX} value={value.niveau} onChange={set("niveau")} error={errors.niveau} />
      <Select label="Année" placeholder="Choisir…" options={ANNEES} value={value.annee} onChange={set("annee")} error={errors.annee} />
      <Select
        label="Session"
        placeholder={sessionAllowed ? "Choisir…" : "Sans objet"}
        options={SESSIONS}
        value={value.session}
        onChange={set("session")}
        disabled={!sessionAllowed}
        optional={sessionAllowed}
        hint={sessionAllowed ? undefined : "Uniquement pour les examens."}
        wrapperClassName="sm:col-span-2"
      />
    </div>
  );
}
