//Нажатие на лого возвращает на начальную страницу
{
  const logoBtn = document.querySelector('.logo'),
    filterText = document.querySelector('.filter-title h5');

  logoBtn.addEventListener('click', (e) => {
    event.preventDefault();
    filterText.textContent = "Фильтр";
    getData().then(data => {
      renderCards(data);
      pagination(data);
      actionPage();
    });
  });
}

function pagination(data, search = '') {
  const URL = 'http://localhost:3000/goods',
    pagination = document.querySelector('.pagination-wrapper'),
    paginationContent = pagination.querySelector('.pagination-content'),
    paginationLength = Math.ceil(data.length / 8);
  /*const arrowLeft = pagination.querySelector('.arrow-left'),
    arrowRight = pagination.querySelector('.arrow-right'),
    arrows = document.querySelectorAll('.arrow');*/

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

    /*Не разобрался с багом при переключении страницы по стрелочкам,
    поэтому пока закоментил
    arrows.forEach((arrow) => {
      arrow.addEventListener('click', (e) =>{
        console.dir(e.target);
        const arrow = e.target.closest('.arrow')
        arrowHandler(arrow, currentData);
      });
    });

    arrowLeft.addEventListener('click', (e) => {
      let curentEvent = e.target;
      e.stopPropagation();
      arrowLeftHandler(arrowLeft);
    });
    arrowRight.addEventListener('click', (e) => {
      let curEvent = e.target;
      e.stopPropagation();
      arrowRightHandler(arrowRight);
    });*/

  } else {
    pagination.style.display = 'none';
  }

  pagRequest(); //вызывается для того что бы отобразить первую страницу с заданными параметрами пагинации

  /*function arrowHandler(arrow) {
    let activePagNum = +paginationContent.querySelector('.active').textContent;

    if (arrow.classList.contains('arrow-right')) {
      if (activePagNum !== paginationLength) {
        activePagNum++;
        pagRequest('', activePagNum, 'right');
      } else {
        pagRequest('', 1, 'right')
      }
    } else if (arrow.classList.contains('arrow-left')) {
      if (+activePagNum !== 1) {
        activePagNum--;
        pagRequest('', activePagNum, 'left');
      } else {
        pagRequest('', paginationLength, 'left')
      }
    }

  }

  function arrowRightHandler() {
    let activePagNum = +paginationContent.querySelector('.active').textContent;

    if (activePagNum !== paginationLength) {
      activePagNum++;
      pagRequest('', activePagNum, 'right');
    } else {
      pagRequest('', 1, 'right')
    }
  }

  function arrowLeftHandler() {
    let activePagNum = +paginationContent.querySelector('.active').textContent;

    if (+activePagNum !== 1) {
      activePagNum--;
      pagRequest('', activePagNum, 'left');
    } else {
      pagRequest('', paginationLength, 'left')
    }
  }*/

  function pagRequest(event = '', page = 1, arrow = '') {
    const filterText = document.querySelector('.filter-title h5'),
      pagNums = document.querySelectorAll('.pagination-number');

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

      /*if (arrow) {
        if (+elem.textContent === page) {
          elem.classList.add('active');
        } else {
          elem.classList.remove('active');
        }
      }*/
    })

    if (search) {
      fetch(`${URL}/${search}&_page=${event ? event.target.textContent : page}&_limit=8`)
        .then(response => {
          if (response.ok) return response.json();
        })
        .then(data => renderCards(data));
    } else if (filterText.textContent !== 'Фильтр') {
      fetch(`${URL}/?category_like=${filterText.textContent}&_page=${event ? event.target.textContent : page}&_limit=8`)
        .then(response => {
          if (response.ok) return response.json();
        })
        .then(data => renderCards(data));
    } else {
      fetch(`${URL}/?_page=${event ? event.target.textContent : page}&_limit=8`)
        .then(response => {
          if (response.ok) return response.json();
        })
        .then(data => renderCards(data));
    }
  }
}

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

//end получение данных с сервера


//Каталог
async function renderCatalog() {
  const cards = document.querySelectorAll('.goods .card');
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
          pagination(data);
          actionPage();
        })

      filter();
    }
  });
}
//end Каталог

