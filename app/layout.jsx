import './globals.css';
export const metadata = {
  metadataBase: new URL('https://josephleecy.github.io'),
  title: 'RELAY — Expert Know-How, Ready for Every Shift',
  description: 'Turn expert know-how into governed, portable Intelligence Pills. A Keppel AI HARVEST hackathon prototype.',
  openGraph: {title:'RELAY',description:'Expert know-how, safely reused across every building.',images:[`${process.env.NEXT_PUBLIC_BASE_PATH||''}/relay-cover.jpg`]},
};
export default function RootLayout({children}) {return <html lang="en"><body>{children}</body></html>;}
