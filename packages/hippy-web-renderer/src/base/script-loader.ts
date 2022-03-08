export function scriptLoader(scripts: string[]) {

  return new Promise<void>((resolve, reject) => {
    let count = scripts.length;

    function urlCallback(url) {
      return function () {
        // console.log(url + ' was loaded (' + --count + ' more scripts remaining).');
        count = count - 1;
        if (count < 1) {
          resolve();
        }
      };
    }

    function loadScript(url) {
      const s = document.createElement('script');
      s.setAttribute('src', url);
      s.onload = urlCallback(url);
      document.body.appendChild(s);
    }

    for (let script of scripts) {
      loadScript(script);
    }
  });
};
