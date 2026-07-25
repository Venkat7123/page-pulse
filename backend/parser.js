import * as cheerio from 'cheerio';

export function parseHtml(html) {
  if (!html || typeof html !== 'string') {
    throw new Error('No valid HTML string provided');
  }

  const $ = cheerio.load(html);

  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const h1Count = $('h1').length;
  const imagesMissingAlt = $("img").filter((i, img) => {
    const alt = $(img).attr("alt");
    return !alt || alt.trim() === "";
  }).length;
  
  $("script").remove();
  $("style").remove();
  $("noscript").remove();

  const text = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const wordCount =
    text === ""
      ? 0
      : text.split(" ").length;

  return {
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount
  };
}
