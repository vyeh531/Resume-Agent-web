import Script from 'next/script';
import './globals.css';
import I18nBootstrap from './I18nBootstrap';

export const metadata = {
  title: 'EdAIX - AI resume diagnosis for global careers',
  description: '1,300+ industry mentors and AI-powered analysis. Get a practical resume improvement plan in 30 seconds.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <head>
        <meta name="theme-color" content="#F7F3FC" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+SC:wght@500;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <I18nBootstrap />
        <Script src="/assets/api-client.js" strategy="afterInteractive" />
        <Script src="/assets/app.js?v=analysis-fallback-20260623-1" strategy="afterInteractive" />
      </body>
    </html>
  );
}
