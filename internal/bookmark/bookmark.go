package bookmark

import (
	"errors"
	"net/url"
	"strings"
)

type BookmarkURL struct {
	value string
}

func NewBookmarkURL(rawURL string) (BookmarkURL, error) {
	if rawURL == "" {
		return BookmarkURL{}, errors.New("URL cannot be empty")
	}
	parsed, err := url.ParseRequestURI(rawURL)

	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return BookmarkURL{}, errors.New("invalid URL format")
	}

	return BookmarkURL{value: rawURL}, nil
}

func (u BookmarkURL) Value() string {
	return u.value
}

type BookmarkTitle struct {
	value string
}

func NewBookmarkTitle(title string) (BookmarkTitle, error) {
	trimmed := strings.TrimSpace(title)

	if trimmed == "" {
		return BookmarkTitle{}, errors.New("title cannot be empty")
	}

	return BookmarkTitle{value: trimmed}, nil
}

func (t BookmarkTitle) Value() string {
	return t.value
}
