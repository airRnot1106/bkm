package opener

import "github.com/airRnot1106/bkm/internal/bookmark"

type Opener interface {
	Open(bm bookmark.Bookmark) error
}
