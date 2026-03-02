import { PrettyBytesPipe } from './prettybytes.pipe';

describe('PrettyBytes', () => {
  it('create an instance', () => {
    const pipe = new PrettyBytesPipe();
    expect(pipe).toBeTruthy();
  });
});
