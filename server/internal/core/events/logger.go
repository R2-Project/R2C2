package events

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

var zLog zerolog.Logger

func init() {

	logFile, _ := os.OpenFile("r2c2.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)

	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}

	fileWriter := zerolog.ConsoleWriter{
		Out:        logFile,
		TimeFormat: time.RFC3339,
		NoColor:    true, // no ANSI colors in .log file
	}

	// We pass the raw WSWriter. Zerolog will write the raw JSON bytes to it.
	// wsWriter := &WSWriter{Hub: hub}

	multi := zerolog.MultiLevelWriter(consoleWriter, fileWriter)

	zLog = zerolog.New(multi).With().Timestamp().Logger()
}

func Info(msg string, keysAndValues ...interface{}) {
	logEvent(zLog.Info(), msg, keysAndValues...)
}

func Warn(msg string, keysAndValues ...interface{}) {
	logEvent(zLog.Warn(), msg, keysAndValues...)
}

func Error(msg string, err error, keysAndValues ...interface{}) {
	event := zLog.Error()
	if err != nil {
		event.Err(err)
	}
	logEvent(event, msg, keysAndValues...)
}

func logEvent(event *zerolog.Event, msg string, keysAndValues ...interface{}) {
	for i := 0; i < len(keysAndValues); i += 2 {
		if i+1 < len(keysAndValues) {
			key, ok := keysAndValues[i].(string)
			if ok {
				event.Interface(key, keysAndValues[i+1])
			}
		}
	}
	event.Msg(msg)
}
