export default class Slides {
  constructor() {
    this.inited = false;
    this.ACTIVE_FLAG = 'is-active';

    document.addEventListener('DOMContentLoaded', (event) => {
      this.el = document.querySelector('[data-slides]');
      this.thumbnailsContainer = document.querySelector('[data-slides-thumbnails]');

      // init success depends on elements being found
      if (this.el && this.thumbnailsContainer) {
        this.inited = true;
        this.slides = [...this.el.querySelectorAll('[data-slides-slide]')];
        this.thumbnails = [...this.thumbnailsContainer.querySelectorAll('[data-slides-thumbnail]')];

        if (this.slides.length && this.thumbnails.length) {
          this.initThumbnails();
          return true;
        }
      }

      // something went wrong
      console.warn('Warning: Slides could not be initialized.'); // eslint-disable-line no-console
      return false;
    });
  }

  // Helper method to determine if slides have been inited. Should be called by all public methods.
  isInited() {
    if (!this.inited) {
      console.error('Error: Tried to call slides method prior to initialization.'); // eslint-disable-line no-console
      return false;
    }
    return true;
  }

  initThumbnails() {
    this.thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', (e) => {
        if (this.isInited()) {
          this.show(e.currentTarget.getAttribute('href').replace('#', ''));
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, false);
    });
  }

  // shows an image by a given ID
  show(id) {
    if (this.isInited()) {
      let slide = this.slides.find((el) => el.id === id);
      if (slide) {
        // first, hide all shown images
        this.hideAll();

        // activate image
        slide.classList.add(this.ACTIVE_FLAG);

        // tell thumbnail
        let thumbnail = this.thumbnails.find((el) => el.getAttribute('href') === `#${id}`);
        if (thumbnail) {
          thumbnail.classList.add(this.ACTIVE_FLAG);
        }
      }
    }
  }

  // Hides all images
  hideAll() {
    if (this.isInited()) {
      [...this.slides, ...this.thumbnails].forEach((item) => {
        item.classList.remove(this.ACTIVE_FLAG);
      });
    }
  }
}
