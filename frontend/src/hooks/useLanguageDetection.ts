"use client"

import { useState, useCallback } from "react"
import type { DetectionRequest, InputMode, InputState } from "../types"
import { LanguageDetectService } from "../services/LanguageDetectServices"

export function useLanguageDetection() {
    const [state, setState] = useState<InputState>({
        mode: "text",
        isLoading: false,
        error: null,
        result: null
    })

    const detectLanguage = useCallback(async (request: DetectionRequest) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null, result: null }))

        try {
            const result = await LanguageDetectService.detect(request)
            setState((prev) => ({ ...prev, result, isLoading: false }))
            return result
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Detection failed"
            setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }))
            throw error
        }
    }, [])

    const switchMode = useCallback((mode: InputMode) => {
        setState((prev) => ({
            ...prev,
            mode,
            error: null,
            result: null,
        }))
    }, [])

    const reset = useCallback(() => {
        setState((prev) => ({
            ...prev,
            error: null,
            result: null,
        }))
    }, [])

    return {
        ...state,
        detectLanguage,
        switchMode,
        reset,
    }
}