const urlBase = "https://opentdb.com";
const proxy = "https://secret-ocean-49799.herokuapp.com";

let game;

const elementos = {
  homeScreen: document.querySelector(".home-screen"),
  categoryPage: document.querySelector(".category-page"),
  selectCategory: document.getElementById("select-category"),
  gameScreen: document.querySelector(".game-screen"),
  divQuestions: document.querySelector("#question"),
  divOptions: document.querySelector("#div-options"),
  options: document.querySelector(".options"),
  divAtualPoint: document.querySelector("#atual-point"),
  finalScreen: document.querySelector(".final-screen"),
  divResult: document.querySelector("#result"),

  buttons: {
    difficultys: {
      easy: document.querySelector("#dif-easy"),
      medium: document.querySelector("#dif-medium"),
      hard: document.querySelector("#dif-hard"),
    },
    //botões pagina de categoria.
    buttonSubmit: document.querySelector("#button-submit"),
    buttonBack: document.querySelector("#button-back"),
    buttonBackFinal: document.querySelector("#button-back-final"),
  },
};

elementos.buttons.buttonSubmit.addEventListener("click", () => {
  game.defineCategory(
    elementos.selectCategory.options[elementos.selectCategory.selectedIndex]
      .value,
    elementos.selectCategory.options[elementos.selectCategory.selectedIndex]
      .textContent
  );

  elementos.categoryPage.style.display = "none";

  loadQuestions();
});

const newGame = () => {
  game = {
    answeredQuestions: 0,
    point: 0,
    hits: 0,
    chances: 1,
    difficulty: undefined,
    category: undefined,
    categoryWord: undefined,
    pergunta: undefined,

    defineDifficulty: function (difficulty) {
      this.difficulty = difficulty;
    },

    defineCategory: function (categoryIndex, category) {
      this.category = categoryIndex;
      this.categoryWord = category;
    },

    iAnswered: function () {
      this.answeredQuestions++;
    },

    calculateHits: function () {
      if (this.difficulty == "easy") {
        this.point += 5;
      } else if (this.difficulty == "medium") {
        this.point += 8;
      } else if (this.difficulty == "hard") {
        this.point += 10;
      }
      this.hits++;
    },

    calculateError: function () {
      if (this.difficulty == "easy") {
        this.point += -5;
      } else if (this.difficulty == "medium") {
        this.point += -5;
      } else if (this.difficulty == "hard") {
        this.point += -5;
      }
      this.chances--;
    },
  };
  elementos.homeScreen.style.display = "flex";

  for (const i in elementos.buttons.difficultys) {
    elementos.buttons.difficultys[i].addEventListener("click", () => {
      game.defineDifficulty(i);
      elementos.homeScreen.style.display = "none";
      showCategory();
    });
  }
};

const showCategory = () => {
  axios.get(`${proxy}/${urlBase}/api_category.php`).then((response) => {
    const category = response.data.trivia_categories;
    for (const i of category) {
      elementos.selectCategory.innerHTML += `<option value= "${i.id}">${i.name}</option>`;
    }
  });
  elementos.categoryPage.style.display = "flex";
  backAction();
};

const backAction = () => {
  elementos.buttons.buttonBack.addEventListener("click", () => {
    elementos.categoryPage.style.display = "none";
    elementos.homeScreen.style.display = "flex";
  });
};

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------!
const loadQuestions = () => {
  if (game.chances != 0) {
    axios
      .get(
        `${proxy}/${urlBase}/api.php?amount=1&category=${game.category}&difficulty=${game.difficulty}`
      )
      .then((response) => {
        game.question = response.data.results[0];
        loadGameScreen();
      });
  } else {
    console.log("acabou");
    loadFinalScreen();
  }
};

const checkHits = (answer) => {
  game.iAnswered();
  const buttonAnswer = answer.path[1].firstChild;
  const buttonConfirm = answer.target;
  if (buttonAnswer.textContent == game.question.correct_answer) {
    buttonAnswer.style.backgroundColor = "green";
    buttonConfirm.style.backgroundColor = "green";
    game.calculateHits();
  } else {
    buttonAnswer.style.backgroundColor = "red";
    buttonConfirm.style.backgroundColor = "red";
    game.calculateError();
  }
};

