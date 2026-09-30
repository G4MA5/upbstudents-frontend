const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string) {
  if (!value.trim()) return "Veuillez saisir votre adresse e-mail.";
  if (!EMAIL_RE.test(value.trim())) return "Cette adresse e-mail n'est pas valide.";
  return "";
}

export function validatePhone(value: string) {
  const digits = value.replace(/[\s.-]/g, "");
  if (!digits) return "Veuillez saisir votre numéro de téléphone.";
  if (!/^\+?\d{8,15}$/.test(digits)) return "Numéro invalide (ex. 0712345678).";
  return "";
}

export function validateNewPassword(value: string) {
  if (!value) return "Veuillez choisir un mot de passe.";
  if (value.length < 8) return "8 caractères minimum.";
  if (value.length > 72) return "72 caractères maximum.";
  return "";
}

export function required(value: string, message: string) {
  return value.trim() ? "" : message;
}

/** 0 to 4, used by the strength meter. */
export function passwordStrength(value: string) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  else if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 0.5;
  return Math.min(4, Math.floor(score));
}
