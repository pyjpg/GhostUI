export function scrapePage() {
  const title = document.title;
  const bodyText = document.body?.innerText || "";
  const links = Array.from(document.querySelectorAll("a"))
    .map((a) => a.href)
    .filter((href) => href.startsWith("http"));

  return {
    title,
    bodyText: bodyText.slice(0, 2000),
    links: links.slice(0, 10),
    url: window.location.href,
    timestamp: Date.now(),
  };
}
