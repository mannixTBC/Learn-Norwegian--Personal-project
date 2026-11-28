const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeContact, allowContact, buildEmail } = require('./contact');

test('normalizează mesajul de contact și respinge date nevalide', () => {
  assert.deepEqual(normalizeContact({ email: ' ana@example.com ', message: '  Nu pornește lecția.  ', category: 'lessons', platform: 'android' }),
    { email: 'ana@example.com', message: 'Nu pornește lecția.', category: 'lessons', platform: 'android', appVersion: '' });
  assert.equal(normalizeContact({ email: 'a@b.co', message: 'Mesaj destul de lung', category: 'hack' }).category, 'other');
  assert.throws(() => normalizeContact({ email: 'nu-e-email', message: 'Mesaj destul de lung' }), /e-mail/);
  assert.throws(() => normalizeContact({ email: 'a@b.co', message: 'scurt' }), /10 caractere/);
});

test('limitează mesajele repetate pe aceeași cheie', () => {
  const now = 1_000_000;
  for (let i = 0; i < 5; i += 1) assert.equal(allowContact(['ip:test-limit'], now + i), true);
  assert.equal(allowContact(['ip:test-limit'], now + 10), false);
  assert.equal(allowContact(['ip:test-limit'], now + 60 * 60 * 1000 + 10), true);
});

test('e-mailul are reply-to la utilizator și detaliile cererii', () => {
  process.env.SUPPORT_EMAIL = 'support@example.com';
  const mail = buildEmail({ email: 'ana@example.com', message: 'Salut', category: 'account', platform: 'ios', appVersion: '1.2.0' }, 'user-1');
  assert.equal(mail.reply_to, 'ana@example.com');
  assert.deepEqual(mail.to, ['support@example.com']);
  assert.match(mail.subject, /Cont și abonament/);
  assert.match(mail.text, /Utilizator: user-1/);
});
