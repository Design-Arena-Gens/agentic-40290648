export const metadata = {
  title: "Agentic Email",
  description: "Monitors email, drafts replies, and auto-replies to basics"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system', background: '#0b0f14', color: '#e6edf3' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Agentic Email</h1>
            <a href="/" style={{ opacity: 0.8 }}>Dashboard</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
