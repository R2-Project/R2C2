package auth

import "errors"

var ErrInvalidCredentials = errors.New("invalid username or password")
var ErrNoOperatorDefined = errors.New("no operator defined in configuration")
