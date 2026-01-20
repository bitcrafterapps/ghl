"use client";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="text-white"
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
      }}
    >
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-white mb-4">
              Site Wizard
            </h3>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400 text-sm text-center">
              © {currentYear} Site Wizard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
