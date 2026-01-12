package bookmark_test

import (
	"strings"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/google/uuid"
	"pgregory.net/rapid"
)

func TestNewBookmarkID_ValidUUIDsAlwaysSucceed(t *testing.T) {
	uuid := uuid.New()

	bookmarkID, err := bookmark.NewBookmarkID(uuid.String())

	if err != nil {
		t.Fatalf("valid UUID %q should succeed, got error: %v", uuid, err)
	}

	if bookmarkID.Value() != uuid.String() {
		t.Fatalf("UUID value should be preserved: expected %q, got %q",
			uuid, bookmarkID.Value())
	}
}

func TestNewBookmarkID_InvalidUUIDsAlwaysFail(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		invalidUUID := rapid.String().Filter(func(s string) bool {
			_, err := uuid.Parse(s)
			return err != nil
		}).Draw(t, "invalidUUID")

		_, err := bookmark.NewBookmarkID(invalidUUID)

		if err == nil {
			t.Fatalf("invalid UUID %q should fail", invalidUUID)
		}
	})
}

func TestGenerateBookmarkID_AlwaysGeneratesValidUUID(t *testing.T) {
	bookmarkID := bookmark.GenerateBookmarkID()

	if _, err := uuid.Parse(bookmarkID.Value()); err != nil {
		t.Fatalf("generated BookmarkID %q should be valid UUID, got error: %v",
			bookmarkID.Value(), err)
	}
}

func TestNewBookmarkURL_ValidURLsAlwaysSucceed(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		scheme := rapid.SampledFrom([]string{"http", "https", "ftp"}).Draw(t, "scheme")
		host := rapid.StringMatching(`[a-zA-Z0-9.-]+`).Draw(t, "host")
		path := rapid.StringMatching(`(/[a-zA-Z0-9._-]+)*`).Draw(t, "path")

		rawURL := scheme + "://" + host + path

		bookmarkURL, err := bookmark.NewBookmarkURL(rawURL)

		if err != nil {
			t.Fatalf("valid URL %q should succeed, got error: %v", rawURL, err)
		}

		if bookmarkURL.Value() != rawURL {
			t.Fatalf("URL value should be preserved: expected %q, got %q",
				rawURL, bookmarkURL.Value())
		}
	})
}

func TestNewBookmarkURL_EmptyStringAlwaysFails(t *testing.T) {
	_, err := bookmark.NewBookmarkURL("")

	if err == nil {
		t.Fatal("empty string should fail")
	}
}

func TestNewBookmarkURL_NoSchemeAlwaysFails(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		host := rapid.StringMatching(`[a-z0-9\-]+\.[a-z]{2,}`).Draw(t, "host")
		path := rapid.StringMatching(`(/[a-z0-9\-]*)*`).Draw(t, "path")

		rawURL := host + path // schemeなし

		_, err := bookmark.NewBookmarkURL(rawURL)

		if err == nil {
			t.Fatalf("URL without scheme %q should fail", rawURL)
		}
	})
}

func TestNewBookmarkURL_NoHostAlwaysFails(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		scheme := rapid.SampledFrom([]string{"http", "https", "ftp"}).Draw(t,
			"scheme")

		rawURL := rapid.SampledFrom([]string{
			scheme + "://",
			scheme + ":///path",
		}).Draw(t, "pattern")

		_, err := bookmark.NewBookmarkURL(rawURL)

		if err == nil {
			t.Fatalf("URL without host %q should fail", rawURL)
		}
	})
}

func TestNewBookmarkTitle_ValidTitlesAlwaysSucceed(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		title := rapid.String().Filter(func(s string) bool {
			return strings.TrimSpace(s) != ""
		}).Draw(t, "title")

		bookmarkTitle, err := bookmark.NewBookmarkTitle(title)

		if err != nil {
			t.Fatalf("valid title %q should succeed, got error: %v", title,
				err)
		}

		trimmed := strings.TrimSpace(title)

		if bookmarkTitle.Value() != trimmed {
			t.Fatalf("title value should be preserved: expected %q, got %q",
				title, bookmarkTitle.Value())
		}
	})
}

func TestNewBookmarkTitle_EmptyOrWhitespaceOnlyAlwaysFails(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		title := rapid.StringMatching(`\s*`).Draw(t, "title")

		_, err := bookmark.NewBookmarkTitle(title)

		if err == nil {
			t.Fatalf("empty or whitespace-only title %q should fail", title)
		}
	})
}

func TestNewBookmarkDescription_AnyStringAlwaysSucceeds(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		description := rapid.String().Draw(t, "description")

		bookmarkDescription := bookmark.NewBookmarkDescription(description)

		trimmed := strings.TrimSpace(description)

		if bookmarkDescription.Value() != trimmed {
			t.Fatalf("description value should be preserved: expected %q, got %q",
				trimmed, bookmarkDescription.Value())
		}
	})
}

func TestNewBookmarkTag_ValidTagsAlwaysSucceed(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		tag := rapid.String().Filter(func(s string) bool {
			return strings.TrimSpace(s) != ""
		}).Draw(t, "tag")

		bookmarkTag, err := bookmark.NewBookmarkTag(tag)

		if err != nil {
			t.Fatalf("valid tag %q should succeed, got error: %v", tag, err)
		}

		trimmed := strings.TrimSpace(tag)

		if bookmarkTag.Value() != trimmed {
			t.Fatalf("tag value should be preserved: expected %q, got %q",
				trimmed, bookmarkTag.Value())
		}
	})
}

func TestNewBookmarkTag_EmptyOrWhitespaceOnlyAlwaysFails(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		tag := rapid.StringMatching(`\s*`).Draw(t, "tag")

		_, err := bookmark.NewBookmarkTag(tag)

		if err == nil {
			t.Fatalf("empty or whitespace-only tag %q should fail", tag)
		}
	})
}
