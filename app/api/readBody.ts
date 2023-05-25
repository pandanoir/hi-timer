export const readBody = (req: Request) =>
  new Promise<string>((resolve) => {
    let text = '';
    const decoder = new TextDecoder();
    const reader = req.body?.getReader();

    reader?.read().then(function readChunk({ done, value }) {
      if (done) {
        resolve(text);
        return;
      }

      text += decoder.decode(value);
      reader?.read().then(readChunk);
    });
  });
