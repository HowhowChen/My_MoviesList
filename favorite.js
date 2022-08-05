const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POST_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')
const PER_PAGE_MOVIE = 12

let showMode = "card" //default mode card
let currentPage = 1  //dedult page

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
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

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex(item => item.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  renderMovieList(getRenderByPage(1))
  renderPaginator(movies.length)
}


dataPanel.addEventListener('click', function onDataPanelClicked(event) {
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.show-movie-modal')) {
    renderMovieModal(Number(id))
  } else if (event.target.matches('.remove-movie-favorite')) {
    removeFromFavorite(id)
  }
})

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

searchForm.addEventListener('keyup', function onSearchFormKeyup(event) {
  const keyword = searchInput.value.toLowerCase()
  filterMovies = movies.filter(item => item.title.toLowerCase().includes(keyword))

  if (filterMovies.length === 0) {
    return alert('Cannot find the movies with keyword: ' + keyword)
  }

  renderMovieList(getRenderByPage(1))
  renderPaginator(filterMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getRenderByPage(page))
})

changeMode.addEventListener('click', function onChangeModeClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    showMode = 'card'
    renderMovieList(getRenderByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')) {
    showMode = 'list'
    renderMovieList(getRenderByPage(currentPage))
  }
})

renderMovieList(getRenderByPage(1))
renderPaginator(movies.length)