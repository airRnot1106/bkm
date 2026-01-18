package opener

import (
	"fmt"
	"os/exec"
	"runtime"

	"github.com/airRnot1106/bkm/internal/bookmark"
)

type BrowserOpener struct{}

var _ Opener = (*BrowserOpener)(nil)

func NewBrowserOpener() *BrowserOpener {
	return &BrowserOpener{}
}

func (o *BrowserOpener) Open(bm bookmark.Bookmark) error {
	url := bm.URL.Value()
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	return cmd.Run()
}
