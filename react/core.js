// types 0-root 1 - fc , 2 html, 3 text
// work type 0 create, 1 update, 2 delete 3 replace

let currentTree = {};
let wipTree = {};
let wip = {};
let hookIndex = 0;
let globalStack = [];

/**Search */
const takeNearDom = (fiber) => {
  let current = fiber;
  while (true) {
    if (current.dom) {
      return current.dom;
    }
    current = current.parent;
  }
};

const takeDeepDom = (fiber) => {
  let current = fiber;

  while (current) {
    if (current.dom) {
      return current.dom;
    }
    if (current.child) {
      current = current.child;
    } else {
      current = current.sibling;
    }
  }
};

/**Healpers */

const isFuntionComponent = (component) => {
  return typeof component === "function";
};

const avoidNotRenderChildren = (child) =>
  typeof child !== "boolean" && child !== null && child !== void 0;

const createElement = (type, props = {}, ...childrenElements) => {
  const renderChildren = childrenElements
    .flat(Infinity)
    .filter(avoidNotRenderChildren);

  const children = renderChildren.map((child) =>
    typeof child === "string" || typeof child === "number"
      ? { tag: 3, text: child }
      : child
  );

  const baseParams = {
    props,
    children,
    type,
  };

  if (typeof type === "string") {
    baseParams.tag = 2;
    return baseParams;
  }
  if (isFuntionComponent(type)) {
    baseParams.tag = 1;
    return baseParams;
  }
};

//---------------------------------------------//

const updateLinkedElement = (oldFiber, newFiber, host) => {
  if (oldFiber?.type === "button") {
    console.log("213123", oldFiber);
  }
  if (!oldFiber) {
    newFiber.parent = host;
    if (newFiber.tag === 2) {
      const dom = document.createElement(newFiber.type);
      newFiber.dom = dom;
      const nearDom = takeNearDom(host);
      nearDom.appendChild(dom);
      updateDomProps(dom, undefined, newFiber.props);
      globalStack.push({ fiber: newFiber, type: 0 });
    }
    if (newFiber.tag === 3) {
      const dom = document.createTextNode(newFiber.text);
      newFiber.dom = dom;
      const nearDom = takeNearDom(host);
      nearDom.appendChild(dom);
    }
    newFiber.alternative = { ...newFiber };

    return newFiber;
  }

  if (oldFiber) {
    if (oldFiber.type === newFiber.type && oldFiber.tag === 2) {
      updateDomProps(oldFiber.dom, oldFiber.props, newFiber.props);
      newFiber.alternative = oldFiber;
      newFiber = {
        ...oldFiber,
        children: newFiber.children,
        props: newFiber.props,
      };
      globalStack.push({ fiber: newFiber, type: 1 });

      return newFiber;
    }

    if (oldFiber.type !== newFiber.type) {
      let dom;
      if (newFiber.tag === 3) {
        dom = document.createTextNode(newFiber.text);
        newFiber.dom = dom;
        newFiber.parent = host;
        newFiber.alternative = { ...newFiber };
      }

      if (newFiber.tag === 2) {
        dom = document.createElement(newFiber.type);
        newFiber.dom = dom;
        newFiber.parent = host;
        newFiber.alternative = { ...newFiber };
      }
      host.dom.replaceChild(dom, oldFiber.dom);
      return newFiber;
    }
    // if (oldFiber.type === newFiber.type) {
    // if (oldFiber.tag === 1) {
    // return { ...oldFiber, ...newFiber };
    // }/
    // }
    return { ...oldFiber, ...newFiber };
  }
};

const updateLinkedList = (fiber, children) => {
  let i = 0;
  let prevLink = fiber;
  let childLinked = false;
  while (children.length > i) {
    let child = children[i];

    if (!childLinked) {
      fiber.child = updateLinkedElement(fiber.child, child, fiber);

      prevLink = fiber.child;
      childLinked = true;
    } else {
      prevLink.sibling = updateLinkedElement(prevLink.sibling, child, fiber);
      prevLink = prevLink.sibling;
    }

    i++;
  }
};

const updateFuncionComponent = (fiber) => {
  fiber.hooks = fiber.alternative?.hooks || [];
  wip = fiber;
  hookIndex = 0;
  const renderResult = fiber.type(fiber.props);
  if (renderResult) {
    updateLinkedList(fiber, [renderResult]);
    fiber.alternative = { ...fiber };
  } else {
    fiber.child = null;
    fiber.sibling = null;
  }

  return fiber;
};

