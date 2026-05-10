"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2, Loader2, RefreshCw } from "lucide-react"
import QRCode from "qrcode"
import { toast } from "sonner"
import { generateKHQRAction } from "@/app/actions/khqr"

interface KHQRCardProps {
    accountNumber: string
    accountName: string
}

interface QRState {
    qrString: string
    md5: string
}

export function KHQRCard({ accountNumber, accountName }: KHQRCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrState, setQrState] = useState<QRState | null>(null)
    const [isRendering, setIsRendering] = useState(false)
    const [isPending, startTransition] = useTransition()

    // ── Step 1: Generate the real KHQR string via server action ──
    const generateQR = () => {
        startTransition(async () => {
            const result = await generateKHQRAction(accountNumber, accountName)

            if (!result.success) {
                toast.error(result.error ?? "Failed to generate KHQR")
                return
            }

            setQrState({
                qrString: result.data.qr,
                md5: result.data.md5,
            })
        })
    }

    // ── Step 2: Render the QR string onto canvas whenever it changes ──
    useEffect(() => {
        if (!qrState?.qrString || !canvasRef.current) return

        const canvas = canvasRef.current
        setIsRendering(true)

        QRCode.toCanvas(canvas, qrState.qrString, {
            width: 180,
            margin: 2,
            color: {
                dark: "#1a1a2e",
                light: "#ffffff",
            },
            errorCorrectionLevel: "M",
        })
            .then(() => setIsRendering(false))
            .catch((err) => {
                console.error("[QR_RENDER_ERROR]", err)
                setIsRendering(false)
                toast.error("Failed to render QR code")
            })
    }, [qrState?.qrString])

    // ── Auto-generate on mount ──
    useEffect(() => {
        generateQR()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountNumber, accountName])

    const isLoading = isPending || isRendering

    // ── Download ──
    const handleDownload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const url = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = url
        a.download = `KhmerBank_KHQR_${accountNumber}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        toast.success("QR code saved!")
    }

    // ── Share ──
    const handleShare = async () => {
        const canvas = canvasRef.current
        if (!canvas) return

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) return
                const file = new File([blob], "khqr.png", { type: "image/png" })

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "My KhmerBank KHQR",
                        text: `Pay to ${accountName} — ${accountNumber}`,
                        files: [file],
                    })
                } else {
                    await navigator.clipboard.writeText(accountNumber)
                    toast.success("Account number copied to clipboard!")
                }
            })
        } catch {
            toast.error("Sharing not supported on this device")
        }
    }

    return (
        <Card className="bg-linear-to-b from-red-600 to-red-800 border-none text-white overflow-hidden">
            <CardContent className="p-0">
                {/* ── Header ── */}
                <div className="p-4 bg-white/10 backdrop-blur-sm flex justify-between items-center">
                    <span className="font-bold tracking-widest text-lg">KHQR</span>
                    <div className="flex items-center gap-2">
                        {/* Refresh button */}
                        <button
                            onClick={generateQR}
                            disabled={isLoading}
                            className="p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
                            title="Regenerate QR"
                        >
                            <RefreshCw
                                className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                            />
                        </button>
                        <div className="bg-white px-2 py-1 rounded">
                            <div className="text-[10px] text-red-600 font-black italic tracking-wider">
                                BAKONG
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── QR Canvas ── */}
                <div className="px-8 pt-6 pb-4 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl relative">
                        {/* Loading overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl z-10">
                                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                            </div>
                        )}

                        {/* Canvas — always mounted so ref is stable */}
                        <canvas
                            ref={canvasRef}
                            className="rounded-lg"
                            style={{ display: isLoading || !qrState ? "none" : "block" }}
                        />

                        {/* Empty state — before first generation */}
                        {!isLoading && !qrState && (
                            <div className="w-[180px] h-[180px] flex items-center justify-center">
                                <p className="text-xs text-gray-400 text-center">
                                    Generating...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Account info */}
                    <div className="text-center">
                        <p className="text-sm opacity-80">Scan to pay</p>
                        <p className="font-bold text-lg">{accountName}</p>
                        <p className="font-mono text-sm opacity-70">{accountNumber}</p>
                    </div>

                    {/* MD5 — for verification, shown subtly */}
                    {qrState?.md5 && (
                        <p className="text-[9px] opacity-40 font-mono break-all text-center px-2">
                            {qrState.md5}
                        </p>
                    )}
                </div>

                {/* ── Action Buttons ── */}
                <div className="grid grid-cols-2 border-t border-white/20">
                    <button
                        onClick={handleDownload}
                        disabled={isLoading || !qrState}
                        className="p-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-r border-white/20 disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">Save QR</span>
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isLoading || !qrState}
                        className="p-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-40"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Share</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}