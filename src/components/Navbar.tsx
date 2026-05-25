import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig } from "../data/content";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-saffron-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-700 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-md">
              BHF
            </div>
            <span className="hidden sm:block font-serif text-lg font-semibold text-gray-900 group-hover:text-saffron-700 transition-colors">
              {siteConfig.name}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-saffron-700 hover:bg-saffron-50 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#get-involved"
              className="ml-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-full hover:from-saffron-600 hover:to-saffron-700 transition-all shadow-md hover:shadow-lg"
            >
              Join Us
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-saffron-600 rounded-lg"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-saffron-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:text-saffron-700 hover:bg-saffron-50 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#get-involved"
              onClick={() => setIsOpen(false)}
              className="block mt-2 px-4 py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-full"
            >
              Join Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
