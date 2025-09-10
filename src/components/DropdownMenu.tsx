import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  options,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-left">
      <button
        type="button" // ✅ évite bug submit
        onClick={toggleDropdown}
        className={`w-full px-3 py-2 rounded-full border text-sm transition-all duration-200 shadow-sm 
          ${
            selected ? "bg-[#ff4b4b] text-white" : "bg-gray-200 text-gray-800"
          }`}
      >
        {selected || label}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-md text-sm overflow-hidden"
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

export default DropdownMenu;
