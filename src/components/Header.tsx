"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: 'https://granahub.com.br', label: 'Início', external: true },
  { href: '/', label: 'Blog', external: false },
  { href: 'https://cursos.granahub.com.br', label: 'Cursos', external: true },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/logo-transparent.png"
                alt="GranaHub"
                className="h-10 w-auto transition-opacity hover:opacity-90"
              />
            </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-granahub-primary ${
                    isScrolled ? 'text-granahub-text-secondary' : 'text-granahub-text-secondary'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-granahub-primary ${
                    isScrolled ? 'text-granahub-text-secondary' : 'text-granahub-text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-granahub-primary text-granahub-primary hover:bg-granahub-primary/5"
              onClick={() => window.open('https://app.granahub.com.br/auth?mode=register&planType=month', '_blank')}
            >
              Começar Grátis
            </Button>
            <Button
              className="bg-granahub-primary hover:bg-granahub-primary-light text-white"
              onClick={() => window.open('https://app.granahub.com.br/auth?mode=register&planType=year', '_blank')}
            >
              Economizar 25%
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-granahub-primary" />
            ) : (
              <Menu className="h-6 w-6 text-granahub-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="block w-full text-left py-2 text-granahub-text-secondary hover:text-granahub-primary font-medium"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-left py-2 text-granahub-text-secondary hover:text-granahub-primary font-medium"
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="pt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full border-granahub-primary text-granahub-primary"
                onClick={() => window.open('https://app.granahub.com.br/auth?mode=register&planType=month', '_blank')}
              >
                Começar Grátis - Mensal
              </Button>
              <Button
                className="w-full bg-granahub-primary hover:bg-granahub-primary-light text-white"
                onClick={() => window.open('https://app.granahub.com.br/auth?mode=register&planType=year', '_blank')}
              >
                Economizar 25% - Anual
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
