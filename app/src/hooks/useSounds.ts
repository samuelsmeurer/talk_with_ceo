const receivedAudio = new Audio('/assets/msg-received.mp3');
const sentAudio = new Audio('/assets/msg-sent.mp3');

receivedAudio.volume = 0.3;
sentAudio.volume = 0.3;

export function playReceived() {
  receivedAudio.currentTime = 0;
  receivedAudio.play().catch(() => {});
}

export function playSent() {
  sentAudio.currentTime = 0;
  sentAudio.play().catch(() => {});
}
