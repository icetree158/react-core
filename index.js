import { App } from "./app.js";
import { createElement, createRoot } from "./react/core.js";

const root = createRoot(createElement(App), document.getElementById("root"));
