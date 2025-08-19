'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from 'recharts'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'
import Image from 'next/image'
// Sound effects paths
const errorSfx = '/jingles/error.mp3'
const solvedSfx = '/jingles/solved.mp3'
const finishedSfx = '/jingles/finished.mp3'

interface Challenge {
  id: number
  title: string
  description: string
  code: string
  blanks: Array<{
    id: string
    answer: string
    placeholder: string
  }>
  testCases: Array<{
    input?: unknown[]
    expected: unknown
    description: string
  }>
  points: number
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Add Numbers',
    description: 'Add two numbers together',
    code: `function add(a, b) {
  return ___BLANK_1___;
}`,
    blanks: [{ id: 'BLANK_1', answer: 'a + b', placeholder: 'a + b' }],
    testCases: [
      { input: [2, 3], expected: 5, description: '2 + 3 = 5' },
      { input: [10, 20], expected: 30, description: '10 + 20 = 30' },
    ],
    points: 20,
  },
  {
    id: 2,
    title: 'String Length',
    description: 'Get the length of a string',
    code: `function getLength(str) {
  return str.___BLANK_1___;
}`,
    blanks: [{ id: 'BLANK_1', answer: 'length', placeholder: 'length' }],
    testCases: [
      { input: ['hello'], expected: 5, description: "Length of 'hello'" },
      { input: ['hi'], expected: 2, description: "Length of 'hi'" },
    ],
    points: 20,
  },
  {
    id: 3,
    title: 'Array Push',
    description: 'Add an item to an array',
    code: `function addToArray(arr, item) {
  arr.___BLANK_1___(item);
  return arr;
}`,
    blanks: [{ id: 'BLANK_1', answer: 'push', placeholder: 'push' }],
    testCases: [
      { input: [[1, 2], 3], expected: [1, 2, 3], description: 'Add 3 to [1,2]' },
      { input: [[], 1], expected: [1], description: 'Add 1 to []' },
    ],
    points: 30,
  },
  {
    id: 4,
    title: 'String Uppercase',
    description: 'Convert string to uppercase',
    code: `function makeUpper(str) {
  return str.___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'toUpperCase', placeholder: 'toUpperCase' }],
    testCases: [
      { input: ['hello'], expected: 'HELLO', description: "Uppercase 'hello'" },
      { input: ['Hi'], expected: 'HI', description: "Uppercase 'Hi'" },
    ],
    points: 30,
  },
  {
    id: 5,
    title: 'Array First',
    description: 'Get first item of array',
    code: `function getFirst(arr) {
  return arr[___BLANK_1___];
}`,
    blanks: [{ id: 'BLANK_1', answer: '0', placeholder: '0' }],
    testCases: [
      { input: [[1, 2, 3]], expected: 1, description: 'First of [1,2,3]' },
      { input: [['a', 'b']], expected: 'a', description: "First of ['a','b']" },
    ],
    points: 40,
  },
  {
    id: 6,
    title: 'String Concat',
    description: 'Join two strings',
    code: `function joinStrings(a, b) {
  return a ___BLANK_1___ b;
}`,
    blanks: [{ id: 'BLANK_1', answer: '+', placeholder: '+' }],
    testCases: [
      { input: ['Hello ', 'World'], expected: 'Hello World', description: 'Join Hello+World' },
      { input: ['a', 'b'], expected: 'ab', description: 'Join a+b' },
    ],
    points: 40,
  },
  {
    id: 7,
    title: 'Simple If',
    description: "Return 'yes' if true, 'no' if false",
    code: `function sayYesNo(bool) {
  return bool ? ___BLANK_1___ : "no";
}`,
    blanks: [{ id: 'BLANK_1', answer: '"yes"', placeholder: '"yes"' }],
    testCases: [
      { input: [true], expected: 'yes', description: 'When true' },
      { input: [false], expected: 'no', description: 'When false' },
    ],
    points: 50,
  },
  {
    id: 8,
    title: 'Array Length',
    description: 'Get array length',
    code: `function getSize(arr) {
  return arr.___BLANK_1___;
}`,
    blanks: [{ id: 'BLANK_1', answer: 'length', placeholder: 'length' }],
    testCases: [
      { input: [[1, 2, 3]], expected: 3, description: 'Size of [1,2,3]' },
      { input: [[]], expected: 0, description: 'Size of []' },
    ],
    points: 50,
  },
  {
    id: 9,
    title: 'Number to String',
    description: 'Convert number to string',
    code: `function toString(num) {
  return num.___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'toString', placeholder: 'toString' }],
    testCases: [
      { input: [123], expected: '123', description: 'Convert 123' },
      { input: [0], expected: '0', description: 'Convert 0' },
    ],
    points: 60,
  },
  {
    id: 10,
    title: 'Simple Math',
    description: 'Multiply two numbers',
    code: `function multiply(a, b) {
  return a ___BLANK_1___ b;
}`,
    blanks: [{ id: 'BLANK_1', answer: '*', placeholder: '*' }],
    testCases: [
      { input: [2, 3], expected: 6, description: '2 * 3' },
      { input: [4, 5], expected: 20, description: '4 * 5' },
    ],
    points: 60,
  },
  {
    id: 11,
    title: 'String Includes',
    description: 'Check if string contains letter',
    code: `function hasLetter(str, letter) {
  return str.___BLANK_1___(letter);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'includes', placeholder: 'includes' }],
    testCases: [
      { input: ['hello', 'h'], expected: true, description: "'hello' has 'h'" },
      { input: ['hi', 'x'], expected: false, description: "'hi' has no 'x'" },
    ],
    points: 70,
  },
  {
    id: 12,
    title: 'Boolean Not',
    description: 'Invert a boolean value',
    code: `function opposite(bool) {
  return ___BLANK_1___ bool;
}`,
    blanks: [{ id: 'BLANK_1', answer: '!', placeholder: '!' }],
    testCases: [
      { input: [true], expected: false, description: 'Not true' },
      { input: [false], expected: true, description: 'Not false' },
    ],
    points: 70,
  },
  {
    id: 13,
    title: 'Array Join',
    description: 'Join array with comma',
    code: `function joinWithComma(arr) {
  return arr.___BLANK_1___(',');
}`,
    blanks: [{ id: 'BLANK_1', answer: 'join', placeholder: 'join' }],
    testCases: [
      { input: [['a', 'b']], expected: 'a,b', description: "Join ['a','b']" },
      { input: [[1, 2]], expected: '1,2', description: 'Join [1,2]' },
    ],
    points: 80,
  },
  {
    id: 14,
    title: 'String Trim',
    description: 'Remove whitespace from string',
    code: `function cleanup(str) {
  return str.___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'trim', placeholder: 'trim' }],
    testCases: [
      { input: [' hi '], expected: 'hi', description: "Trim ' hi '" },
      { input: ['  x'], expected: 'x', description: "Trim '  x'" },
    ],
    points: 80,
  },
  {
    id: 15,
    title: 'Simple Delay',
    description: "Return 'done' after delay",
    code: `async function wait() {
  await new Promise(r => setTimeout(r, ___BLANK_1___));
  return "done";
}`,
    blanks: [{ id: 'BLANK_1', answer: '100', placeholder: '100' }],
    testCases: [{ input: [], expected: 'done', description: 'Wait and return' }],
    points: 100,
  },
  {
    id: 16,
    title: 'Array Slice',
    description: 'Get first three elements',
    code: `function getFirstThree(arr) {
  return arr.___BLANK_1___(0, 3);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'slice', placeholder: 'slice' }],
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [1, 2, 3], description: 'First 3 of [1,2,3,4,5]' },
      { input: [[1, 2]], expected: [1, 2], description: 'All of [1,2]' },
    ],
    points: 110,
  },
  {
    id: 17,
    title: 'String Split',
    description: 'Split string by spaces',
    code: `function getWords(str) {
  return str.___BLANK_1___(" ");
}`,
    blanks: [{ id: 'BLANK_1', answer: 'split', placeholder: 'split' }],
    testCases: [
      { input: ['hello world'], expected: ['hello', 'world'], description: "Split 'hello world'" },
      { input: ['a b c'], expected: ['a', 'b', 'c'], description: "Split 'a b c'" },
    ],
    points: 110,
  },
  {
    id: 18,
    title: 'Math Power',
    description: 'Calculate number squared',
    code: `function square(n) {
  return Math.___BLANK_1___(n, 2);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'pow', placeholder: 'pow' }],
    testCases: [
      { input: [3], expected: 9, description: '3^2 = 9' },
      { input: [4], expected: 16, description: '4^2 = 16' },
    ],
    points: 120,
  },
  {
    id: 19,
    title: 'Array Fill',
    description: 'Create array of zeros',
    code: `function zeros(length) {
  return new Array(length).___BLANK_1___(0);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'fill', placeholder: 'fill' }],
    testCases: [
      { input: [3], expected: [0, 0, 0], description: '3 zeros' },
      { input: [2], expected: [0, 0], description: '2 zeros' },
    ],
    points: 120,
  },
  {
    id: 20,
    title: 'String Replace',
    description: 'Replace first occurrence',
    code: `function replaceFirst(str, find, replace) {
  return str.___BLANK_1___(find, replace);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'replace', placeholder: 'replace' }],
    testCases: [
      {
        input: ['hello hello', 'hello', 'hi'],
        expected: 'hi hello',
        description: 'Replace first hello',
      },
      { input: ['abc', 'b', 'x'], expected: 'axc', description: 'Replace b with x' },
    ],
    points: 130,
  },
  {
    id: 21,
    title: 'Array Flat',
    description: 'Flatten nested array one level',
    code: `function flatten(arr) {
  return arr.___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'flat', placeholder: 'flat' }],
    testCases: [
      {
        input: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [1, 2, 3, 4],
        description: 'Flatten [[1,2],[3,4]]',
      },
      { input: [[[1], 2]], expected: [1, 2], description: 'Flatten [[1],2]' },
    ],
    points: 130,
  },
  {
    id: 22,
    title: 'Object Keys',
    description: 'Get object keys as array',
    code: `function getKeys(obj) {
  return Object.___BLANK_1___(obj);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'keys', placeholder: 'keys' }],
    testCases: [
      { input: [{ a: 1, b: 2 }], expected: ['a', 'b'], description: 'Keys of {a:1,b:2}' },
      { input: [{ x: 10 }], expected: ['x'], description: 'Keys of {x:10}' },
    ],
    points: 140,
  },
  {
    id: 23,
    title: 'Array From',
    description: 'Create array from string',
    code: `function stringToArray(str) {
  return Array.___BLANK_1___(str);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'from', placeholder: 'from' }],
    testCases: [
      { input: ['hello'], expected: ['h', 'e', 'l', 'l', 'o'], description: "Array from 'hello'" },
      { input: ['ab'], expected: ['a', 'b'], description: "Array from 'ab'" },
    ],
    points: 140,
  },
  {
    id: 24,
    title: 'String Repeat',
    description: 'Repeat string n times',
    code: `function repeat(str, n) {
  return str.___BLANK_1___(n);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'repeat', placeholder: 'repeat' }],
    testCases: [
      { input: ['a', 3], expected: 'aaa', description: "Repeat 'a' 3 times" },
      { input: ['hi', 2], expected: 'hihi', description: "Repeat 'hi' 2 times" },
    ],
    points: 150,
  },
  {
    id: 25,
    title: 'Array Reverse',
    description: 'Reverse array in place',
    code: `function reverseArray(arr) {
  return arr.___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'reverse', placeholder: 'reverse' }],
    testCases: [
      { input: [[1, 2, 3]], expected: [3, 2, 1], description: 'Reverse [1,2,3]' },
      { input: [[1, 2]], expected: [2, 1], description: 'Reverse [1,2]' },
    ],
    points: 150,
  },
  {
    id: 26,
    title: 'Math Round',
    description: 'Round number to nearest integer',
    code: `function roundNumber(n) {
  return Math.___BLANK_1___(n);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'round', placeholder: 'round' }],
    testCases: [
      { input: [3.7], expected: 4, description: 'Round 3.7' },
      { input: [2.2], expected: 2, description: 'Round 2.2' },
    ],
    points: 160,
  },
  {
    id: 27,
    title: 'Array Sort',
    description: 'Sort numbers in ascending order',
    code: `function sortNumbers(arr) {
  return arr.___BLANK_1___((a, b) => a - b);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'sort', placeholder: 'sort' }],
    testCases: [
      { input: [[3, 1, 2]], expected: [1, 2, 3], description: 'Sort [3,1,2]' },
      { input: [[5, 2]], expected: [2, 5], description: 'Sort [5,2]' },
    ],
    points: 160,
  },
  {
    id: 28,
    title: 'String StartsWith',
    description: 'Check if string starts with prefix',
    code: `function hasPrefix(str, prefix) {
  return str.___BLANK_1___(prefix);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'startsWith', placeholder: 'startsWith' }],
    testCases: [
      { input: ['hello', 'he'], expected: true, description: "'hello' starts with 'he'" },
      { input: ['hi', 'x'], expected: false, description: "'hi' starts with 'x'" },
    ],
    points: 170,
  },
  {
    id: 29,
    title: 'Array FindIndex',
    description: 'Find index of first even number',
    code: `function findEvenIndex(numbers) {
  return numbers.___BLANK_1___(n => n % 2 === 0);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'findIndex', placeholder: 'findIndex' }],
    testCases: [
      { input: [[1, 3, 4, 5]], expected: 2, description: 'Index in [1,3,4,5]' },
      { input: [[1, 3, 5]], expected: -1, description: 'Not found' },
    ],
    points: 170,
  },
  {
    id: 30,
    title: 'String PadStart',
    description: 'Pad number with zeros',
    code: `function padNumber(n) {
  return String(n).___BLANK_1___(3, "0");
}`,
    blanks: [{ id: 'BLANK_1', answer: 'padStart', placeholder: 'padStart' }],
    testCases: [
      { input: [7], expected: '007', description: 'Pad 7' },
      { input: [42], expected: '042', description: 'Pad 42' },
    ],
    points: 180,
  },
  {
    id: 31,
    title: 'Array Reduce Advanced',
    description: 'Count occurrences of each number',
    code: `function countNumbers(arr) {
  return arr.___BLANK_1___((acc, n) => ({...acc, [n]: (acc[n] || 0) + 1}), {});
}`,
    blanks: [{ id: 'BLANK_1', answer: 'reduce', placeholder: 'reduce' }],
    testCases: [
      { input: [[1, 2, 2, 3]], expected: { 1: 1, 2: 2, 3: 1 }, description: 'Count [1,2,2,3]' },
      { input: [[1, 1]], expected: { 1: 2 }, description: 'Count [1,1]' },
    ],
    points: 180,
  },
  {
    id: 32,
    title: 'String Match',
    description: 'Find all digits in string',
    code: `function findDigits(str) {
  return str.___BLANK_1___(/\\d/g) || [];
}`,
    blanks: [{ id: 'BLANK_1', answer: 'match', placeholder: 'match' }],
    testCases: [
      { input: ['ab12c3'], expected: ['1', '2', '3'], description: "Digits in 'ab12c3'" },
      { input: ['xyz'], expected: [], description: 'No digits' },
    ],
    points: 190,
  },
  {
    id: 33,
    title: 'Array Reduce Right',
    description: 'Join words from right to left',
    code: `function joinReverse(words) {
  return words.___BLANK_1___((acc, word) => word + " " + acc).trim();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'reduceRight', placeholder: 'reduceRight' }],
    testCases: [
      { input: [['a', 'b', 'c']], expected: 'c b a', description: "Join ['a','b','c']" },
      { input: [['x', 'y']], expected: 'y x', description: "Join ['x','y']" },
    ],
    points: 190,
  },
  {
    id: 34,
    title: 'Object Entries',
    description: 'Convert object to key-value pairs',
    code: `function toPairs(obj) {
  return Object.___BLANK_1___(obj);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'entries', placeholder: 'entries' }],
    testCases: [
      {
        input: [{ a: 1, b: 2 }],
        expected: [
          ['a', 1],
          ['b', 2],
        ],
        description: 'Pairs of {a:1,b:2}',
      },
      { input: [{ x: 10 }], expected: [['x', 10]], description: 'Pairs of {x:10}' },
    ],
    points: 200,
  },
  {
    id: 35,
    title: 'Array FlatMap',
    description: 'Split words and flatten',
    code: `function splitWords(sentences) {
  return sentences.___BLANK_1___(s => s.split(" "));
}`,
    blanks: [{ id: 'BLANK_1', answer: 'flatMap', placeholder: 'flatMap' }],
    testCases: [
      {
        input: [['hello world', 'hi there']],
        expected: ['hello', 'world', 'hi', 'there'],
        description: 'Split sentences',
      },
      { input: [['a b']], expected: ['a', 'b'], description: 'Split one' },
    ],
    points: 200,
  },
  {
    id: 36,
    title: 'Promise Chain',
    description: 'Chain a promise transformation',
    code: `function doubleAsync(n) {
  return Promise.resolve(n).___BLANK_1___(x => x * 2);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'then', placeholder: 'then' }],
    testCases: [
      { input: [2], expected: 4, description: 'Double 2' },
      { input: [5], expected: 10, description: 'Double 5' },
    ],
    points: 210,
  },
  {
    id: 37,
    title: 'Array Complex Filter',
    description: 'Filter objects by property',
    code: `function filterByAge(users) {
  return users.___BLANK_1___(user => user.age > 18);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'filter', placeholder: 'filter' }],
    testCases: [
      { input: [[{ age: 20 }, { age: 16 }]], expected: [{ age: 20 }], description: 'Adults only' },
      { input: [[{ age: 15 }]], expected: [], description: 'No adults' },
    ],
    points: 210,
  },
  {
    id: 38,
    title: 'String Complex Replace',
    description: 'Replace all digits with X',
    code: `function hideDigits(str) {
  return str.___BLANK_1___(/\\d/g, "X");
}`,
    blanks: [{ id: 'BLANK_1', answer: 'replaceAll', placeholder: 'replaceAll' }],
    testCases: [
      { input: ['ab12c3'], expected: 'abXXcX', description: "Hide in 'ab12c3'" },
      { input: ['45'], expected: 'XX', description: "Hide in '45'" },
    ],
    points: 220,
  },
  {
    id: 39,
    title: 'Advanced Map',
    description: 'Map with index access',
    code: `function mapWithIndex(arr) {
  return arr.___BLANK_1___((x, i) => x * i);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'map', placeholder: 'map' }],
    testCases: [
      { input: [[1, 2, 3]], expected: [0, 2, 6], description: 'Map [1,2,3]' },
      { input: [[2, 2]], expected: [0, 2], description: 'Map [2,2]' },
    ],
    points: 220,
  },
  {
    id: 40,
    title: 'Promise Race',
    description: 'Get first resolved value',
    code: `function getFirst(promises) {
  return Promise.___BLANK_1___(promises);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'race', placeholder: 'race' }],
    testCases: [
      {
        input: [[Promise.resolve(1), Promise.resolve(2)]],
        expected: 1,
        description: 'First resolved',
      },
    ],
    points: 230,
  },
  {
    id: 41,
    title: 'Regex Test',
    description: 'Check if string has only letters',
    code: `function onlyLetters(str) {
  return /^[A-Za-z]+$/.___BLANK_1___(str);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'test', placeholder: 'test' }],
    testCases: [
      { input: ['Hello'], expected: true, description: "Test 'Hello'" },
      { input: ['123'], expected: false, description: "Test '123'" },
    ],
    points: 230,
  },
  {
    id: 42,
    title: 'Advanced Sort',
    description: 'Sort by object property',
    code: `function sortByName(items) {
  return items.___BLANK_1___((a, b) => a.name.localeCompare(b.name));
}`,
    blanks: [{ id: 'BLANK_1', answer: 'sort', placeholder: 'sort' }],
    testCases: [
      {
        input: [[{ name: 'b' }, { name: 'a' }]],
        expected: [{ name: 'a' }, { name: 'b' }],
        description: 'Sort by name',
      },
    ],
    points: 240,
  },
  {
    id: 43,
    title: 'Promise All Settled',
    description: 'Get all promise results',
    code: `function getAllResults(promises) {
  return Promise.___BLANK_1___(promises);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'allSettled', placeholder: 'allSettled' }],
    testCases: [
      {
        input: [[Promise.resolve(1)]],
        expected: [{ status: 'fulfilled', value: 1 }],
        description: 'All results',
      },
    ],
    points: 240,
  },
  {
    id: 44,
    title: 'Advanced Reduce',
    description: 'Group objects by property',
    code: `function groupByType(items) {
  return items.___BLANK_1___((acc, item) => ({
    ...acc,
    [item.type]: [...(acc[item.type] || []), item]
  }), {});
}`,
    blanks: [{ id: 'BLANK_1', answer: 'reduce', placeholder: 'reduce' }],
    testCases: [
      {
        input: [
          [
            { type: 'a', id: 1 },
            { type: 'a', id: 2 },
          ],
        ],
        expected: {
          a: [
            { type: 'a', id: 1 },
            { type: 'a', id: 2 },
          ],
        },
        description: 'Group by type',
      },
    ],
    points: 250,
  },
  {
    id: 45,
    title: 'Complex Promise Chain',
    description: 'Transform and filter async results',
    code: `async function processNumbers(nums) {
  return Promise.resolve(nums)
    .___BLANK_1___(arr => arr.filter(n => n > 0))
    .then(arr => arr.map(n => n * 2));
}`,
    blanks: [{ id: 'BLANK_1', answer: 'then', placeholder: 'then' }],
    testCases: [{ input: [[-1, 2, 3]], expected: [4, 6], description: 'Process [-1,2,3]' }],
    points: 250,
  },
  {
    id: 46,
    title: 'JSON Parse',
    description: 'Parse JSON string to object',
    code: `function parseData(str) {
  return JSON.___BLANK_1___(str);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'parse', placeholder: 'parse' }],
    testCases: [
      { input: ['{"a":1}'], expected: { a: 1 }, description: 'Parse {a:1}' },
      { input: ['[1,2]'], expected: [1, 2], description: 'Parse [1,2]' },
    ],
    points: 260,
  },
  {
    id: 47,
    title: 'Date Format',
    description: 'Get year from date string',
    code: `function getYear(dateStr) {
  return new Date(dateStr).___BLANK_1___();
}`,
    blanks: [{ id: 'BLANK_1', answer: 'getFullYear', placeholder: 'getFullYear' }],
    testCases: [
      { input: ['2024-01-01'], expected: 2024, description: 'Year 2024' },
      { input: ['2023-12-31'], expected: 2023, description: 'Year 2023' },
    ],
    points: 260,
  },
  {
    id: 48,
    title: 'URL Parse',
    description: 'Get search params from URL',
    code: `function getParams(url) {
  return new URL(url).___BLANK_1___;
}`,
    blanks: [{ id: 'BLANK_1', answer: 'searchParams', placeholder: 'searchParams' }],
    testCases: [
      {
        input: ['https://example.com?a=1'],
        expected: new URLSearchParams('a=1'),
        description: 'Get params',
      },
    ],
    points: 270,
  },
  {
    id: 49,
    title: 'Set Operations',
    description: 'Create set from array',
    code: `function uniqueValues(arr) {
  return new ___BLANK_1___(arr);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'Set', placeholder: 'Set' }],
    testCases: [
      { input: [[1, 1, 2, 2]], expected: new Set([1, 2]), description: 'Unique [1,1,2,2]' },
    ],
    points: 270,
  },
  {
    id: 50,
    title: 'Map Transform',
    description: 'Create Map from object',
    code: `function objectToMap(obj) {
  return new Map(Object.___BLANK_1___(obj));
}`,
    blanks: [{ id: 'BLANK_1', answer: 'entries', placeholder: 'entries' }],
    testCases: [
      { input: [{ a: 1 }], expected: new Map([['a', 1]]), description: 'Map from {a:1}' },
    ],
    points: 280,
  },
  {
    id: 51,
    title: 'String Pad End',
    description: 'Pad string with dots',
    code: `function padWithDots(str, length) {
  return str.___BLANK_1___(length, ".");
}`,
    blanks: [{ id: 'BLANK_1', answer: 'padEnd', placeholder: 'padEnd' }],
    testCases: [{ input: ['hi', 4], expected: 'hi..', description: "Pad 'hi' to 4" }],
    points: 280,
  },
  {
    id: 52,
    title: 'Array At',
    description: 'Get last element using negative index',
    code: `function getLast(arr) {
  return arr.___BLANK_1___(-1);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'at', placeholder: 'at' }],
    testCases: [{ input: [[1, 2, 3]], expected: 3, description: 'Last of [1,2,3]' }],
    points: 290,
  },
  {
    id: 53,
    title: 'Object FromEntries',
    description: 'Convert entries to object',
    code: `function entriesToObject(entries) {
  return Object.___BLANK_1___(entries);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'fromEntries', placeholder: 'fromEntries' }],
    testCases: [{ input: [[['a', 1]]], expected: { a: 1 }, description: "Object from [['a',1]]" }],
    points: 290,
  },
  {
    id: 54,
    title: 'Array Group',
    description: 'Group array by length',
    code: `function groupByLength(arr) {
  return Object.groupBy(arr, item => item.___BLANK_1___);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'length', placeholder: 'length' }],
    testCases: [
      {
        input: [['a', 'bb']],
        expected: { '1': ['a'], '2': ['bb'] },
        description: 'Group by length',
      },
    ],
    points: 300,
  },
  {
    id: 55,
    title: 'Intl Format',
    description: 'Format number as currency',
    code: `function formatUSD(num) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).___BLANK_1___(num);
}`,
    blanks: [{ id: 'BLANK_1', answer: 'format', placeholder: 'format' }],
    testCases: [{ input: [123.45], expected: '$123.45', description: 'Format 123.45' }],
    points: 300,
  },
]

