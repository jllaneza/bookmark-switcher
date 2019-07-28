function createOption(bookmark) {
  const option = document.createElement('option')
  option.value = bookmark.title
  option.dataset.id = bookmark.id
  return option
}

function setBookmarkList() {
  // get all first level folders from the 'Other bookmarks'
  const callback = bookmarkTreeNodes => {
    const bookmarks = bookmarkTreeNodes.filter(bookmark => !bookmark.url)
    const dataList = document.querySelector('datalist')
    dataList.textContent = ''

    for (let bookmark of bookmarks) {
      dataList.appendChild(createOption(bookmark))
    }
  }
  chrome.bookmarks.getChildren('2', callback)
}

function onButtonClick(_) {
  const input = document.querySelector('input')
  const option = document.querySelector(`option[value="${input.value}"`)
  const id = option.dataset.id

  switchBookmark(id)
}

function switchBookmark(id) {
  // replace bookmarks from 'Bookmarks bar' with the selected folder from 'Other bookmarks'
  const create = bookmark => new Promise(resolve => chrome.bookmarks.create(bookmark, resolve))
  const remove = id => new Promise(resolve => chrome.bookmarks.remove(id, resolve))
  const getChildren = id => new Promise(resolve => chrome.bookmarks.getChildren(id, resolve))
  const callback = ([bookmarksToDelete, bookmarksToCreate]) => {
    return Promise.all(bookmarksToDelete.map(bookmark => remove(bookmark.id)))
      .then(() => Promise.all(bookmarksToCreate.map(({ title, url }) => create({
        title,
        url,
        parentId: '1'
      }))))
  }

  Promise.all([getChildren('1'), getChildren(id)])
    .then(callback)
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button')
  button.addEventListener('click', onButtonClick)
  setBookmarkList()
})