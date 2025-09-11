import { TestTube2 } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <TestTube2 className="h-16 w-16" style={{ color: "#FFFFFF",
                       textShadow: "8px 8px 8px rgba(13, 113, 31, 0.7), 16px 16px 16px #000"
               }} />
      <h1
        className="text-5xl font-bold font-headline tracking-tighter"
        style={{ color: "#FFFFFF",
          textShadow: "8px 8px 8px rgba(13, 113, 31, 0.7), 4px 4px 4px #000"
  }}
      >
        veri-TA-serum
      </h1>
    </div>
  );
}