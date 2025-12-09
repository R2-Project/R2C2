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