export default function CodeTypeGame() {
  const INITIAL_TIME = 60
  const [playError] = useSound(errorSfx, { volume: 0.4 })
  const [playSolved] = useSound(solvedSfx, { volume: 0.3 })
  const [playFinished] = useSound(finishedSfx, { volume: 0.6 })
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [gameActive, setGameActive] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [perSecondScore, setPerSecondScore] = useState<number[]>([])
  const [perSecondErrors, setPerSecondErrors] = useState<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const startGame = useCallback(() => {
    setGameActive(true)
    setTimeLeft(INITIAL_TIME)
    setScore(0)
    setCurrentChallenge(0)
    setAnswers({})
    setFeedback(null)
    setSolved(0)
    setAttempts(0)
    setErrorCount(0)
    setPerSecondScore([])
    setPerSecondErrors([])
  }, [])

  const executeCode = useCallback(async (code: string, testCases: Challenge['testCases']) => {
    try {
      for (const testCase of testCases) {
        const testCode = `
          ${code}

          // Extract function name from the code
          const functionName = code.match(/function\\s+(\\w+)\\s*\\(/)?.[1];
          if (!functionName) throw new Error("Could not find function name");

          // Test the function with its inputs
          (async function() {
            const inputs = ${JSON.stringify(testCase.input || [])};
            const fn = eval(functionName);
            const result = await fn.apply(null, inputs);
            return result;
          })()
        `
        const result = await eval(testCode)

        if (JSON.stringify(result) !== JSON.stringify(testCase.expected)) {
          return {
            success: false,
            message: `Failed: ${testCase.description}. Expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(result)}`,
          }
        }
      }
      setTimeLeft((prev) => prev + 1)
      return { success: true, message: 'All tests passed! 🎉' }
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }, [])

  const runCode = useCallback(async () => {
    const challenge = challenges[currentChallenge]
    setAttempts((prev) => prev + 1)

    let completeCode = challenge.code
    challenge.blanks.forEach((blank) => {
      const userAnswer = answers[blank.id] || ''
      completeCode = completeCode.replace(`___${blank.id}___`, userAnswer)
    })

    const result = await executeCode(completeCode, challenge.testCases)

    if (result.success) {
      playSolved() // Play success sound
      setScore((prev) => prev + challenge.points)
      setSolved((prev) => prev + 1)
      setFeedback({ type: 'success', message: `${result.message} +${challenge.points} points` })

      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          const nextIndex = currentChallenge + 1
          setCurrentChallenge(nextIndex)
          setAnswers({})
          setFeedback(null)
        } else {
          playFinished() // Play finished sound when completing all challenges
          setCurrentChallenge(0)
          setAnswers({})
          setFeedback(null)
        }
      }, 1500)
    } else {
      playError() // Play error sound
      setFeedback({ type: 'error', message: result.message })
      setErrorCount((prev) => prev + 1)
      setTimeLeft((prev) => Math.max(0, prev - 20)) // Decrease time by 20 seconds for wrong answers
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [answers, currentChallenge, executeCode, playError, playFinished, playSolved])

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [currentChallenge])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Enter' && inputRef.current) {
        e.preventDefault()
        if (!gameActive) setGameActive(true)
        await runCode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [gameActive, runCode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setGameActive(false)
      playFinished() // Play finished sound when time's up
    }
    return () => clearInterval(interval)
  }, [gameActive, timeLeft, playFinished])

  // Snapshot score and errors each second for the results chart
  useEffect(() => {
    if (!gameActive && timeLeft !== INITIAL_TIME && timeLeft !== 0) return
    if (gameActive && timeLeft >= 0 && timeLeft < INITIAL_TIME) {
      const second = INITIAL_TIME - timeLeft // 1..60
      const index = Math.max(0, second - 1)
      setPerSecondScore((prev) => {
        const next = prev.slice()
        next[index] = score
        return next
      })
      setPerSecondErrors((prev) => {
        const next = prev.slice()
        next[index] = errorCount
        return next
      })
    }
  }, [timeLeft, gameActive, score, errorCount])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const wpm = attempts > 0 ? Math.round((solved / (60 - timeLeft)) * 60) || 0 : 0
  const accuracy = attempts > 0 ? Math.round((solved / attempts) * 100) : 0

  const renderCodeWithInput = () => {
    const challenge = challenges[currentChallenge]
    const blank = challenge.blanks[0] // Assuming one blank per challenge for simplicity

    const parts = challenge.code.split(`___${blank.id}___`)
    const highlightedPart0 = Prism.highlight(parts[0], Prism.languages.javascript, 'javascript')
    const highlightedPart1 = Prism.highlight(parts[1], Prism.languages.javascript, 'javascript')

    return (
      <pre className="bg-muted/40 border border-border rounded-lg p-4 overflow-auto whitespace-pre-wrap leading-relaxed">
        <code className="font-mono text-sm sm:text-base text-foreground">
          <span dangerouslySetInnerHTML={{ __html: highlightedPart0 }} />
          <motion.input
            ref={inputRef}
            type="text"
            value={answers[blank.id] || ''}
            onChange={(e) => {
              setAnswers((prev) => ({
                ...prev,
                [blank.id]: e.target.value,
              }))
              if (!gameActive) setGameActive(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (!gameActive) setGameActive(true)
                runCode()
              }
            }}
            placeholder={blank.placeholder}
            className="align-baseline bg-transparent placeholder:text-muted-foreground/60 border-0 border-b border-dashed border-border focus:border-primary focus:outline-none px-1 text-foreground font-mono text-sm sm:text-base min-w-[140px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileFocus={{ scale: 1.02 }}
          />
          <span dangerouslySetInnerHTML={{ __html: highlightedPart1 }} />
        </code>
      </pre>
    )
  }

