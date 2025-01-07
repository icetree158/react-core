import { createElement, useState } from "./react/core.js";
import { VisibleElement } from "./VisibleElement.js";

const App = () => {
  const [count, setCount] = useState(1);
  const [value, setValue] = useState(()=>"Input");
  const onClick = () => {
    setCount((count) => count + 1);
  };
  return createElement(
    "div",
    null,
    createElement("span", null, `current count ${count}`),
    createElement("button", { onClick }, "count++"),
    createElement(VisibleElement, { count }),
    createElement("input", {
      onInput: (event) => {
        setValue(event.target.value);
      },
      value
    }),
    createElement("div", null, value)
  );
};

export { App };
