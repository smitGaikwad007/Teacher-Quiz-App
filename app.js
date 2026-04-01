let D = fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
  .then(res => res.json())
  .then(data => {
    console.log(data.results);
  })
  .catch(err => console.log(err));

console.log(D)