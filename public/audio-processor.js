class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024; // Reduced buffer size for more frequent sends
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];

      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;

        if (this.bufferIndex >= this.bufferSize) {
          // Send smaller chunks more frequently
          const bufferCopy = new Float32Array(this.buffer);
          this.port.postMessage(bufferCopy.buffer);
          this.bufferIndex = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
