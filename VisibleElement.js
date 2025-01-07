import { createElement, useState } from "./react/core.js";

const VisibleElement = ({ count }) => {

  return count % 2 === 0 ? createElement("div", {}, count) : null;
};

export { VisibleElement };
