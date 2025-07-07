"use client"

import { useLanguageDetection } from "../hooks/useLanguageDetection"
import { TextInput } from "./TextInput"
import { ResultDisplay } from "./ResultDisplay"
import { Globe } from "lucide-react"

export default function LanguageDetection() {
    const { mode, isLoading, error, result, detectLanguage } = useLanguageDetection()

    const handleTextSubmit = async (text: string) => {
        await detectLanguage({
            type: "text",
            data: text,
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
                {/* Header */}
                <div className="text-center space-y-2 p-8 pb-4">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Language Detector
                    </h1>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-6">
                    <TextInput onSubmit={handleTextSubmit} disabled={isLoading} />
                    <ResultDisplay result={result} isLoading={isLoading} error={error} />
                </div>
            </div>
        </div>
    )
}