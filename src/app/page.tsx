import { CalculatorClient } from '@/components/calculator/calculator-client';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(-45deg,hsl(var(--background)),hsl(var(--card)),hsl(var(--background)))] bg-[400%_400%] animate-gradient-animation" />
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <CalculatorClient />
      </main>
    </div>
  );
}
