import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
  selectedValue?: string;
}

const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({
    label,
    options,
    onSelect,
    disabled = false,
    isOpen: controlledIsOpen,
    onToggle,
    innerRef,
    selectedValue,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    // Sync avec la valeur externe
    useEffect(() => {
      setSelected(selectedValue || null);
    }, [selectedValue]);

    const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

    const toggleDropdown = () => {
      if (disabled) return;

      if (selected) {
        setSelected(null);
        onSelect?.("");
        if (controlledIsOpen !== undefined && onToggle) {
          onToggle(false);
        } else {
          setIsOpen(false);
        }
        return;
      }

      if (controlledIsOpen !== undefined && onToggle) {
        onToggle(!controlledIsOpen);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    const handleSelect = (value: string) => {
      if (disabled) return;
      setSelected(value);
      onSelect?.(value);

      if (controlledIsOpen !== undefined && onToggle) {
        onToggle(false);
      } else {
        setIsOpen(false);
      }
    };

    return (
      <div ref={innerRef} className="relative w-full text-left">
        {/* Bouton principal */}
        <button
          type="button"
          onClick={toggleDropdown}
          className={`w-full px-3 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm 
            ${
              selected
                ? "bg-[#ff4b4b] text-white"
                : disabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-800"
            }`}
          disabled={disabled}
        >
          {selected || label}
        </button>

        {/* Liste déroulante */}
        <AnimatePresence>
          {open && !disabled && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-md text-sm
                         overflow-y-auto max-h-[7rem]"
            >
              {options.map((opt, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2 hover:bg-[#ff4b4b] hover:text-white cursor-pointer
                    ${selected === opt ? "bg-[#ff4b4b] text-white" : ""}`}
                >
                  {opt}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default DropdownMenu;
