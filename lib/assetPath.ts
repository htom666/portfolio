const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
export const ap = (path: string) => `${BASE}${path}`
