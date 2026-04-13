import { Camera, MessageSquare, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Como Funciona', href: 'https://granahub.com.br#como-funciona' },
    { label: 'Funcionalidades', href: 'https://granahub.com.br#funcionalidades' },
    { label: 'Preços', href: 'https://granahub.com.br#precos' },
    { label: 'FAQ', href: 'https://granahub.com.br#faq' },
  ],
  empresa: [
    { label: 'Blog', href: '/' },
    { label: 'Contato', href: 'https://wa.me/551134525000' },
  ],
  legal: [
    { label: 'Termos de Uso', href: 'https://granahub.com.br#termos' },
    { label: 'Política de Privacidade', href: 'https://granahub.com.br#privacidade' },
    { label: 'LGPD', href: 'https://granahub.com.br#lgpd' },
  ],
};

const socialLinks = [
  { icon: Camera, href: 'https://instagram.com/granahub.brasil', label: 'Instagram' },
  { icon: MessageSquare, href: 'https://wa.me/551134525000', label: 'WhatsApp' },
  { icon: Mail, href: 'mailto:suporte@granahub.com.br', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="bg-granahub-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/logo-icon.png"
                  alt="GranaHub"
                  className="h-10 w-auto rounded-xl object-contain object-center"
                />
                <span className="font-bold text-xl">GranaHub</span>
              </div>
              <p className="text-white/70 leading-relaxed mb-4 max-w-sm">
                Controle financeiro inteligente pelo WhatsApp. 
                Sem apps complicados, sem planilhas chatas. 
                Apenas mande um áudio ou foto.
              </p>
              
              <div className="text-white/70 text-sm mb-6 space-y-1">
                <p>WhatsApp: (11) 3452-5000</p>
                <p>E-mail: suporte@granahub.com.br</p>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-3">
                {footerLinks.produto.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} GranaHub. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4" />
              <span>São Paulo, Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