const updateHostElement = (fiber) => {
  updateLinkedList(fiber, fiber.children);
};

function updateDomProps(dom, prev, next) {
  if (!prev) {
    Object.entries(next).forEach(([propety, value]) => (dom[propety] = value));
    return;
  }
}

const doWork = (fiber) => {
  if (fiber.tag === 1) {
    fiber.name = fiber.type.name;
    updateFuncionComponent(fiber);
    return;
  }
  if (fiber.tag === 2) {
    updateHostElement(fiber);
  }

  if (fiber.tag === 3) {
    fiber.alternative = fiber.alternative || { ...fiber };
    if (fiber.text !== fiber.alternative.text) {
      fiber.dom.textContent = fiber.text;
    }

    return;
  }
};

const mountChildren = (fiber) => {
  [...fiber.children].forEach((element) => {
    if (element.dom) {
      fiber.dom.appendChild(element.dom);
    } else {
      const deepNode = takeDeepDom(element);
      if (deepNode) {
        fiber.dom.appendChild(deepNode);
      }
    }
  });
};

const updateChildren = (fiber) => {
  const alt = fiber.alternative?.children;
  const { children, dom } = fiber;
  const count = Math.max(alt.length, children.length);
  let i = 0;

  while (i < count) {
    if (alt[i]?.text !== children[i]?.text) {
      alt[i].dom.textContent = children[i].text;
    }

    i++;
  }
};
const removeChildren = (fiber) => {
  const dom = takeDeepDom(fiber);
  if (dom) {
    dom.remove();
  }
};

const commit = () => {
  console.log(globalStack);
  for (let i = 0; i < globalStack.length; i++) {
    const { fiber, type } = globalStack[i];
    if (type === 0) {
      mountChildren(fiber);
    }
    if (type === 1) {
      updateChildren(fiber);
    }
    if (type === 2) {
      removeChildren(fiber);
    }
  }

  globalStack = [];
  hookIndex = 0;
};

const root = {
  tag: 0,
  workQueue: [],
  sibling: null,
};

/** root */
const buildTree = (component, container) => {
  root.dom = container;
  root.child = component;
  root.child.parent = root;

  currentTree = root;
  workLoop(root.child);
};

const workLoop = (fiber) => {
  let currentNode = fiber;
  let hasWork = true;
  while (hasWork) {
    doWork(currentNode);

    if (currentNode.child) {
      currentNode = currentNode.child;
      continue;
    }

    if (currentNode.sibling) {
      currentNode = currentNode.sibling;
      continue;
    } else {
      while (true) {
        if (currentNode.sibling) {
          currentNode = currentNode.sibling;
          break;
        }
        if (currentNode.tag === 0 || currentNode === root) {
          hasWork = false;
          commit();
          console.log(root);
          return;
        }
        currentNode = currentNode.parent;
      }
    }
  }
};

const createRoot = (component, container) => {
  buildTree(component, container);
};

/**hooks */
function useState(init) {
  const fiber = wip;
  const oldhook = fiber.hooks[hookIndex];

  if (oldhook) {
    hookIndex++;
    return oldhook;
  }

  const setStateAction = (update) => {
    const newState =
      typeof update === "function" ? update(fiber.hooks[hookIndex][0]) : update;
    fiber.hooks[hookIndex][0] = newState;
    workLoop(fiber);
  };
  const hook = [typeof init === "function" ? init() : init, setStateAction];
  fiber.hooks.push(hook);

  return hook;
}

// export { createElement, createRoot, useState };

/// todo неправильно ходит по sibling



const root1 = document.getElementById("root");

render(createElement(App), root1);


// import { createElement, useState } from "./react/core.js";
const arr = [1, 2, 3, 4];

const Component = ({ value }) => {
  console.log("value", value);
  return createElement("button", {}, value);
};

const App = () => {
  const [value, setValue] = useState("");

  return createElement(
    "div",
    {},
    createElement("span", {}, value || 1),
    createElement("input", {
      oninput: (e) => {
        setValue(e.target.value);
      },
    }),
    arr.map((index) => createElement("div", {}, index)),
    createElement(Component, { value })
  );
};

// export { App };
