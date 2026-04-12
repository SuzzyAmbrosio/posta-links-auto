import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: 'DisparaLink - Seu hub de links',
  description: 'Crie sua página de links personalizada com DisparaLink',
  icons: {
    icon: '/logo.png',
  },
}
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
