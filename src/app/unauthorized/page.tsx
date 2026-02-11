"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Accesso Negato
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Non hai i permessi necessari per accedere a questa risorsa.
          </p>
          <p className="text-sm text-muted-foreground">
            Se ritieni di dover avere accesso, contatta l'amministratore del sistema.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            <Button onClick={() => router.push("/dashboard")}>
              Torna alla Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Vai alla Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
