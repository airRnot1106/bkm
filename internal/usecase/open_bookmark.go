package usecase

import (
	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/opener"
)

type OpenBookmarkInput struct {
	Bookmark bookmark.Bookmark
}

type OpenBookmark struct {
	opener opener.Opener
}

func NewOpenBookmark(opener opener.Opener) *OpenBookmark {
	return &OpenBookmark{opener: opener}
}

func (uc *OpenBookmark) Execute(input OpenBookmarkInput) error {
	return uc.opener.Open(input.Bookmark)
}
