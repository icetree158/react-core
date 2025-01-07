import { App } from "./app.js";
import { createElement, render } from "./react/core.js";

const root = document.getElementById("root");

render(createElement(App), root);