<<<<<<< HEAD
	if (!gameActive && timeLeft === 0) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="fixed top-4 right-4">
					<ThemeToggle />
				</div>
				<div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            
						<div className="flex items-center justify-center gap-3 mb-6">
							<Image
								src="/btype.png"
								alt="Blankytype Logo"
								width={48}
								height={48}
								className="h-12 w-12"
							/>
							<h1 className="text-4xl font-bold">Time&apos;s Up!</h1>
						</div>
						<div className="text-6xl font-bold text-primary">{score}</div>
						<div className="flex items-center justify-center gap-2">
							<p className="text-muted-foreground">Coding IQ: </p>
							<p className="text-xl font-semibold">{Math.min(200, Math.round((score / 700) * 150 + (accuracy / 100) * 50))}</p>
							<Button
								variant="outline"
								size="sm"
								className="ml-2"
								onClick={() => {
									// Create a canvas with the stats
									const canvas = document.createElement("canvas");
									const ctx = canvas.getContext("2d");
									canvas.width = 1200;
									canvas.height = 630;
=======
  if (!gameActive && timeLeft === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image
                src="/btype.png"
                alt="BlankyType Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <h1 className="text-4xl font-bold">Time&apos;s Up!</h1>
            </div>
            <div className="text-6xl font-bold text-primary">{score}</div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-muted-foreground">Coding IQ: </p>
              <p className="text-xl font-semibold">
                {Math.min(200, Math.round((score / 700) * 150 + (accuracy / 100) * 50))}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => {
                  // Create a canvas with the stats
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  canvas.width = 1200
                  canvas.height = 630
>>>>>>> 5740886 (test prettier)

                  if (ctx) {
                    // Set background
                    ctx.fillStyle = document.documentElement.classList.contains('dark')
                      ? '#020817'
                      : '#ffffff'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

<<<<<<< HEAD
										// Draw title
										ctx.fillStyle = document.documentElement.classList.contains("dark") ? "#ffffff" : "#020817";
										ctx.font = "bold 48px system-ui";
										ctx.textAlign = "center";
										ctx.fillText("Blankytype Results", 600, 100);
=======
                    // Draw title
                    ctx.fillStyle = document.documentElement.classList.contains('dark')
                      ? '#ffffff'
                      : '#020817'
                    ctx.font = 'bold 48px system-ui'
                    ctx.textAlign = 'center'
                    ctx.fillText('BlankyType Results', 600, 100)
>>>>>>> 5740886 (test prettier)

                    // Draw stats
                    ctx.font = 'bold 36px system-ui'
                    ctx.fillText(`Score: ${score}`, 600, 200)
                    ctx.fillText(
                      `Coding IQ: ${Math.min(200, Math.round((score / 700) * 150 + (accuracy / 100) * 50))}`,
                      600,
                      260
                    )
                    ctx.fillText(`Accuracy: ${accuracy}%`, 600, 320)
                    ctx.fillText(`Challenges/Min: ${wpm}`, 600, 380)
                    ctx.fillText(`Challenges Solved: ${solved}`, 600, 440)

                    // Add timestamp
                    ctx.font = '24px system-ui'
                    ctx.fillStyle = document.documentElement.classList.contains('dark')
                      ? '#64748b'
                      : '#94a3b8'
                    ctx.fillText(new Date().toLocaleDateString(), 600, 500)

<<<<<<< HEAD
										// Convert to image and download
										const link = document.createElement("a");
										link.download = "Blankytype-score.png";
										link.href = canvas.toDataURL();
										link.click();
									}
								}}
							>
								Share Score
							</Button>
						</div>
					</div>
=======
                    // Convert to image and download
                    const link = document.createElement('a')
                    link.download = 'blankytype-score.png'
                    link.href = canvas.toDataURL()
                    link.click()
                  }
                }}
              >
                Share Score
              </Button>
            </div>
          </div>
