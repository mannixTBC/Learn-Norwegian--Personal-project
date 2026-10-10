const crypto = require('node:crypto');

const fail = (message, status = 401) => Object.assign(new Error(message), { status });
const secret = () => process.env.CARTESIA_STREAM_SECRET || process.env.CHAT_SESSION_SECRET || process.env.OPENAI_API_KEY || '';
const key = () => crypto.createHash('sha256').update(`nordlingo-cartesia-stream-v1:${secret()}`).digest();

const createVoiceStreamTicket = ({ text, sessionId, turn }, now = Date.now()) => {
  if (!secret()) throw fail('Streamingul vocal nu este configurat.', 503);
  if (typeof text !== 'string' || !text.trim() || text.length > 1_200) throw fail('Replica nu este validă.', 400);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const payload = Buffer.from(JSON.stringify({
    kind: 'cartesia-dialogue',
    text: text.trim(),
    sessionId,
    turn,
    expires: now + 60_000,
  }));
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
};

const verifyVoiceStreamTicket = (ticket, now = Date.now()) => {
  if (!secret() || typeof ticket !== 'string' || ticket.length > 4_000) throw fail('Linkul audio nu este valid.', 401);
  const parts = ticket.split('.');
  if (parts.length !== 3) throw fail('Linkul audio nu este valid.', 401);
  try {
    const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, 'base64url'));
    if (iv.length !== 12 || tag.length !== 16 || !encrypted.length) throw new Error('invalid-ticket');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
    if (payload.kind !== 'cartesia-dialogue' || typeof payload.text !== 'string' || !payload.text.trim()
      || payload.text.length > 1_200 || !Number.isFinite(payload.expires) || payload.expires < now) {
      throw new Error('expired-ticket');
    }
    return payload;
  } catch (_) {
    throw fail('Linkul audio a expirat sau nu este valid.', 401);
  }
};

module.exports = { createVoiceStreamTicket, verifyVoiceStreamTicket };
