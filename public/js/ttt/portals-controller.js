/**
 * Predecessor Controller
 * Controlling all the portal related features
 */
class PortalsController {

    /**
     * Display mode options
     */
    RESET = 'RESET';
    EMBED = 'EMBED';
    ACTIVATE = 'ACTIVATE';
    PREDECESSOR_ACTIVATE = 'PREDECESSOR_ACTIVATE';

    /**
     * Initiating controller
     */
    constructor() {
        // All the UI references
        this.main = document.querySelector('#main');
        this.header = document.querySelector('#header');
        this.detail = document.querySelector('#detail');
        this.follow = document.querySelector('#follow');
        this.recommendation = document.querySelector('#recommendation');
        this.lightbox = document.querySelector('#lightbox');
        this.embed = document.querySelector('#embed');
        this.heroImg = document.querySelector('#hero-img');
        this.audioController = document.querySelector('audio-controller');

        // Add event listeners
        this._hookEvents();
    }

    /**
     * Controll all the UI/animations with given display mode
     * @param {String} mode 
     * @param {Object} option 
     */
    setDisplayMode(mode, option) {
        switch (mode) {
            case this.RESET:
                this.header.style.display = 'block';
                this.header.style.opacity = 1;
                this.detail.style.display = 'block';
                this.detail.style.opacity = 1;
                this.follow.style.display = 'none';
                this.follow.style.opacity = 1;
                this.recommendation.style.display = 'block';
                this.recommendation.style.opacity = 1;
                this.main.style.transition = ''
                this.main.style.width = '100%';
                this.main.style.marginTop = '0px';
                this.main.style.boxShadow = 'none';
                this.main.style.borderRadius = 'none';
                this.main.style.backgroundColor = '#FFF';
                this.lightbox.style.display = 'none';
                this.lightbox.style.opacity = 0;
                this.heroImg.style.transition = ''
                this.heroImg.style.top = '0px';
                // clear any exisiting portal element on reset
                const predecessorPortal = this.embed.querySelector('portal');
                if (predecessorPortal) {
                    this.embed.removeChild(predecessorPortal);
                }
                break;
            case this.EMBED:
                // Hide unnecessary elements when being embedded
                this.header.style.display = 'none';
                this.detail.style.display = 'none';
                this.follow.style.display = 'none';
                this.recommendation.style.display = 'none';
                break;
            case this.ACTIVATE:
                const { followed, name, photoSrc, activatedWidth, predecessor } = option;

                // Show all the elements
                this.header.classList.add('animateOpacityTo_1_0');
                this.header.style.display = 'block';;
                this.detail.style.display = 'block';
                this.detail.classList.add('animateOpacityTo_1_0');
                this.recommendation.style.display = 'block';
                this.recommendation.classList.add('animateOpacityTo_1_0');

                // Add writer-follow custom element if the writer was not followed already
                if (!followed) {
                    const existingWriterFollow = follow.querySelector('writer-follow');
                    if (existingWriterFollow) {
                        this.follow.removeChild(existingWriterFollow);
                    }
                    const writerFollow = document.createElement('writer-follow');
                    writerFollow.setAttribute('writer-name', name);
                    writerFollow.setAttribute('writer-photo-src', photoSrc);
                    this.follow.appendChild(writerFollow);
                    this.follow.style.display = 'block';
                    this.follow.classList.add('animateOpacityTo_1_0');
                } else {
                    this.follow.style.display = 'none';
                }

                // Change the theme to lightbox style having the predecessor in the back
                this.main.style.width = `${activatedWidth}px`;
                this.main.style.marginTop = '50px';
                this.main.style.boxShadow = '0 -3px 5px rgba(0,0,0,0.19)';
                this.main.style.borderRadius = '5px 5px 0px 0px';
                this.lightbox.style.display = 'block';
                this.lightbox.style.opacity = 0.6;
                this.lightbox.classList.add('animateOpacityTo_0_6')
                this.embed.appendChild(predecessor);
                break;
            case this.PREDECESSOR_ACTIVATE:
                const { initialY, initialWidth } = option;
                this.main.style.boxShadow = 'none';
                this.main.style.backgroundColor = 'transparent';
                this.header.style.opacity = 0;
                this.detail.style.opacity = 0;
                this.follow.style.opacity = 0;
                this.recommendation.style.opacity = 0;
                // animate
                this.heroImg.style.transition = 'top 0.6s'
                this.heroImg.style.top = (initialY - 170) + 'px';
                this.main.style.transition = 'width 0.3s'
                this.main.style.width = `${initialWidth}px`;
                break;
            default:
        }
    }

    /**
     * Adding event listeners
     */
    _hookEvents() {
        let initialY = 0;
        let initialWidth = 0;

        // Display Mode: ACTIVATE on portalactivate
        window.addEventListener('portalactivate', evt => {
            initialY = evt.data.initialY;
            initialWidth = evt.data.initialWidth;
            const option = {
                followed: evt.data.followed,
                name: evt.data.name,
                photoSrc: evt.data.photoSrc,
                activatedWidth: evt.data.activatedWidth,
                predecessor: evt.adoptPredecessor()
            }

            this.setDisplayMode(this.ACTIVATE, option);
        })

        // Display Mode: PREDECESSOR_ACTIVATE on lighbox on-click
        this.lightbox.addEventListener('click', evt => {
            const option = {
                initialY: initialY,
                initialWidth: initialWidth
            }
            this.setDisplayMode(this.PREDECESSOR_ACTIVATE, option);
        })

        // Display Mode: RESET && EMEBED on predecessor activate
        this.heroImg.addEventListener('transitionend', evt => {
            if (evt.propertyName === 'top') {
                const predecessor = document.querySelector('portal');
                predecessor.activate().then(_ => {
                    console.log('kitayo')
                    this.setDisplayMode(this.RESET);
                    console.log('kitayo')
                    this.setDisplayMode(this.EMBED);
                    console.log('kitayo')
                });
            }
        })

        // Controlling the audio on message
        window.portalHost.addEventListener('message', evt => {
            switch (evt.data.control) {
                case 'prev': this.audioController.prev(); break;
                case 'play': this.audioController.play(); break;
                case 'pause': this.audioController.pause(); break;
                case 'next': this.audioController.next(); break;
            }
        })

    }

}

// Initiate the controller when being embedded as a portal
if(window.portalHost){
    const portalsController = new PortalsController();
    portalsController.setDisplayMode(portalsController.EMBED);
} else if (window.self !== window.top) {
    document.querySelector('#header').style.display = 'none';
    document.querySelector('#detail').style.display = 'none';
    document.querySelector('#follow').style.display = 'none';
    document.querySelector('#recommendation').style.display = 'none';
} else {
    // do nothing. let it be.
}




