import { createElement, useState } from "./react/core.js";
const arr = [1, 2, 3, 4];

const Counter1 = ({ value }) => {
  const [count, setCount] = useState(1);
  return createElement(
    "div",
    {},
    createElement("span", {}, count),
    createElement(
      "button",
      {
        onclick: () => {
          setCount((prev) => prev + 1);
        },
      },
      "Counter1"
    )
  );
};

const Counter2 = ({ value }) => {
  const [count, setCount] = useState(1);
  return createElement(
    "div",
    {},
    createElement("span", {}, count),
    createElement(
      "button",
      {
        onclick: () => {
          setCount((prev) => prev + 1);
        },
      },
      "Counter2"
    )
  );
};

const App = () => {
  const [value, setValue] = useState("");

  return createElement(
    "div",
    {},
    createElement("span", {}, `Input value ${value}`),
    createElement("input", {
      oninput: (e) => {
        setValue(e.target.value);
      },
    }),
    createElement(Counter1, {}),
    createElement(Counter2, {})
  );
};

export { App };
