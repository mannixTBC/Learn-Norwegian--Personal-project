const app = require('./app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('Server ruleaza pe http://localhost:' + PORT);
});

require('./liveDictation').attach(server);
