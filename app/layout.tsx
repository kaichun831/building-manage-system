import './globals.css';

export const metadata = {
  title: '大廈管理委員會系統',
  description: '線上大廈管理系統',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
