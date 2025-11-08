
export type Listener = {
  id: string
  name: string
  host: string
  port: number
}

export type CreateHttpListenerPayload = {
  name: string
  host: string
  port: number
  secure: boolean
  // responseHeaders: string[]
  // uris: string[]
}

const API_BASE = "http://192.168.1.57:8080" // FIXME: esto tiene que venir por session

// small helper to surface backend errors
async function handleResponse(res: Response) {
  const text = await res.text()
  let data: any = text
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    /* leave as text */
  }
  if (!res.ok) {
    const message = data?.message || data || res.statusText || `HTTP ${res.status}`
    throw new Error(message)
  }
  return data
}

export async function getListeners(): Promise<Listener[]> {
  const res = await fetch(`${API_BASE}/listeners`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  })
  const data = await res.json()
  return data.data as Listener[] || []
}

export async function createHttpListener(
  payload: CreateHttpListenerPayload
): Promise<Listener> {
  const res = await fetch(`${API_BASE}/listeners/http`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export default {
  getListeners,
  createHttpListener,
}