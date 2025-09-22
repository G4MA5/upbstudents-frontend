import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedDropdownProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
  value?: string;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  label,
  options,
  onSelect,
  disabled = false,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(value || null);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    setSelected(val);
    onSelect?.(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-32 md:w-44 text-left">
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
        {isOpen && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-md text-sm overflow-hidden"
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
