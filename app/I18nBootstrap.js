'use client';

import { useEffect } from 'react';

export default function I18nBootstrap() {
  useEffect(() => {
    if (window.I18N) return;
    const existing = document.querySelector('script[data-edaix-i18n="true"]');
    if (existing) return;
    const script = document.createElement('script');
    script.src = '/assets/i18n.js?v=footer-i18n-20260626-1';
    script.async = true;
    script.dataset.edaixI18n = 'true';
    document.body.appendChild(script);
  }, []);

  return null;
}