>>>>>>> 5740886 (test prettier)

          <Card className="p-8 border border-border bg-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold">{solved}</div>
                <div className="text-sm text-muted-foreground">Challenges Solved</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{wpm}</div>
                <div className="text-sm text-muted-foreground">Challenges/Min</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-500">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold">Performance Analysis</h3>
              <div className="text-sm text-muted-foreground text-left space-y-2">
                <p>
                  • Speed Rating:{' '}
                  {wpm < 5
                    ? 'Beginner'
                    : wpm < 10
                      ? 'Intermediate'
                      : wpm < 15
                        ? 'Advanced'
                        : 'Expert'}
                </p>
                <p>
                  • Accuracy Rating:{' '}
                  {accuracy < 60
                    ? 'Needs Practice'
                    : accuracy < 80
                      ? 'Good'
                      : accuracy < 90
                        ? 'Great'
                        : 'Excellent'}
                </p>
                <p>
                  • Challenge Level:{' '}
                  {solved < 5
                    ? 'Beginner'
                    : solved < 10
                      ? 'Intermediate'
                      : solved < 15
                        ? 'Advanced'
                        : 'Master'}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <ChartContainer
                config={{
                  Score: { label: 'Score Progress', color: 'oklch(0.69 0.15 259)' },
                  Errors: { label: 'Error Rate', color: 'oklch(0.69 0.18 25)' },
                }}
                className="h-64"
              >
                <LineChart
                  data={Array.from({ length: INITIAL_TIME }, (_, i) => ({
                    second: i + 1,
                    score: perSecondScore[i] ?? (i > 0 ? (perSecondScore[i - 1] ?? 0) : 0),
                    errors: perSecondErrors[i] ?? (i > 0 ? (perSecondErrors[i - 1] ?? 0) : 0),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="second"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score Progress"
                    stroke="var(--color-Score)"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    name="Error Rate"
                    stroke="var(--color-Errors)"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </div>

<<<<<<< HEAD
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
							<Button
								onClick={startGame}
								size="lg"
								className="w-full h-12 text-lg"
							>
								Try Again
							</Button>
							<Button
								onClick={() => {
									const text = `I scored ${score} points (IQ: ${Math.min(
										200,
										Math.round((score / 700) * 150 + (accuracy / 100) * 50),
									)}) in Blankytype! 🚀\nAccuracy: ${accuracy}%\nChallenges/Min: ${wpm}\nChallenges Solved: ${solved}\n\nTry it out!`;
									window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
								}}
								size="lg"
								variant="outline"
								className="w-full h-12 text-lg"
							>
								Share on Twitter
							</Button>
						</div>
					</Card>
				</div>
			</div>
		);
	}
=======
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Button onClick={startGame} size="lg" className="w-full h-12 text-lg">
                Try Again
              </Button>
              <Button
                onClick={() => {
                  const text = `I scored ${score} points (IQ: ${Math.min(
                    200,
                    Math.round((score / 700) * 150 + (accuracy / 100) * 50)
                  )}) in BlankyType! 🚀\nAccuracy: ${accuracy}%\nChallenges/Min: ${wpm}\nChallenges Solved: ${solved}\n\nTry it out!`
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                    '_blank'
                  )
                }}
                size="lg"
                variant="outline"
                className="w-full h-12 text-lg"
              >
                Share on Twitter
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }
>>>>>>> 5740886 (test prettier)

  const challenge = challenges[currentChallenge]

