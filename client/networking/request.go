package networking

import (
	"bytes"
	"io"
	"net/http"
)

type Response struct {
	StatusCode int    `json:"statusCode"`
	Body       string `json:"body"`
	Error      string `json:"error"`
}

func Request(method string, url string, headers map[string]string, body string) Response {
	client := &http.Client{}

	var reqBody io.Reader
	if body != "" {
		reqBody = bytes.NewBuffer([]byte(body))
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return Response{Error: err.Error()}
	}

	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
	if err != nil {
		return Response{Error: err.Error()}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return Response{StatusCode: resp.StatusCode, Error: err.Error()}
	}

	return Response{
		StatusCode: resp.StatusCode,
		Body:       string(respBody),
	}
}
