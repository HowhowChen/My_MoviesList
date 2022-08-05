const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POST_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')
const PER_PAGE_MOVIE = 12

let {currentPage, filterPage, showMode} = readBrowserData()  /*讀取瀏覽紀錄*/

const movies = []
let filterMovies = []

/**
 * @desciption render movie List
 * @param data  
 */
function renderMovieList(data) {
  let rawHTML = ''

  if (showMode === 'card') {
    data.forEach(item => {
      const {id, title, image, release_date, description} = item

      rawHTML += `
      <div class="col-sm-3 mt-5">
        <div class="card" style="width: 18rem;">
          <img src="${POST_URL + image}" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <button type="button" class="btn btn-primary show-movie-modal" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${id}">More</button>
            <button type="button" class="btn btn-danger add-movie-favorite" data-id="${id}">♥</button>
          </div>
        </div>
      </div>
      `
    })
  } else if (showMode === 'list') {
    data.forEach(item => {
      const {id, title, image, release_date, description} = item

      rawHTML += `
      <li class="list-group-item d-flex justify-content-between border-1 border rounded-3">
        <h5 class="card-title">${title}</h5>
        <div>
          <button class="btn btn-primary show-movie-modal" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${id}">More</button>
          <button class="btn btn-info add-movie-favorite" data-id="${id}">+</button>
        </div>
      </li>
      `
    })
  }
  
  dataPanel.innerHTML = rawHTML
}

/**
 * @desciption render movie modal
 * @param id  
 */
function renderMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalBody = document.querySelector('#movie-modal-body')
  const movie = movies.find(item => item.id === id)
  const {title, image, release_date, description} =  movie 

  modalBody.innerHTML = `
    <div class="row">
      <div class="col-sm-8">
        <img src="${POST_URL + image}"/>
      </div>
      <div class="col-sm-4">
        <p><em>release_date: ${release_date}</em></p>
        <p>${description}</p>
      </div>
    </div>
  `
  modalTitle.textContent = title
}


/**
 * add the favorite
 * @param id 
 * @returns alert the same 
 */
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const data = movies.find(item => item.id === id)

  if (list.some(item => item.id === id)) {
    return alert('the movie has already added')
  }
  list.push(data)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / PER_PAGE_MOVIE )
  let rawHTML = ''

  for (let page = 1; page <= totalPage; page++) {

    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getRenderByPage(page) {
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = (page - 1) * PER_PAGE_MOVIE

  return data.slice(startIndex, startIndex + PER_PAGE_MOVIE)
}
/* 存取瀏覽紀錄*/
function storeBrowserData() {
  const data = {
    currentPage: currentPage,
    filterPgae: filterPage,
    showMode: showMode
  }

  localStorage.setItem('browserData', JSON.stringify(data))
}

/*讀取瀏覽紀錄*/
function readBrowserData() {
  let data = JSON.parse(localStorage.getItem('browserData')) || {}
  let {currentPage, filterPage, showMode} = data 

  if (!currentPage) {
    currentPage = 1
  }

  if (!showMode) {
    showMode = 'card'
  }

  data = {
    currentPage: currentPage,
    filterPgae: filterPage,
    showMode: showMode
  }
  
  return data
}

/*判斷當前是否為搜尋狀態*/
function currentOrFilterPage(currentPage, filterPage) {

  if (!filterMovies.length) {
    return currentPage
  } else {
    return filterPage
  }
}


dataPanel.addEventListener('click', function onDataPanelClicked(event) {
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.show-movie-modal')) {
    renderMovieModal(Number(id))
  } else if (event.target.matches('.add-movie-favorite')) {
    addToFavorite(id)
  }
})


searchForm.addEventListener('keyup', function onSearchFormKeyup(event) {
  const keyword = searchInput.value.toLowerCase()
  filterMovies = movies.filter(item => item.title.toLowerCase().includes(keyword))

  if (filterMovies.length === 0) {
    return alert('Cannot find the movies with keyword: ' + keyword)
  }

  /*每次搜尋都從第一頁開始*/
  filterPage = 1
  renderMovieList(getRenderByPage(filterPage))
  renderPaginator(filterMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  /*判斷當前點及分頁是否為搜尋狀態*/
  if (!filterMovies.length) {
    currentPage = page
  } else {
    filterPage = page
  }
  /*儲存瀏覽資訊 */
  storeBrowserData()
  renderMovieList(getRenderByPage(page))
})


changeMode.addEventListener('click', function onChangeModeClicked(event) {
  console.log(currentOrFilterPage(currentPage, filterPage))
  if (event.target.matches('#card-mode-button')) {
    showMode = 'card'
    /*儲存瀏覽資訊 */
    storeBrowserData()
    renderMovieList(getRenderByPage(currentOrFilterPage(currentPage, filterPage)))
  } else if (event.target.matches('#list-mode-button')) {
    showMode = 'list'
    /*儲存瀏覽資訊 */
    storeBrowserData()
    renderMovieList(getRenderByPage(currentOrFilterPage(currentPage, filterPage)))
  }
})

axios.get(INDEX_URL)
  .then(res => {
    movies.push(...res.data.results)
    renderMovieList(getRenderByPage(currentPage))
    renderPaginator(movies.length)
  })
  .catch(err => console.log(err))

