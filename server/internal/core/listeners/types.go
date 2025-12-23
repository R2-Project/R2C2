package listeners

import "encoding/json"

type NewListenerRequest struct {
	Protocol string          `json:"protocol" binding:"required"`
	Data     json.RawMessage `json:"data" binding:"required"`
}
