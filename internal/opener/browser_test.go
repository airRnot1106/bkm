package opener_test

import (
	"testing"

	"github.com/airRnot1106/bkm/internal/opener"
)

func TestNewBrowserOpener(t *testing.T) {
	browser := opener.NewBrowserOpener()
	if browser == nil {
		t.Fatal("BrowserOpener should not be nil")
	}
}
