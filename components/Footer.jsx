"use client";

import Link from "next/link";
import { SiAndroid } from "react-icons/si";
import { HiOutlineHeart } from "react-icons/hi";
import {
  FaGithub,
  FaTwitter,
  FaDiscord,
} from "react-icons/fa";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Explore", href: "/explore" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "CLI Tool", href: "#" },
    { label: "Integrations", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-card-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                <SiAndroid size={20} />
              </div>
              <span className="text-xl font-bold gradient-text">ApkHub</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              The secure platform for sharing APKs, builds, and webapp bundles between developers.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                <FaGithub size={18} />
              </a>
              <a href="#" className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                <FaDiscord size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-card-border pt-8 sm:flex-row">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} ApkHub. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-text-muted">
            Made with <HiOutlineHeart className="text-danger" /> by developers, for developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
