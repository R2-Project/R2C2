package operators

type OperatorLoad struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Operator struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash"`
	CreatedAt    string `json:"created_at"`
	LastLogin    string `json:"last_login"`
}
