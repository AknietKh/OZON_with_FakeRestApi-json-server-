//Нажатие на лого возвращает на начальную страницу
{
  const logoBtn = document.querySelector('.logo'),
    filterText = document.querySelector('.filter-title h5'),
    discountCheckbox = document.getElementById('discount-checkbox');

  logoBtn.addEventListener('click', (e) => {
    event.preventDefault();
    discountCheckbox.checked = false;
    discountCheckbox.nextElementSibling.classList.remove('checked');
    filterText.textContent = "Фильтр";
    getData().then(data => {
      renderCards(data);
      pagination(data);
      actionPage(data);
      toggleCheckbox();
    });
  });
}

//Пагинация. Функция принимает массив с таварами (data), которые отображены на странице и 
// откуда (whence) эти товары были запрошены (каталог, поиск)
function pagination(data, whence = '') {
  const URL = 'http://localhost:3000/goods',
    pagination = document.querySelector('.pagination-wrapper'),
    paginationContent = pagination.querySelector('.pagination-content'),
    paginationLength = Math.ceil(data.length / 8),
    arrows = document.querySelectorAll('.arrow');

  paginationContent.textContent = '';

  if (paginationLength > 1) {
    pagination.style.display = '';
    for (let i = 1; i <= paginationLength; i++) {
      const pagNum = document.createElement('span');
      pagNum.className = 'pagination-number';
      pagNum.innerHTML = i;
      paginationContent.append(pagNum);
      pagNum.addEventListener('click', (event) => pagRequest(event));
    }

    arrows.forEach((arrow) => {
      arrow.addEventListener('click', (e) => {
        const arrow = e.target.closest('.arrow')
        arrowHandler(arrow);
      });
    });

    pagRequest(); //вызывается для того что бы отобразить первую страницу с заданными параметрами пагинации
  } else {
    pagination.style.display = 'none';
  }

  //функция обработчик, которая вызывает функцию pagRequest с аргументом-номером страницы. 
  // Т.е. отвечает за перелистывание страницы с товарами по стрелочкам
  function arrowHandler(arrow) {
    let activePagNum = +paginationContent.querySelector('.active').textContent;

    if (arrow.classList.contains('arrow-right')) {
      if (activePagNum !== paginationLength) {
        activePagNum++;
        pagRequest('', activePagNum);
      } else {
        pagRequest('', 1)
      }
    } else if (arrow.classList.contains('arrow-left')) {
      if (+activePagNum !== 1) {
        activePagNum--;
        pagRequest('', activePagNum);
      } else {
        pagRequest('', paginationLength)
      }
    }
  }

  //функция отвечающая за получение карточек товара заданной страницы (из стрелочек или при клике на номер страницы в пагинации)
  async function pagRequest(event = '', arrow = '') {
    const pagNums = document.querySelectorAll('.pagination-number');

    let response = await fetch(`${URL}/?${whence}&_page=${event ? event.target.textContent : arrow || '1'}&_limit=8`);
    let pagCards = await response.json();
    renderCards(pagCards);

    //Определение активной страницы и выделение активной страницы в пагинации
    if (!event && !pagination.style.display && !arrow) {
      const pagNum = document.querySelector('.pagination-number');
      pagNum.classList.add('active');
    }

    pagNums.forEach((elem) => {
      if (event && elem === event.target) {
        elem.classList.add('active');
      } else if (event && elem !== event.target) {
        elem.classList.remove('active');
      }

      if (arrow) {
        if (+elem.textContent === arrow) {
          elem.classList.add('active');
        } else {
          elem.classList.remove('active');
        }
      }
    });
  }
}
//end Пагинация.

