export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-20 py-8">
      <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-dim)]">
        <span>
          <span style={{ color: '#FF6B2B' }}>$</span> devapk.hub — part of{' '}
          <span className="text-[var(--color-text-muted)]">deveco ecosystem</span>
        </span>
        <div className="flex items-center gap-4">
          <a href="https://dev-folio-two-rho.vercel.app/" className="text-[var(--color-neon-cyan)] hover:underline">↗ DevFolio</a>
          <a href="http://localhost:3001" className="hover:text-[var(--color-text-muted)] transition-colors">DevBlog</a>
          <a href="http://localhost:3006" className="hover:text-[var(--color-text-muted)] transition-colors">DevNotes</a>
        </div>
      </div>
    </footer>
  );
}