import { siteConfig, navLinks } from "../data/content";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-700 flex items-center justify-center text-white font-bold text-sm">
                BHF
              </div>
              <span className="font-serif text-lg font-semibold text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              A vibrant community dedicated to preserving, celebrating, and
              promoting the rich heritage of Bharat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-saffron-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <a
              href="mailto:support@bhfcommunity.org"
              className="text-sm text-saffron-400 hover:text-saffron-300 transition-colors"
            >
              support@bhfcommunity.org
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Fairfield, California
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">{siteConfig.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
