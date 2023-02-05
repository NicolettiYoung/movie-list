const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//建立負責render資料的函式
function renderMovieList(data) {
  let rawHTML = ''//建立字串，負責解析(盛裝)data出來的html

  data.forEach(function (item) {
    //需在此放入電影標題(title)與圖片網址(poster)
    rawHTML += ` <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    console.log(item)//確認是否都已有電影資料物件
  })

  dataPanel.innerHTML = rawHTML//把rawHTML這部分的資料，以HTML的形式放入dataPanel
}

function showMovieModal(id) {
  //需觀察固定要修改的內容有哪些
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //透過axios，取得電影詳細資料
  axios.get(INDEX_URL + id).then(function (response) {
    //由於資料取得(data)位置繁複(response.data.results)，故設置變數簡化
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster">`

  })
}

//設計函式前，須知道的事項:欲刪除的電影所在位置+會刪除幾個
function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  //findIndex()為找尋項目的位置；find()為找尋項目的資料
  // return console.log(movieIndex) 檢查是否有抓到正確的位置

  //刪除該電影
  movies.splice(movieIndex, 1)
  //存於localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //即時更新頁面
  renderMovieList(movies)
}

//設置一個在dataPanel按鈕上的監聽器，監聽more和x
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)透過console，得知目前從dataset所得id皆是字串
    showMovieModal(Number(event.target.dataset.id))//以Number()函式進行轉換
  }
  else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)