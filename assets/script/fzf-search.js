import { Fzf } from "fzf";
import params from "@params";

const resultsElem = document.querySelector(params.resultsSelector);
const inputBox = document.querySelector(params.inputSelector);
const children = Array.from(resultsElem.children);
const fzf = new Fzf(children, { selector: extractIdentifier });

function extractIdentifier(element) {
  return element.querySelector(params.identifierSelector).textContent;
}

function goToFirstResult() {
  resultsElem.firstChild.querySelector("a").click();
}

inputBox.addEventListener("input", (e) => {
  const matches = fzf.find(e.target.value).map((match) => match.item);
  resultsElem.replaceChildren(...matches);
});

inputBox.parentElement.addEventListener("submit", goToFirstResult);
