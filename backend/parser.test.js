import { parseHtml } from './parser.js';

describe('parseHtml', () => {
  // Happy path
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
    expect(result.wordCount).toBe(12);
  });

  // Graceful handling of missing HTML tags
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

  // Failure case 1: Empty or null/undefined HTML input
  it('should throw error when html is empty or undefined (failure case 1)', () => {
    expect(() => parseHtml('')).toThrow('No valid HTML string provided');
    expect(() => parseHtml(null)).toThrow('No valid HTML string provided');
    expect(() => parseHtml(undefined)).toThrow('No valid HTML string provided');
  });

  // Failure case 2: Non-string input
  it('should throw error when html is not a string (failure case 2)', () => {
    expect(() => parseHtml(12345)).toThrow('No valid HTML string provided');
    expect(() => parseHtml({ key: 'value' })).toThrow('No valid HTML string provided');
    expect(() => parseHtml(true)).toThrow('No valid HTML string provided');
  });
});

