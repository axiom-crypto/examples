import './globals.css'
import satoshi from 'next/font/local';
import { Source_Code_Pro } from 'next/font/google';
import type { Metadata } from 'next'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar';
import MainLayout from '@/components/layout/MainLayout';

const Satoshi = satoshi({
  src: '../../public/fonts/Satoshi-Variable.ttf',
  display: "swap",
  weight: "500 700",
  variable: "--font-satoshi",
});

const SourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: 'Autonomous Airdrop Example',
  description: 'Users can autonomously claim an airdrop by generating a Zero Knowledge proof of their Ethereum history.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${Satoshi.className} ${Satoshi.variable} ${SourceCodePro.variable}`}>
        <Providers>
          <main className="flex flex-col w-screen min-h-screen justify-start items-center">
            <Navbar />
            <MainLayout>
              {children}
            </MainLayout>
          </main>
        </Providers>
      </body>
    </html>
  )
}
