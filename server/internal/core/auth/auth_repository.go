package auth

import "github.com/mati-olivera/R2C2/internal/core/operators"

type AuthRepository interface {
	GetOperatorByUsername(username string) (*operators.Operator, error)
	CreateOperatorIfNotExists(operatorData operators.Operator) error
}