<<<<<<< HEAD
	return (
		<div className="min-h-screen bg-background p-4">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
        <h1 className="text-xs text-muted-foreground pl-12 translate-y-8">Blanky see</h1>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-3">
							<Image
								src="/btype.png"
								alt="Blankytype Logo"
								width={32}
								height={32}
								className="h-8 w-8"
							/>
							<h1 className="text-xl font-semibold tracking-tight">Blankytype</h1>
						</div>
						<div className="text-sm text-muted-foreground font-mono">{challenge.title}</div>
					</div>
					<div className="flex items-center gap-4 text-sm">
						<ThemeToggle />
						<div className="font-mono">
							<span className="text-muted-foreground">time</span> {formatTime(timeLeft)}
						</div>
						<div className="font-mono">
							<span className="text-muted-foreground">score</span> {score}
						</div>
					</div>
				</div>
				<Card className="p-10 border border-border bg-card/40">
					<div className="space-y-6">
						<p className="text-muted-foreground text-sm">{challenge.description}</p>
						{renderCodeWithInput()}
						<div className="text-xs text-muted-foreground">Press Enter to run. Timer starts when you begin typing.</div>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<h3 className="font-medium text-sm text-muted-foreground">Test Cases</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{challenge.testCases.map((test, i) => (
										<div
											key={i}
											className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-border"
										>
											{test.description} → {JSON.stringify(test.expected)}
										</div>
									))}
								</div>
							</div>
							<Button
								onClick={runCode}
								size="sm"
								className="px-4"
							>
								Run (Enter)
							</Button>
						</div>
=======
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/btype.png"
                alt="BlankyType Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <h1 className="text-xl font-semibold tracking-tight">BlankyType</h1>
            </div>
            <div className="text-sm text-muted-foreground font-mono">{challenge.title}</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            <div className="font-mono">
              <span className="text-muted-foreground">time</span> {formatTime(timeLeft)}
            </div>
            <div className="font-mono">
              <span className="text-muted-foreground">score</span> {score}
            </div>
          </div>
        </div>

        <Card className="p-10 border border-border bg-card/40">
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">{challenge.description}</p>
            {renderCodeWithInput()}
            <div className="text-xs text-muted-foreground">
              Press Enter to run. Timer starts when you begin typing.
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">Test Cases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {challenge.testCases.map((test, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-border"
                    >
                      {test.description} → {JSON.stringify(test.expected)}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={runCode} size="sm" className="px-4">
                Run (Enter)
              </Button>
            </div>
>>>>>>> 5740886 (test prettier)

            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  className={`p-3 rounded-md text-sm border ${
                    feedback.type === 'success'
                      ? 'bg-green-950 text-green-400 border-green-800'
                      : 'bg-red-950 text-red-400 border-red-800'
                  }`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  )
}
