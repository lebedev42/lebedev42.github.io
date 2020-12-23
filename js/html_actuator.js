function HTMLActuator() {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;

  this.results = [
    {
      id: 2,
      title: "Шоколадный Дед Мороз",
      img: "",
      text:
        "Классика! Всем нам было ясно в детстве, кто главный в новогоднем сладком подарке.",
    },
    {
      id: 4,
      title: "Сетка с мандаринами",
      img: "",
      text:
        "По мере взросления, конечно, начинаешь больше следить за здоровьем и новогоднее настроение больше создают мандарины, чем сладости. А именно о нем и мечтается — хочется, чтобы оно просто было.",
    },
    {
      id: 8,
      title: "Теплые шерстяные варежки",
      img: "",
      text:
        "Где оно детство, когда любой мороз нипочем и можно копаться в сугробах несколько часов кряду? Теперь подавайте уют, да шапку с варежками потеплее.",
    },
    {
      id: 16,
      title: "Шар со снегом",
      img: "",
      text: "Не стесняйтесь желать новогоднего настроения и волшебства!",
    },
    {
      id: 32,
      title: "Коробочка с сюрпризом",
      img: "",
      text:
        "Кто не любит сюрпризы? Не хотим ничего решать, пусть нас просто удивят!",
    },
    {
      id: 64,
      title: "Коньки",
      img: "",
      text:
        "Массовых гуляний ждать в этом году не приходится, поэтому хотя бы на каток выбраться нужно, а то совсем грустные выйдут каникулы.",
    },
    {
      id: 128,
      title: "Зимняя экипировка",
      img: "",
      text:
        "Раз уж мы мечтаем, то можно загадать себе и новое увлечение и все атрибуты к нему. Адреналин бодрит, да и здоровье скажет «спасибо» за лишнюю спортивную активность.",
    },
    {
      id: 256,
      title: "Курсы английского",
      img: "",
      text:
        "Давайте мечтать еще смелее. Пора учить главный международный язык, ведь границы рано или поздно откроют и мы все точно рванем путешествовать. Надо подготовиться. Тем более, у Boxberry можно <a href='https://promo.boxberry.ru/' target='_blank'>выиграть</a> такой курс бесплатно.",
    },
    {
      id: 512,
      title: "Путевка в путешествие",
      img: "",
      text:
        "Не стесняемся сделать следующий шаг и позволим себе помечтать о приключениях и поездках в новом году!",
    },
    {
      id: 1024,
      title: "Билет на концерт любимой группы",
      img: "",
      text:
        "Осторожно заглядываемся на самые больные темы. Только представьте — снова толпа в зале, все подпевают знакомый текст, все счастливы, танцуют и обнимаются. Чтобы мечталось убедительнее, попробуйте делать это с закрытыми глазами и в наушниках, которые вы, кстати, тоже можете <a href='https://promo.boxberry.ru/' target='_blank'>выиграть</a> вместе с Boxberry.",
    },
  ];
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  console.error("bestScore", metadata.bestScore);

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          // self.showPopup(cell, metadata.pointsState);
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");

  // inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type = won ? "game-won" : "game-over";
  var message = won
    ? "Это победа! В нашей игре вы достигли желаемого. В качестве главного блюда берем вполне реальный, но ценный и многими желанный подарок — iPhone 12. А за настоящий iPhone 12 стоит побороться в <a href='https://promo.boxberry.ru/' target='_blank'>конкурсе от Boxberry</a>!"
    : "А мечтам нет предела! Выучить новый язык? Оторваться на концерте любимой группы? Отправиться в путешествие? Если вы вели себя хорошо в этом году, то все должно сбыться, а для верности попробуйте все же дойти до этих подарков в нашей игре!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.showPopup = function (cell) {
  console.error("points", cell.value);
  // if (!points.includes(cell.value) && cell.value > 2) {
  console.error("Показываем окно", cell.value);
  // }

  var message = this.results.filter((item) => item.id === cell.value)[0];

  this.messageContainer.classList.add("game-won");
  this.messageContainer.getElementsByTagName("h3")[0].textContent =
    message.title;
  this.messageContainer.getElementsByTagName("p")[0].textContent = message.text;
};
