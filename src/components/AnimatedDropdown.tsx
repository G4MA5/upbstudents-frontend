// src/components/AnimatedDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedDropdownProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
  value?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  label,
  options,
  onSelect,
  disabled = false,
  value,
  isOpen,
  onToggle,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const open = isOpen ?? isOpenInternal;
  const [selected, setSelected] = useState<string | null>(value || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 👉 Fermer si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (onToggle) onToggle(false);
        else setIsOpenInternal(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  // 👉 Quand on clique sur le bouton principal
  const toggleDropdown = () => {
    if (disabled) return;

    // Si déjà sélectionné, recliquer => désélectionne
    if (selected) {
      setSelected(null);
      onSelect?.("");
      if (onToggle) onToggle(false);
      else setIsOpenInternal(false);
      return;
    }

    if (onToggle) onToggle(!open);
    else setIsOpenInternal((prev) => !prev);
  };

  // 👉 Quand on choisit une option
  const handleSelect = (val: string) => {
    const newValue = selected === val ? null : val;
    setSelected(newValue);
    onSelect?.(newValue || "");
    if (onToggle) onToggle(false);
    else setIsOpenInternal(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-32 md:w-44 text-left">
      <button
        onClick={toggleDropdown}
        className={`w-full px-3 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm 
          ${disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""}
          ${selected && !disabled ? "bg-[#ff4b4b] text-white" : ""}
          ${!selected && !disabled ? "bg-gray-200 text-gray-800" : ""}`}
      >
        {selected || label}
      </button>

      <AnimatePresence>
        {open && !disabled && !selected && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-md text-sm overflow-y-auto max-h-[7rem]"
          >
            {options.map((opt, index) => (
              <li
                key={index}
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 hover:bg-[#ff4b4b] hover:text-white cursor-pointer"
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDropdown;
