export class AIError extends Error {
  code: string;
  details?: any;
  suggestion?: string;
  constructor(code: string, message: string, details?: any, suggestion?: string) {
    super(message);
    this.code = code;
    this.details = details;
    this.suggestion = suggestion;
  }
  toAIResponse() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
      ...(this.suggestion ? { suggestion: this.suggestion } : {})
    };
  }
}

export function aiErrorResponse(code: string, message: string, details?: any, suggestion?: string) {
  return {
    content: [
      {
        type: "json",
        text: JSON.stringify({
          error: true,
          code,
          message,
          ...(details ? { details } : {}),
          ...(suggestion ? { suggestion } : {})
        })
      }
    ]
  };
}
