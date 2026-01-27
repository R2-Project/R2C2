package broadcaster

const UI_NAVIGATE_EVENT = "ui:navigate"
const TASK_RESULT_EVENT = "task:result"
const TASK_FETCH_EVENT = "task:fetch"
const BEACON_UPDATED_EVENT = "agent:beacon_updated"

type UINavigateEvent struct {
	View    string `json:"view"`
	AgentId string `json:"agent_id,omitempty"`
}
