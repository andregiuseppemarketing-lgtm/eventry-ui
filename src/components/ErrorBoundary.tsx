"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("❌ Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Qualcosa è andato storto 💥
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Si è verificato un errore imprevisto. Abbiamo registrato il problema.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-muted p-3 rounded text-left">
              <p className="text-xs font-mono text-red-600">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 mt-6">
            <Button onClick={reset}>Riprova</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Torna alla Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
