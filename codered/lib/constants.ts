export const GAME_CONSTANTS = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 8,
  DEFAULT_ROUNDS: 5,
  DEFAULT_ROUND_DURATION: 180, // 3 minutes in seconds
  ROLE_REVEAL_DURATION: 5000, // 5 seconds
  VOTING_DURATION: 30, // 30 seconds
  RESULTS_DURATION: 10000, // 10 seconds
};

export const POINTS = {
  BUG_FIX_SUCCESS: 100,
  BUG_FIX_FAILURE: -20,
  SABOTAGE_SUCCESS: 150,
  SABOTAGE_CAUGHT: -50,
  CATCH_SABOTEUR: 75,
  FALSE_ACCUSATION: -30,
};

export const BUG_TASKS = [
  {
    id: 'task-1',
    description: 'Fix the infinite loop in the factorial function',
    language: 'javascript',
    code: `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n); // Bug: should be n - 1
}

console.log(factorial(5));`,
    solution: 'factorial(n - 1)',
  },
  {
    id: 'task-2',
    description: 'Fix the array index bug',
    language: 'python',
    code: `def get_last_element(arr):
    return arr[len(arr)]  # Bug: should be len(arr) - 1

numbers = [1, 2, 3, 4, 5]
print(get_last_element(numbers))`,
    solution: 'arr[len(arr) - 1]',
  },
  {
    id: 'task-3',
    description: 'Fix the comparison operator',
    language: 'javascript',
    code: `function isEven(num) {
  return num % 2 = 0; // Bug: should be === not =
}

console.log(isEven(4));`,
    solution: 'num % 2 === 0',
  },
  {
    id: 'task-4',
    description: 'Fix the missing return statement',
    language: 'python',
    code: `def add_numbers(a, b):
    sum = a + b
    # Bug: missing return statement

result = add_numbers(5, 3)
print(result)`,
    solution: 'return sum',
  },
  {
    id: 'task-5',
    description: 'Fix the variable scope issue',
    language: 'javascript',
    code: `function createCounter() {
  var count = 0; // Bug: should be let
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter());`,
    solution: 'let count = 0',
  },
  {
    id: 'task-6',
    description: 'Fix the string concatenation bug',
    language: 'python',
    code: `def greet(name):
    return "Hello, " + name + !  # Bug: ! should be in quotes

print(greet("World"))`,
    solution: '"Hello, " + name + "!"',
  },
];
