package broadcaster

const UI_NAVIGATE_EVENT = "ui:navigate"

type UINavigateEvent struct {
	View string `json:"view"`
}