const decodeHTMLEntities = (str) => {
  var element = document.createElement("div");

  if (str && typeof str === "string") {
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
    element.innerHTML = str;
    str = element.textContent;
    element.textContent = "";
  }
  return str;
};

const loadGameScreen = () => {
  elementos.gameScreen.style.display = "flex";
  elementos.divAtualPoint.textContent = `Pontos: ${game.point}`;

  elementos.divAtualPoint.style.marginTop = "30px";

  elementos.divQuestions.textContent = `${decodeHTMLEntities(
    game.question.question
  )}`;

  console.log(game.question.correct_answer);

  const questions = game.question.incorrect_answers.concat(
    game.question.correct_answer
  );
  questions.sort();

  const questionsTam = questions.length;

  elementos.divOptions.textContent = "";

  const options = {};

  for (let i = 0; i < questionsTam; i++) {
    const button = document.createElement("button");
    const textButton = document.createTextNode(
      decodeHTMLEntities(questions[i])
    );

    const div = document.createElement("div");

    div.id = `div-option${i}`;

    button.appendChild(textButton);

    button.type = "button";
    button.id = `option${i}`;

    button.style.marginTop = "30px";
    button.style.marginLeft = "20px";
    button.style.width = "200px";
    button.style.height = "50px";
    button.style.borderRadius = "5px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "#ffd723";

    elementos.divOptions.appendChild(div);
    document.querySelector(`#div-option${i}`).appendChild(button);

    options[`buttonOption${i}`] = document.querySelector(`#option${i}`);

    options[`buttonOption${i}`].addEventListener("click", (e) => {
      const buttonOld = document.querySelector("#confirm");

      if (buttonOld != null) {
        buttonOld.parentNode.removeChild(buttonOld);
      }

      console.log(options[`buttonOption${i}`].textContent);

      const div = document.querySelector(`#div-option${i}`);
      const button = document.createElement("button");
      const text = document.createTextNode("Confirmar");

      button.appendChild(text);

      button.type = "button";
      button.id = `confirm`;
      button.style.marginTop = "30px";
      button.style.marginLeft = "20px";
      button.style.width = "200px";
      button.style.height = "50px";
      button.style.borderRadius = "5px";
      button.style.fontSize = "20px";
      button.style.backgroundColor = "green";
      button.style.cursor = "pointer";

      div.appendChild(button);

      button.addEventListener("click", (e) => {
        for (let i = 0; i < questions.length; i++) {
          options[`buttonOption${i}`].disabled = true;
        }

        button.disabled = true;

        checkHits(e);

        setTimeout(loadQuestions, 2000);
      });
    });
  }

  // const buttonConfirm = document.createElement('button');
  // const text = document.createTextNode('Confirmar');

  // buttonConfirm.appendChild(text);

  // elementos.gameScreen.appendChild(buttonConfirm);

  console.log("amendoa");
};

const loadFinalScreen = () => {
  elementos.gameScreen.style.display = "none";
  elementos.finalScreen.style.display = "flex";

  elementos.divResult.innerHTML +=
    `<p><b>Dificuldade : </b> ${game.difficulty}</p>` +
    `<p><b>Categoria Escolhida : </b> ${game.categoryWord}</p>` +
    `<p><b>Perguntas Respondidas : </b> ${game.answeredQuestions}</p>` +
    `<p><b>Perguntas Acertadas : </b> ${game.hits}</p>` +
    `<p><b>Ponto maximo : </b>  ${game.point}</p>`;

  backActionFinalScreen();
};

const backActionFinalScreen = () => {
  elementos.buttons.buttonBackFinal.addEventListener("click", () => {
    elementos.finalScreen.style.display = "none";
    elementos.homeScreen.style.display = "flex";
  });
};
newGame();
