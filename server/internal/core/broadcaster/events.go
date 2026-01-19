package broadcaster

const UI_NAVIGATE_EVENT = "ui:navigate"
const REFRESH_SESSIONS_EVENT = "ui:refresh_sessions"
const TASK_RESULT_EVENT = "task:result"

type UINavigateEvent struct {
	View string `json:"view"`
}
