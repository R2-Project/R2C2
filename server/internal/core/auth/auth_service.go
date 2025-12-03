package auth

import (
	"fmt"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mati-olivera/R2C2/internal/config"
	"github.com/mati-olivera/R2C2/internal/core/logger"
	"github.com/mati-olivera/R2C2/internal/core/operators"
)

type AuthService struct {
	authRepository AuthRepository
}

func NewAuthService(authRepository AuthRepository) *AuthService {
	return &AuthService{
		authRepository: authRepository,
	}
}

func (s *AuthService) Login(username string, password string) (*string, error) {

	operator, err := s.authRepository.GetOperatorByUsername(username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	match, err := ComparePasswordAndHash(password, operator.PasswordHash)
	if err != nil || !match {
		return nil, ErrInvalidCredentials
	}

	claims := jwt.MapClaims{
		"operator_id": operator.ID,
		"username":    operator.Username,
		"exp":         time.Now().Add(time.Hour * 12).Unix(),
		"iat":         time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	conf := config.GetConfig()

	tokenStr, err := token.SignedString([]byte(conf.JWTSecret))
	if err != nil {
		return nil, err
	}

	// TODO: save last login

	return &tokenStr, nil
}

func (s *AuthService) LoadOperator(cfg *config.Config) (*operators.Operator, error) {
	operatorData := cfg.Operators[0]
	if operatorData.Username == "" || operatorData.Password == "" {
		return nil, ErrNoOperatorDefined
	}

	passwordHash, err := CreateHash(operatorData.Password)
	if err != nil {
		return nil, err
	}

	operator := operators.Operator{
		ID:           uuid.New().String(),
		Username:     operatorData.Username,
		PasswordHash: passwordHash,
		CreatedAt:    time.Now().Format(time.RFC3339),
	}

	err = s.authRepository.CreateOperatorIfNotExists(operator)
	if err != nil {
		return nil, err
	}

	logger.Info(fmt.Sprintf("Operator '%s' loaded", operator.Username))

	return &operator, nil
}

type OperatorClaims struct {
	OperatorID string `json:"operator_id"`
	Username   string `json:"username"`
	jwt.RegisteredClaims
}

func ValidateToken(tokenString string, secret string) (*OperatorClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &OperatorClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*OperatorClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidTokenClaims
}
