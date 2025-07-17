import type { DetectionResult } from "../types"
import { Globe } from "lucide-react"

interface ResultDisplayProps {
    result: DetectionResult | null
    isLoading: boolean
    error: string | null
}

export function ResultDisplay({ result, isLoading, error }: ResultDisplayProps) {
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200"
        if (confidence >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-red-100 text-red-800 border-red-200"
    }

    return (
        <div className="min-h-[100px] flex items-center justify-center">
            {isLoading && (
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <div
                                className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-purple-500 rounded-full animate-spin"
                                style={{ animationDelay: "150ms" }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-gray-600 animate-pulse">Analyzing your input...</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="text-center space-y-2 animate-in fade-in-50 duration-500">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-500 text-xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-red-600">Detection Failed</h3>
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}
            {result && !isLoading && !error && (
                result.confidence > 70 ? (
                    <div className="text-center space-y-4 animate-in fade-in-50 duration-500">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">Detection Result</h3>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <span className="text-lg px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                                    {result.language}
                                </span>
                                <span className={`px-3 py-1 rounded-full border ${getConfidenceColor(result.confidence)}`}>
                                    {result.confidence.toFixed(0)}% confident
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            {result.confidence >= 80
                                ? "I'm quite confident about this detection! 🎯"
                                : "This is my best guess based on the patterns 🤔"}
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-2 animate-in fade-in-50 duration-500">
                        <p className="text-sm text-gray-600">
                            Hmmm, I’m not sure. Try again with longer text and standard punctuation/writing style.
                        </p>
                    </div>
                )
            )}


        </div>
    )
}