const app = require('./app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('Server ruleaza pe http://localhost:' + PORT);
  const {textModelSettings} = require('./textModel');
  console.log('tutor-models', {chat:textModelSettings('chat').model, feedback:textModelSettings('feedback').model});
});

require('./liveDictation').attach(server);
