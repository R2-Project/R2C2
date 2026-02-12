package main

import (
	"client/networking"
	"context"
	"encoding/json"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	secureConn *networking.SecureWebSocket
}

type BroadcastEvent struct {
	Event string `json:"event"`
	Data  string `json:"data"`
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

func (a *App) Download(url string, headers map[string]string) (string, error) {
	return networking.Download(url, headers)
}

func (a *App) DownloadToFile(url string, filePath string, headers map[string]string) error {
	return networking.DownloadToFile(url, filePath, headers)
}

func (a *App) SelectSavePath(filename string) (string, error) {
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: filename,
		Title:           "Save Agent Payload",
	})
}

func (a *App) ListenC2Events(secureConn *networking.SecureWebSocket) {
	fmt.Println("Starting C2 Event Listener...")
	for {
		_, message, err := secureConn.Conn.ReadMessage()
		if err != nil {
			fmt.Printf("Error reading C2 event: %v\n", err)
			runtime.EventsEmit(a.ctx, "network:error", err.Error())
			// TODO: reconnection logic?
			break
		}

		fmt.Printf("Received C2 event: %s\n", string(message))

		var event BroadcastEvent
		err = json.Unmarshal(message, &event)
		if err == nil && event.Event != "" {
			runtime.EventsEmit(a.ctx, event.Event, event.Data)
		} else {
			runtime.EventsEmit(a.ctx, "c2:event", string(message))
		}
	}
}
