package main

import (
	"client/networking"
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	secureConn *networking.SecureWebSocket
}

func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Request(method string, url string, headers map[string]string, body string) networking.Response {
	return networking.Request(method, url, headers, body)
}

func (a *App) ListenC2Events(secureConn *networking.SecureWebSocket) {
	for {
		_, message, err := secureConn.Conn.ReadMessage()
		if err != nil {
			runtime.EventsEmit(a.ctx, "network:error", err.Error())
			// TODO: reconnection logic?
			break
		}

		runtime.EventsEmit(a.ctx, "c2:event", string(message))
	}
}
