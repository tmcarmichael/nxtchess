package ws

import (
	"encoding/json"
	"testing"
)

func TestNewServerMessage(t *testing.T) {
	data := map[string]string{"key": "value"}
	msg := NewServerMessage("TEST_TYPE", data)

	if msg.Type != "TEST_TYPE" {
		t.Errorf("expected Type %q, got %q", "TEST_TYPE", msg.Type)
	}

	d, ok := msg.Data.(map[string]string)
	if !ok {
		t.Fatalf("expected Data to be map[string]string, got %T", msg.Data)
	}
	if d["key"] != "value" {
		t.Errorf("expected Data[key]=value, got %q", d["key"])
	}
}

func TestNewErrorMessage(t *testing.T) {
	msg := NewErrorMessage("INVALID_MOVE", "That move is not legal")

	if msg.Type != MsgTypeError {
		t.Errorf("expected Type %q, got %q", MsgTypeError, msg.Type)
	}

	errData, ok := msg.Data.(ErrorData)
	if !ok {
		t.Fatalf("expected Data to be ErrorData, got %T", msg.Data)
	}
	if errData.Code != "INVALID_MOVE" {
		t.Errorf("expected Code %q, got %q", "INVALID_MOVE", errData.Code)
	}
	if errData.Message != "That move is not legal" {
		t.Errorf("expected Message %q, got %q", "That move is not legal", errData.Message)
	}
}

func TestServerMessage_JSONRoundTrip(t *testing.T) {
	original := NewServerMessage("GAME_STARTED", map[string]interface{}{
		"gameId": "abc-123",
		"color":  "white",
	})

	bytes, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("failed to marshal ServerMessage: %v", err)
	}

	var decoded ServerMessage
	if err := json.Unmarshal(bytes, &decoded); err != nil {
		t.Fatalf("failed to unmarshal ServerMessage: %v", err)
	}

	if decoded.Type != "GAME_STARTED" {
		t.Errorf("expected Type %q, got %q", "GAME_STARTED", decoded.Type)
	}
	if decoded.Data == nil {
		t.Fatal("expected Data to be non-nil after round trip")
	}
}

func TestClientMessage_JSONRoundTrip(t *testing.T) {
	rawData := json.RawMessage(`{"from":"e2","to":"e4"}`)
	original := ClientMessage{
		Type: MsgTypeMove,
		Data: rawData,
	}

	bytes, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("failed to marshal ClientMessage: %v", err)
	}

	var decoded ClientMessage
	if err := json.Unmarshal(bytes, &decoded); err != nil {
		t.Fatalf("failed to unmarshal ClientMessage: %v", err)
	}

	if decoded.Type != MsgTypeMove {
		t.Errorf("expected Type %q, got %q", MsgTypeMove, decoded.Type)
	}

	var moveData map[string]string
	if err := json.Unmarshal(decoded.Data, &moveData); err != nil {
		t.Fatalf("failed to unmarshal move data: %v", err)
	}
	if moveData["from"] != "e2" || moveData["to"] != "e4" {
		t.Errorf("expected from=e2 to=e4, got from=%q to=%q", moveData["from"], moveData["to"])
	}
}

func TestMessageTypeConstants(t *testing.T) {
	constants := map[string]string{
		"MsgTypePing":       MsgTypePing,
		"MsgTypePong":       MsgTypePong,
		"MsgTypeMove":       MsgTypeMove,
		"MsgTypeGameCreate": MsgTypeGameCreate,
		"MsgTypeError":      MsgTypeError,
	}

	for name, value := range constants {
		if value == "" {
			t.Errorf("expected %s to be a non-empty string, got empty", name)
		}
	}
}
