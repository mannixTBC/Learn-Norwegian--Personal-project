import ticketModule from '../../backend/voiceStreamTicket.js';
import cartesiaModule from '../../backend/cartesiaSpeech.js';

const { verifyVoiceStreamTicket } = ticketModule;
const { cartesiaSpeechStream } = cartesiaModule;

export default async (request) => {
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
  try {
    const ticket = new URL(request.url).searchParams.get('ticket');
    const payload = verifyVoiceStreamTicket(ticket);
    const upstream = await cartesiaSpeechStream(payload.text, request.signal);
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Audio-Provider': 'cartesia',
      },
    });
  } catch (error) {
    console.warn('cartesia-stream-failure', { kind: error.name, status: error.status || 502, providerStatus: error.providerStatus });
    return new Response(error.status === 401 ? error.message : 'Vocea nu poate fi redată momentan.', {
      status: error.status || 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
};
