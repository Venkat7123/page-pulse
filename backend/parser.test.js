import { parseHtml } from './parser.js';

describe('parseHtml', () => {
  it('should parse valid HTML correctly (happy path)', () => {
    const html = `
      <html>
        <head>
          <title>Test Title</title>
          <meta name="description" content="This is a test description" />
        </head>
        <body>
          <h1>Heading 1</h1>
          <h1>Heading 2</h1>
          <img src="test1.jpg" alt="test" />
          <img src="test2.jpg" />
          <img src="test3.jpg" alt="" />
          <p>This is some test text to count words.</p>
        </body>
      </html>
    `;

    const result = parseHtml(html);

    expect(result.title).toBe('Test Title');
    expect(result.metaDescription).toBe('This is a test description');
    expect(result.h1Count).toBe(2);
    expect(result.imagesMissingAlt).toBe(2);
    // Heading 1 Heading 2 This is some test text to count words. = 12 words
    expect(result.wordCount).toBe(12);
  });

  it('should handle missing elements gracefully', () => {
    const html = `
      <html>
        <body>
          <p>Just some words here</p>
        </body>
      </html>
    `;

    const result = parseHtml(html);

    expect(result.title).toBe('');
    expect(result.metaDescription).toBeNull();
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    expect(result.wordCount).toBe(4);
  });

  it('should throw error on empty HTML', () => {
    expect(() => parseHtml('')).toThrow('No HTML provided');
  });
});
