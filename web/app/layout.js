import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata = {
  title:       'Mala-Link | Citizen Services',
  description: 'Unified citizen service platform — Malawi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
         <LanguageProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize:   '14px',
              fontWeight: '500',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        {children}
       </LanguageProvider>
      </body>
    </html>
  );
}