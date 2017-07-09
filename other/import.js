'use strict';

const readline = require('readline')
const fs = require('fs');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./movies2.db');


let num = 0;

const rl = readline.createInterface({
  input: fs.createReadStream('keyword_ids_07_08_2017.json')
});


db.serialize(() => {
  db.run("begin transaction");
  db.run('DROP TABLE IF EXISTS tags')
  db.run(`CREATE TABLE "tags" (
          "id"  INTEGER NOT NULL,
          "name"  TEXT NOT NULL,
          PRIMARY KEY ("id")
          );`);
  const statement = db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`);

  rl.on('line', (input) => {
    if(++num % 1000 == 0) console.log(`Imported item #${num}`);
    const line = JSON.parse(input);
    statement.run(line.id, line.name);
  });

  rl.on('close',  () => {
    statement.finalize();
    console.log(`Done importing ${num} items`);
    db.run('commit');
  });
});

