package listeners

type HttpListener struct {
	Id              string   `json:"id"`
	Name            string   `json:"name"`
	Port            int      `json:"port"`
	Secure          bool     `json:"secure"`
	Hosts           []string `json:"hosts"`
	LiveSince       string   `json:"live_since"`
	Status          string   `json:"status"`
	Cert            Cert     `json:"cert,omitempty"` // Optional, only if Secure is true
	ResponseHeaders []string `json:"response_headers,omitempty"`
}

type Cert struct {
	CertFile string `json:"cert_file"`
	Key      string `json:"key"`
}
