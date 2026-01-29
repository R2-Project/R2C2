package tasks

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"

	"github.com/mati-olivera/R2C2/internal/config"
)

// may change this later
func saveScreenshot(bas64Data string, filePath string) error {
	lootPath := config.GetConfig().LootPath

	data, err := base64.StdEncoding.DecodeString(bas64Data)
	if err != nil {
		return err
	}

	lootDir := filepath.Join(lootPath, "screenshots")
	os.MkdirAll(lootDir, 0755)

	localPath := filepath.Join(lootDir, filePath)

	err = os.WriteFile(localPath, data, 0644)
	if err != nil {
		return fmt.Errorf("error saving screenshot to %s: %v", localPath, err)
	}

	return nil

}
