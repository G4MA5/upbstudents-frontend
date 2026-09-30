import { passwordStrength } from "../../lib/validation";

const LEVELS = [
  { label: "Trop court", color: "bg-red-500" },
  { label: "Faible", color: "bg-red-500" },
  { label: "Moyen", color: "bg-amber-500" },
  { label: "Bon", color: "bg-emerald-500" },
  { label: "Excellent", color: "bg-emerald-600" },
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = value.length < 8 ? 0 : Math.max(1, passwordStrength(value));
  const level = LEVELS[score];
  return (
    <div className="-mt-1 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? level.color : "bg-sunken"
            }`}
          />
        ))}
      </div>
      <span className="w-20 text-right text-xs font-medium text-ink-muted">
        {level.label}
      </span>
    </div>
  );
}