//получение данных с сервера
function getData(request = '') {
  const goodsWrapper = document.querySelector('.goods');
  return fetch(`http://localhost:3000/goods${request}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Данные не были получены, ошибка: ' + response.status)
      }
    })
    .catch(err => {
      console.warn(err);
      goodsWrapper.innerHTML = '<div style="color: red; font-size: 30px; margin: 0 auto;">Упс, что-то пошло не так!</div>'
    });
}
//end получение данных с сервера

//Отрисовка карточек. Функция принимает массив с товарами и рендерит на страницу
function renderCards(data) {
  const goodsWrapper = document.querySelector('.goods');
  document.querySelectorAll('.card').forEach(i => i.remove());
  data.forEach((good) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-category', good.category);
    card.innerHTML = `
                ${good.sale ? '<div class="card-sale">🔥Hot Sale🔥</div>' : ''}
									<div class="card-img-wrapper">
										<span class="card-img-top"
											style="background-image: url('${good.img}')"></span>
									</div>
									<div class="card-body justify-content-between">
										<div class="card-price" style="${good.sale ? 'color:red;' : ''}">${good.price} ₽</div>
										<h5 class="card-title">${good.title}</h5>
										<button class="btn btn-primary">В корзину</button>
									</div>
								</div>
    `;
    goodsWrapper.append(card);

    const cardBtn = card.querySelector('.btn');
    cardBtn.addEventListener('click', () => {
      addCart(good);
    });
  });
}
//end Отрисовка карточек

//Каталог
async function renderCatalog() {
  const catalogList = document.querySelector('.catalog-list');
  const catalogBtn = document.querySelector('.catalog-button');
  const catalogWrapper = document.querySelector('.catalog');
  const filterText = document.querySelector('.filter-title h5');
  const categories = new Set();

  const response = await fetch('http://localhost:3000/goods');
  const result = await response.json();

  result.forEach((item) => {
    categories.add(item.category);
  });

  categories.forEach((category) => {
    const li = document.createElement('li');
    li.textContent = category;
    catalogList.append(li);
  });

  const allLi = catalogList.querySelectorAll('li');

  catalogBtn.addEventListener('click', (event) => {
    if (catalogWrapper.style.display) {
      catalogWrapper.style.display = '';
    } else {
      catalogWrapper.style.display = 'block';
    }

    if (event.target.tagName === 'LI') {
      allLi.forEach((elem) => {
        if (elem === event.target) {
          elem.classList.add('active');
        } else {
          elem.classList.remove('active');
        }
      });

      filterText.textContent = event.target.textContent;

      getData(`/?category_like=${event.target.textContent}`)
        .then(data => {
          renderCards(data);
          pagination(data, `category_like=${event.target.textContent}`);
          actionPage(data, `category_like=${event.target.textContent}`);
        });
    }
  });
}
//end Каталог

//фильтр акций и цены
function actionPage(data, whence = '') {
  const discountCheckbox = document.getElementById('discount-checkbox'),
    min = document.getElementById('min'),
    max = document.getElementById('max'),
    paginationWrapper = document.querySelector('.pagination-wrapper');

  discountCheckbox.addEventListener('change', filter);
  min.addEventListener('change', filter);
  max.addEventListener('change', filter);

  function filter() {
    if (min.value || max.value) {
      let filterCards = [];

      data.forEach((item) => {
        if ((min.value ? (item.price > +min.value) : 1) && (max.value ? (item.price < +max.value) : 1)) {
          filterCards.push(item);
          paginationWrapper.style.display = 'none';
        }
      });

      if (discountCheckbox.checked) {
        let filterSaleCards = []
        filterCards.forEach(item => {
          if (item.sale) filterSaleCards.push(item);
        })
        filterCards = filterSaleCards;
        paginationWrapper.style.display = 'none';
      }

      renderCards(filterCards);
    }

    else if (discountCheckbox.checked) {
      let saleCards = [];
      data.forEach(item => {
        if (item.sale) saleCards.push(item);
      });
      renderCards(saleCards);
      paginationWrapper.style.display = 'none';
    } 
    
    else {
      renderCards(data);
      pagination(data, whence);
    }
  }
};
//end фильтр акций

//поиск
function search() {
  const search = document.querySelector('.search-wrapper_input'),
    searchBtn = document.querySelector('.search-btn'),
    filterText = document.querySelector('.filter-title h5');

  searchBtn.addEventListener('click', searchHandler);
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchHandler();
  });

  function searchHandler() {
    const searchText = search.value.trim();
    getData(`/?title_like=${searchText}`)
      .then(data => {
        renderCards(data);
        pagination(data, `title_like=${searchText}`);
        actionPage(data, `title_like=${searchText}`);
      });
    search.value = '';
    filterText.textContent = 'Фильтр';
  }
}
// end поиск

//checkbox. функция отрисовки галочки в чекбоксе
function toggleCheckbox() {
  const checkbox = document.querySelectorAll('.filter-check_checkbox');

  checkbox.forEach((elem) => {
    elem.addEventListener('change', function () {
      if (this.checked) {
        this.nextElementSibling.classList.add('checked');
      } else {
        this.nextElementSibling.classList.remove('checked');
      }
    });
  });
};
//end checkbox

//корзина. функция показывает/скрывает окно корзины
function toggleCart() {
  const btnCart = document.getElementById('cart'); //иконка корзины
  const modalCart = document.querySelector('.cart');
  const btnCartClose = document.querySelector('.cart-close');

  btnCart.addEventListener('click', () => {
    modalCart.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    showCartCards();
  })

  btnCartClose.addEventListener('click', () => {
    modalCart.style.display = 'none';
    document.body.style.overflow = '';
    cartCounter();
  })
}
//end корзина

//Корзина. 
//функция добавляет товар в корзину
async function addCart(good) {
  let goodClone = good;

  let postCartCards = await fetch('http://localhost:3000/cart/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(goodClone)
  });
  cartCounter();
}

//показывает кол-во товаров в корзине
async function cartCounter() {
  const countGoods = document.querySelector('.counter');
  let getCartCards = await fetch('http://localhost:3000/cart/');
  let result = await getCartCards.json();

  countGoods.textContent = result.length;
}

//запрашивает товары, находящиеся в корзине и вызывает функцию для отрисовки товаров в корзине
async function showCartCards() {
  let getCartCards = await fetch('http://localhost:3000/cart/');
  let cartCards = await getCartCards.json();

  renderCartCards(cartCards);
}

//отрисовывает карточки товаров в модальном окнце корзины
function renderCartCards(cartCards) {
  const cartWrapper = document.querySelector('.cart-wrapper');
  const cartEmpty = document.getElementById('cart-empty');
  const cartTotal = document.querySelector('.cart-total span');
  let sum = 0;

  cartCards.forEach(item => {
    sum += item.price;
  });

  cartTotal.textContent = sum;
  cartWrapper.innerHTML = '';

  if (cartCards.length) {
    cartCards.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-category', item.category);
      card.innerHTML = `
        ${item.sale ? '<div class="card-sale">🔥Hot Sale🔥</div>' : ''}
                          <div class="card-img-wrapper">
                            <span class="card-img-top"
                              style="background-image: url('${item.img}')"></span>
                          </div>
                          <div class="card-body justify-content-between">
                            <div class="card-price" style="${item.sale ? 'color:red;' : ''}">${item.price} ₽</div>
                            <h5 class="card-title">${item.title}</h5>
                            <button class="btn">Удалить из корзины</button>
                          </div>
                        </div>
      `;
      cartWrapper.append(card);

      const cardBtn = card.querySelector('.btn');
      cardBtn.addEventListener('click', () => {
        deleteCart(item);
      });
    });
  } else {
    const cartEmpty = document.createElement('div');
    cartEmpty.className = 'cart-empty';
    cartEmpty.innerHTML = 'Ваша корзина пока пуста';
    cartWrapper.append(cartEmpty);
  };
}

async function deleteCart(card) {
  let response = await fetch(`http://localhost:3000/cart/${card.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(card)
  })
  showCartCards();
}

//end Корзина.

getData().then((data) => {
  renderCards(data);
  pagination(data);
  renderCatalog();
  cartCounter();
  toggleCheckbox();
  toggleCart();
  search();
  actionPage(data);
});