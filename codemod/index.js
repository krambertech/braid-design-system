#!/usr/bin/env node

const glob = require('fast-glob');
const workerpool = require('workerpool');

const pathGlob = process.argv[2];

const paths = glob.sync(pathGlob, { ignore: ['**/node_modules/**', '*.d.ts'] });

const pool = workerpool.pool(`${__dirname}/wrapper.js`);

const jobs = [];

for (const filepath of paths) {
  jobs.push(
    pool.exec('codemod', [filepath]).catch((err) => {
      console.error(err);
    }),
  );
}

Promise.all(jobs)
  .then((results) => {
    for (const { warnings } of results) {
      warnings.forEach((warning) => console.log(warning));
    }

    const updateCount = results.filter(({ updated }) => updated).length;

    console.log(`${updateCount}/${results.length} files updated`);
  })
  .finally(() => {
    pool.terminate();
  });
