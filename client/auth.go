package main

import (
	"client/networking"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/gorilla/websocket"
)

/*
Login handles user authentication and establishes a WebSocket connection.
@param serverURL: The base URL of the server to connect to.
@param username: The username for authentication.
@param password: The password for authentication.
*/
func (a *App) Login(serverURL string, username string, password string) (string, error) {

	if !strings.HasPrefix(serverURL, "http") {
		serverURL = "http://" + serverURL // TODO: add tls
	}

	u, err := url.Parse(serverURL)
	if err != nil {
		return "", fmt.Errorf("invalid URL format: %w", err)
	}

	token, err := a.authenticate(serverURL, username, password)
	if err != nil {
		return "", err
	}

	wsScheme := "wss"
	if u.Scheme == "http" {
		wsScheme = "ws"
	}

	u.Scheme = wsScheme
	u.Path = "/ws"

	q := u.Query()
	q.Set("token", token)
	u.RawQuery = q.Encode()

	finalWSUrl := u.String()

	err = a.connectToWebSocket(finalWSUrl, token)
	if err != nil {
		return "", fmt.Errorf("login successful, but websocket failed: %w", err)
	}

	return token, nil
}

type authResponse struct {
	Token string `json:"token"`
}

func (a *App) authenticate(baseUrl, user, pass string) (string, error) {
	headers := map[string]string{
		"Content-Type": "application/json",
	}

	body := fmt.Sprintf(`{"username":"%s","password":"%s"}`, user, pass)
	resp := a.Request("POST", baseUrl+"/auth/login", headers, body)
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("authentication failed: %s", resp.Body)
	}
	var authResp authResponse
	err := json.Unmarshal([]byte(resp.Body), &authResp)
	if err != nil {
		return "", fmt.Errorf("failed to parse authentication response: %w", err)
	}
	return authResp.Token, nil
}

func (a *App) connectToWebSocket(wsUrl string, token string) error {
	conn, _, err := websocket.DefaultDialer.Dial(wsUrl, nil)
	if err != nil {
		return fmt.Errorf("websocket connection failed: %w", err)
	}
	a.secureConn = networking.NewSecureWebSocket(conn)
	go a.ListenC2Events(a.secureConn)
	return nil
}
