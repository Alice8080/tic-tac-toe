import { choiceOptions } from "./functions.js";

// После загрузки страницы либо начинается новая игра, либо, если есть сохраненная незаконченная игра, продолжается она, поэтому флаг newGame равен false
choiceOptions({ newGame: false });