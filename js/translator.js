class Translator {
  constructor(options = {}) {
    this._options = Object.assign({}, this.defaultConfig, options);
    this._lang = this.getLanguage();
    this._elements = document.querySelectorAll("[data-i18n]");
  }

  getLanguage() {
    if (!this._options.detectLanguage) {
      return this._options.defaultLanguage;
    }

    var stored = sessionStorage.getItem("language");

    if (this._options.persist && stored) {
      return stored;
    }

    var lang = navigator.languages ? navigator.languages[0] : navigator.language;

    return lang.substring(0, 2);
  }

  load(lang = null) {
    if (lang) {
      if (!this._options.languages.includes(lang)) {
        return;
      }

      this._lang = lang;
    }

    var path = `${this._options.filesLocation}/${this._lang}.json`;

    fetch(path)
      .then((res) => {
        return res.json();
      })
      .then((translation) => {
        this.translate(translation);
        this.toggleLangTag();

        if (this._options.persist) {
          sessionStorage.setItem("language", this._lang);
        }
      })
      .catch((err) => {
        console.error(`Could not load ${path}`, err);
      });
  }

  toggleLangTag() {
    if (document.documentElement.lang !== this._lang) {
      document.documentElement.lang = this._lang;
    }
  }

  translate(translation) {
    function replace(element) {
      var text = element.dataset.i18n.split(".").reduce((obj, i) => obj[i], translation);

      if (text) {
        element.innerHTML = text;
      }
      if (element.tagName === "INPUT") {
        element.placeholder = text;
      }
    }

    this._elements.forEach(replace);
  }

  get defaultConfig() {
    return {
      persist: false,
      languages: ["en"],
      defaultLanguage: "en",
      filesLocation: "/i18n",
    };
  }
}

export default Translator;
