// ✅ Full fixed component:
"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2, Loader2 } from "lucide-react"
import QRCode from "qrcode"
import { toast } from "sonner"

export function KHQRCard({
    accountNumber,
    accountName,
}: {
    accountNumber: string
    accountName: string
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isGenerating, setIsGenerating] = useState(true)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // ✅ Defined inside effect — no missing dep warning
        const buildKHQRString = () => {
            const sanitizedAccount = accountNumber.replace(/-/g, "")
            const sanitizedName = accountName.slice(0, 25).toUpperCase()

            return [
                "000201",
                "010212",
                `26${String(44 + sanitizedAccount.length).padStart(2, "0")}`,
                "0010dev.khmerbank",
                `01${String(sanitizedAccount.length).padStart(2, "0")}${sanitizedAccount}`,
                "5204000053031165802KH",
                `5913${sanitizedName.padEnd(13)}`,
                "6010Phnom Penh",
                "6304",
            ].join("")
        }

        setIsGenerating(true)

        QRCode.toCanvas(canvas, buildKHQRString(), {
            width: 180,
            margin: 2,
            color: {
                dark: "#1a1a2e",
                light: "#ffffff",
            },
            errorCorrectionLevel: "M",
        })
            .then(() => setIsGenerating(false))
            .catch((err) => {
                console.error("[QR_GENERATE_ERROR]", err)
                setIsGenerating(false)
            })
    }, [accountNumber, accountName]) // ✅ Only real deps

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
                <div className="p-4 bg-white/10 backdrop-blur-sm flex justify-between items-center">
                    <span className="font-bold tracking-widest text-lg">KHQR</span>
                    <div className="bg-white px-2 py-1 rounded">
                        <div className="text-[10px] text-red-600 font-black italic tracking-wider">
                            BAKONG
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-6 pb-4 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl relative">
                        {isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            className="rounded-lg"
                            style={{ display: isGenerating ? "none" : "block" }}
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-sm opacity-80">Scan to pay</p>
                        <p className="font-bold text-lg">{accountName}</p>
                        <p className="font-mono text-sm opacity-70">{accountNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-t border-white/20">
                    <button
                        onClick={handleDownload}
                        className="p-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-r border-white/20"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">Save QR</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs font-medium">Share</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}