//фильтр акций
// функция actionPage вешает события на фильтр и чекбоксы. Так же реализован поиск по товарам
function actionPage() {
  const cards = document.querySelectorAll('.goods .card');
  const discountCheckbox = document.getElementById('discount-checkbox');
  const min = document.getElementById('min');
  const max = document.getElementById('max');
  const search = document.querySelector('.search-wrapper_input');
  const searchBtn = document.querySelector('.search-btn');
  const filterText = document.querySelector('.filter-title h5');

  discountCheckbox.addEventListener('click', filter);
  min.addEventListener('change', filter);
  max.addEventListener('change', filter);

  searchBtn.addEventListener('click', searchHandler);
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchHandler();
  })

  function searchHandler() {
    //раньше поиск проводился по заголовкам карточек, которые есть на странице/ДОМ-дереве на данный момент
    /*const searchText = new RegExp(search.value.trim(), 'i');
    cards.forEach((card) => {
      const title = card.querySelector('.card-title');
      if (!searchText.test(title.textContent)) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
      }

      search.value = '';
    });*/
    //сейчас делается сетевой запрос на json-server
    const searchText = search.value.trim();
    getData(`/?title_like=${searchText}`)
      .then(data => {
        renderCards(data);
        pagination(data, `?title_like=${searchText}`);
      });
    search.value = '';
    filterText.textContent = 'Фильтр';
  }

};

//end фильтр акций

//функия filter реализует работу фильтра, чебокса и каталога
function filter() {
  const cards = document.querySelectorAll('.goods .card');
  const discountCheckbox = document.getElementById('discount-checkbox');
  const min = document.getElementById('min');
  const max = document.getElementById('max');
  // const activeLi = document.querySelector('.catalog li.active');

  cards.forEach((card) => {
    const cardPrice = card.querySelector('.card-price');
    const price = parseFloat(cardPrice.textContent);
    const discount = card.querySelector('.card-sale');

    card.style.display = '';

    if ((min.value && price < min.value) || (max.value && price > max.value)) {
      card.style.display = 'none';
    } else if (discountCheckbox.checked && !discount) {
      card.style.display = 'none';
    }
  });
}

// checkbox. функция отрисовки галочки в чекбоксе

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

//Добавление товара в корзины
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

async function cartCounter() {
  const countGoods = document.querySelector('.counter');
  let getCartCards = await fetch('http://localhost:3000/cart/');
  let result = await getCartCards.json();

  countGoods.textContent = result.length;
}

async function showCartCards() {
  let getCartCards = await fetch('http://localhost:3000/cart/');
  let cartCards = await getCartCards.json();

  renderCartCards(cartCards);
}

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
    // cartEmpty ? cartEmpty.display = 'none' : '';
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
/*Старая реализация
function addCart() {
  const cards = document.querySelectorAll('.goods .card');
  const cartWrapper = document.querySelector('.cart-wrapper');
  const cartEmpty = document.getElementById('cart-empty');
  const countGoods = document.querySelector('.counter');

  cards.forEach((card) => {
    const btn = card.querySelector('button');

    btn.addEventListener('click', () => {
      const cardClone = card.cloneNode(true);
      cartWrapper.append(cardClone);
      showData();

      const removeBtn = cardClone.querySelector('button');
      removeBtn.textContent = 'Удалить из корзины';
      removeBtn.addEventListener('click', () => {
        cardClone.remove();
        showData();
      })
    });
  });

  //показывает общую сумму товаров в корзине и количество товаров в корзине
  function showData() {
    const cardsCart = cartWrapper.querySelectorAll('.card');
    const cardsPrice = cartWrapper.querySelectorAll('.card-price');
    const cartTotal = document.querySelector('.cart-total span');
    let sum = 0;

    countGoods.textContent = cardsCart.length;

    cardsPrice.forEach((cardPrice) => {
      let price = parseFloat(cardPrice.textContent);
      sum += price;
    });

    cartTotal.textContent = sum;

    if (cardsCart.length) {
      cartEmpty.remove();
    } else {
      cartWrapper.append(cartEmpty);
    };
  };

};*/

//end добавление товара в корзину

getData().then((data) => {
  renderCards(data);
  pagination(data);
  renderCatalog();
  toggleCheckbox();
  toggleCart();
  actionPage();
  cartCounter();
});