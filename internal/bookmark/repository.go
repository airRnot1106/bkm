package bookmark

type Repository interface {
	Add(bookmark Bookmark) error
	List() ([]Bookmark, error)
}
