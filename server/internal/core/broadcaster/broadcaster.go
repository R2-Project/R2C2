package broadcaster

import (
	"encoding/json"

	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type Broadcaster interface {
	BroadcastMessage(message []byte)
	SendToOperator(operatorId string, message []byte)
}

var instance Broadcaster

func SetBroadcaster(b Broadcaster) {
	instance = b
}

type broadcastEvent struct {
	Event string `json:"event"`
	Data  []byte `json:"data"`
}

func BroadcastEvent(event string, message []byte) {
	if instance != nil {
		result, err := json.Marshal(broadcastEvent{
			Event: event,
			Data:  message,
		})
		if err != nil {
			logger.Error("Failed to marshal broadcast event", err)
			return
		}
		instance.BroadcastMessage(result)
	}
}

func SendToOperator(operatorId string, message []byte) {
	if instance != nil {
		instance.SendToOperator(operatorId, message)
	}
}
