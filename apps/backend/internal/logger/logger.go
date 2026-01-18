package logger

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"
)

// Level represents log severity
type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
)

func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

// Logger is a simple structured logger
type Logger struct {
	mu       sync.Mutex
	out      io.Writer
	level    Level
	jsonMode bool
}

// LogEntry represents a structured log entry
type LogEntry struct {
	Time    string                 `json:"time"`
	Level   string                 `json:"level"`
	Message string                 `json:"message"`
	Fields  map[string]interface{} `json:"fields,omitempty"`
}

var defaultLogger *Logger

func init() {
	defaultLogger = New(os.Stdout)
}

// New creates a new logger
func New(out io.Writer) *Logger {
	return &Logger{
		out:      out,
		level:    INFO,
		jsonMode: false,
	}
}

// SetLevel sets the minimum log level
func (l *Logger) SetLevel(level Level) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// SetJSONMode enables/disables JSON output
func (l *Logger) SetJSONMode(enabled bool) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.jsonMode = enabled
}

// ParseLevel parses a level string
func ParseLevel(s string) Level {
	switch strings.ToUpper(s) {
	case "DEBUG":
		return DEBUG
	case "INFO":
		return INFO
	case "WARN", "WARNING":
		return WARN
	case "ERROR":
		return ERROR
	default:
		return INFO
	}
}

func (l *Logger) log(level Level, msg string, fields map[string]interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()

	if level < l.level {
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)

	if l.jsonMode {
		entry := LogEntry{
			Time:    now,
			Level:   level.String(),
			Message: msg,
			Fields:  fields,
		}
		data, _ := json.Marshal(entry)
		fmt.Fprintln(l.out, string(data))
	} else {
		if len(fields) > 0 {
			fieldStr := ""
			for k, v := range fields {
				fieldStr += fmt.Sprintf(" %s=%v", k, v)
			}
			fmt.Fprintf(l.out, "%s [%s] %s%s\n", now, level.String(), msg, fieldStr)
		} else {
			fmt.Fprintf(l.out, "%s [%s] %s\n", now, level.String(), msg)
		}
	}
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(DEBUG, msg, f)
}

// Info logs an info message
func (l *Logger) Info(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(INFO, msg, f)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(WARN, msg, f)
}

// Error logs an error message
func (l *Logger) Error(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(ERROR, msg, f)
}

// Package-level functions using default logger

// Configure sets up the default logger
func Configure(level string, jsonMode bool) {
	defaultLogger.SetLevel(ParseLevel(level))
	defaultLogger.SetJSONMode(jsonMode)
}

// Debug logs a debug message
func Debug(msg string, fields ...map[string]interface{}) {
	defaultLogger.Debug(msg, fields...)
}

// Info logs an info message
func Info(msg string, fields ...map[string]interface{}) {
	defaultLogger.Info(msg, fields...)
}

// Warn logs a warning message
func Warn(msg string, fields ...map[string]interface{}) {
	defaultLogger.Warn(msg, fields...)
}

// Error logs an error message
func Error(msg string, fields ...map[string]interface{}) {
	defaultLogger.Error(msg, fields...)
}

// F is a helper to create field maps
func F(keyvals ...interface{}) map[string]interface{} {
	m := make(map[string]interface{})
	for i := 0; i+1 < len(keyvals); i += 2 {
		if key, ok := keyvals[i].(string); ok {
			m[key] = keyvals[i+1]
		}
	}
	return m
}
