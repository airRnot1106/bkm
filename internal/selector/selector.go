package selector

import (
	"errors"

	"github.com/airRnot1106/bkm/internal/bookmark"
)

var ErrCancelled = errors.New("selection cancelled")

type Selector interface {
	Select(items []bookmark.Bookmark) (bookmark.Bookmark, error)
}
