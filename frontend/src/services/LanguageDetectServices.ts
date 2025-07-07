import type { DetectionResult, DetectionRequest } from "../types";

export class LanguageDetectService {
    private static readonly BASE_URL = "/api"

    static async detect(request: DetectionRequest): Promise<DetectionResult> {
        const endpoint = `${this.BASE_URL}/detect-${request.type}`
        const body = JSON.stringify({
            text: request.data
        })
        // TODO: implement for other request types 

        const headers: HeadersInit = request.type === "text" ? { "Content-Type": "application/json" } : {}
        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body,
        })
        if (!response.ok) {
            throw new Error("API Error: ${response.status}")
        }
        return await response.json()

    }

}