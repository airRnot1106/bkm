package bookmark

import (
	"errors"
	"net/url"
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
