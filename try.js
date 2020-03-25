let a = [
  { a: 0, b: 2 },
  { a: 2, b: 2 }
];

let b = a.filter(shit => {
  return shit.a == 1;
})[0];

if (!b) {
  console.log("ok");
}

console.log(b);
