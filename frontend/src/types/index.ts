// types interface

export interface DetectionResult {
    language: string
    confidence: number
    inputType: "text" // TODO: future implementation of other input types
}

export interface DetectionRequest {
    type: "text" // TODO: "voice" in the future
    data: string // TODO: could take on other data
}

export type InputMode = "text" // | "voice"

export interface InputState {
    mode: InputMode
    isLoading: boolean
    error: string | null
    result: DetectionResult | null
}