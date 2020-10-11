const yargs = require('yargs');



console.log(yargs.option('host', {
    type: 'string',
    default: 'localhost',
    describe: 'The host the debug server will listen to',
  }).argv);
console.log(yargs().option('host', {
    type: 'string',
    default: 'localhost',
    describe: 'The host the debug server will listen to',
  })
  .argv
);

