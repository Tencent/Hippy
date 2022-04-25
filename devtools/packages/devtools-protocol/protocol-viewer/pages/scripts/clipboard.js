// Single-clicking on the permalink hash copies the URL to the clipboard
// Double-clicking on the permalink hash will copy markdown
//     [`Domain.method`](https://...)
for (const permalinkEl of document.querySelectorAll('.permalink')) {
  const { href } = permalinkEl;
  const textSlug = permalinkEl.dataset.slug;
  const markdown = `[\`${textSlug}\`](${href})`;

  permalinkEl.addEventListener('click', handleClicks);
  permalinkEl.addEventListener('dblclick', handleClicks);

  function handleClicks(e) {
    // No need to scroll
    e.preventDefault();
    // Add hash back to url
    history.pushState({}, '', href);

    navigator.clipboard
      .writeText(e.type === 'dblclick' ? markdown : href)
      .then((_) => {
        const classNames = ['copied'];
        if (e.type === 'dblclick') {
          classNames.push('copied__md');
        }
        // Show psuedo-element. rAF used to trigger animation reliably
        permalinkEl.className = 'permalink';
        requestAnimationFrame((_) => {
          requestAnimationFrame((_) => {
            permalinkEl.classList.add(...classNames);
          });
        });
      })
      // This can happen if the user denies clipboard permissions
      .catch((err) => console.error('Could not copy to clipboard: ', err));
  }
}
