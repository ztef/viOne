class vi_cube {
  constructor() {
    this.data = {};
  }

  setValue(data) {
    let currentLevel = this.data;

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        currentLevel[key] = currentLevel[key] || {};
        currentLevel = currentLevel[key];
      }
    }

    currentLevel.value = data.value;
  }

  traverse(callback) {
    const recursiveTraversal = (node, dimensions) => {
      for (const prop in node) {
        if (prop === 'value') {
          callback({ value: node[prop], ...dimensions });
        } else if (typeof node[prop] === 'object') {
          recursiveTraversal(node[prop], { ...dimensions, [prop]: prop });
        }
      }
    };

    recursiveTraversal(this.data, {});
  }

  traverseLevel(level, callback) {
    const recursiveTraversal = (node, dimensions, currentLevel) => {
      if (currentLevel === level) {
        callback({ value: node.value, ...dimensions });
      }

      for (const prop in node) {
        if (typeof node[prop] === 'object') {
          recursiveTraversal(node[prop], { ...dimensions, [prop]: prop }, currentLevel + 1);
        }
      }
    };

    recursiveTraversal(this.data, {}, 0);
  }

  // Other methods remain unchanged...
}

// Ejemplo de uso :


/*
const dataCube = new vi_cube();

// Set values using object parameter
dataCube.setValue({ customer: "custA", route: "route1", value: 42 });
dataCube.setValue({ customer: "custB", route: "route2", value: 55 });
dataCube.setValue({ customer: "custC", route: "route3", value: 10 });

// Add a new dimension
dataCube.setValue({ customer: "custA", route: "route1", product: "prodX", value: 15 });
dataCube.setValue({ customer: "custB", route: "route2", product: "prodY", value: 25 });
dataCube.setValue({ customer: "custC", route: "route3", product: "prodZ", value: 30 });

// Traverse and print all elements
dataCube.traverse(element => {
  console.log(element);
});

// Traverse and print elements at a specific level
dataCube.traverseLevel(1, element => {
  console.log(element);
});

*/
