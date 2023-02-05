const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
//當filterMovies為空陣列時，表示沒有做任何搜尋，所顯示即為完整的80部電影清單

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
    console.log(item)//確認是否都已有電影資料物件
  })

  dataPanel.innerHTML = rawHTML//把rawHTML這部分的資料，以HTML的形式放入dataPanel
}

//傳入的參數為一筆數量
function renderPaginator(amount) {
  //Math.ceil()內的值會無條件進位
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }//須把data=page綁在按鈕的超連結之下

  paginator.innerHTML = rawHTML
}

//點擊相應頁數，便會出現該頁數應呈現的電影
function getMoviesByPage(page) {
  //此函式的"movies"有兩種可能的涵義：一為全部的80部電影；二為被使用者搜尋後經"filteredMovies"所render出來的電影。兩者的區別在於，搜尋動作進行與否。
  const data = filteredMovies.length ? filteredMovies : movies
  //三元運算子:條件?值1(true):值2(false)
  //意為:使用者若進行了有效搜尋，就呈現filteredMovies的內容；若無則呈現movies。
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }

  // console.log(id) 檢查是否有抓到正確的id，須記得在"+"也要加上data-id="${item.id}"
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)//使用find()來找相對應的電影，套入函式isMovieIdMatched
  //find()和filter()中，括號內的參數為另一函式

  //用條件排除已選的電影
  if (list.some((movie) => movie.id === id)) {
    return alert('The movie has been chosen.')
  }

  // console.log(movie)
  list.push(movie)
  // console.log(JSON.stringify(movie))JSON.stringify()用作將字串轉為陣列
  // console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//設置一個在dataPanel按鈕上的監聽器，監聽more和+
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)透過console，得知目前從dataset所得id皆是字串
    showMovieModal(Number(event.target.dataset.id))//以Number()函式進行轉換
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

//設置在search按紐上的監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()//請瀏覽器不要做預設的動作(重整瀏覽器)，將控制權交予Java Script
  // console.log(searchInput.value) 在input屬性中，value為儲存輸入值之裝置
  const keyword = searchInput.value.trim().toLowerCase()
  //trim()可以去除空白格；toLowerCase()函式可以讓搜尋不限制於大寫或小寫
  // let filteredMovies = []符合條件的電影可放入此陣列


  //驗證用條件
  if (!keyword.length) {
    return alert('Please enter valid string!')
  }

  //一、使用迴圈
  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }//加入toLowerCase()讓搜尋不限制於大寫或小寫
  }

  //二、使用filter()
  // filteredMovies = movies.filter((movie) =>
  //   movie.title.toLowerCase().includes(keyword)
  // )

  if (filteredMovies.length === 0) {
    return alert('Cannot find the movie with keyword:' + keyword)
  }

  //重製分頁器，根據render出來的movie做改變
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))//預設顯示第一頁的搜尋結果
})

axios.get(INDEX_URL).then(function (response) {
  // console.log(response.data.results)
  //array with 80 elements
  //一、使用for迴圈+const...of
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }

  //二、展開運算
  movies.push(...response.data.results)
  console.log(movies)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})

// localStorage.setItem('default_language', 'english')
// console.log(localStorage.getItem('default_language', 'english'))