"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Camera, Keyboard, CalendarDays, User } from "lucide-react";

interface CheckInResult {
  success: boolean;
  message: string;
  ticket?: {
    id: string;
    code: string;
    status: string;
    event: {
      id: string;
      title: string;
      dateStart: string;
      venue?: {
        name: string;
        city: string;
      };
    };
    user?: {
      id: string;
      email: string;
      userProfile?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export default function CheckInStaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "camera">("manual");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if user has staff/organizer/admin role
    if (status === "authenticated") {
      const userRoles = (session?.user as any)?.roles || [];
      const allowedRoles = ["STAFF", "ORGANIZER", "ADMIN"];
      const hasAccess = userRoles.some((role: string) => allowedRoles.includes(role));
      
      if (!hasAccess) {
        router.push("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      startScanning();
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Impossibile accedere alla fotocamera. Usa l'inserimento manuale.");
      setMode("manual");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 500);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // In production, use a QR code detection library like jsQR
    // For now, this is a placeholder that would need jsQR integration
    // import jsQR from "jsqr";
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // if (code) {
    //   handleScan(code.data);
    // }
  };

  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) return;
    await performCheckIn(manualCode.trim());
  };

  const performCheckIn = async (code: string) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/tickets/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Check-in completato!" : "Errore durante il check-in"),
        ticket: data.ticket,
      });

      if (response.ok) {
        setManualCode("");
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setResult({
        success: false,
        message: "Errore di connessione. Riprova.",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "manual" | "camera") => {
    setMode(newMode);
    setResult(null);
    setManualCode("");
    
    if (newMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Check-in Staff</h1>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => switchMode("manual")}
          className="flex-1"
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Inserimento Manuale
        </Button>
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => switchMode("camera")}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          Scanner Fotocamera
        </Button>
      </div>

      {/* Manual Input Mode */}
      {mode === "manual" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inserisci Codice Biglietto</CardTitle>
            <CardDescription>
              Digita il codice alfanumerico presente sul biglietto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="es. ABC12345"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                disabled={loading}
                className="font-mono text-lg"
              />
              <Button
                onClick={handleManualCheckIn}
                disabled={loading || !manualCode.trim()}
              >
                {loading ? "Verifica..." : "Check-in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera Scanner Mode */}
      {mode === "camera" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scanner QR Code</CardTitle>
            <CardDescription>
              Inquadra il QR code del biglietto con la fotocamera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white rounded-lg shadow-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Per una migliore scansione, usa l&apos;inserimento manuale o integra la libreria jsQR
            </p>
          </CardContent>
        </Card>
      )}

      {/* Check-in Result */}
      {result && (
        <Alert
          variant={result.success ? "default" : "destructive"}
          className={result.success ? "border-green-500 bg-green-50" : ""}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="flex-1">
              <AlertDescription className="font-semibold text-lg mb-2">
                {result.message}
              </AlertDescription>
              
              {result.success && result.ticket && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Ticket Code and Status */}
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div>
                          <p className="text-sm text-muted-foreground">Codice Biglietto</p>
                          <p className="font-mono font-bold text-xl">{result.ticket.code}</p>
                        </div>
                        <Badge className="bg-green-600">
                          CHECK-IN ✓
                        </Badge>
                      </div>

                      {/* Event Details */}
                      <div className="flex items-start gap-3">
                        <CalendarDays className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-lg">{result.ticket.event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.ticket.event.dateStart).toLocaleDateString("it-IT", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {result.ticket.event.venue && (
                            <p className="text-sm text-muted-foreground mt-1">
                              📍 {result.ticket.event.venue.name}, {result.ticket.event.venue.city}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* User Details */}
                      {result.ticket.user && (
                        <div className="flex items-start gap-3 pt-3 border-t">
                          <User className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">
                              {result.ticket.user.userProfile?.firstName}{" "}
                              {result.ticket.user.userProfile?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {result.ticket.user.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Istruzioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Verifica che il biglietto sia valido (non annullato o già utilizzato)</p>
          <p>✓ Il check-in può essere effettuato solo una volta per biglietto</p>
          <p>✓ Assicurati che l&apos;evento corrisponda a quello attuale</p>
          <p>✓ In caso di problemi, contatta l&apos;organizzatore</p>
        </CardContent>
      </Card>
    </div>
  );
}
