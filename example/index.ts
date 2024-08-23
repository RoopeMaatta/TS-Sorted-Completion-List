// Edit this file to trigger the TSServer commands.

const anExampleVariable = "Hello World"
console.log(anExampleVariable)



const wufVariable = {
1: "1.first",
2: "1.second",
10: "1.third", 
a1: "2.first",
a2: "2.second",
a10: "2.third",
b3: "3.first",
b10: "3.second",
};

//and I write to get a completion list suggestions:

wufVariable.

// default completion list order: {1, 10, 2, a1, a10, a2, b10, b3}
// desired completion list order: {1, 2, 10 a1, a2, a10, b3, b10}