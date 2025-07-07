"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

interface TextInputProps {
    onSubmit: (text: string) => void
    disabled?: boolean
}

export function TextInput({ onSubmit, disabled }: TextInputProps) {
    const [text, setText] = useState("")

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text.trim())
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="text-input" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Your Text
                </label>
                <textarea
                    id="text-input"
                    placeholder="Enter some text and I'll guess what language it is! ✨"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                    className="w-full min-h-[120px] p-4 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-colors resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={5}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!text.trim() || disabled}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Detect Language
            </button>
        </div>
    )
}