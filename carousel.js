export default class Carousel {
  /**
   *
   * @param {HTMLElement} root // selecteur de la racine
   * @param {Object} options //  options pour paramettrer le carousel
   */

  constructor(root, options = {}) {
    this.options = Object.assign(
      {},
      {
        visibles: 3,
        scrollable: 1,
        duration: 3,
        buttonsColor: "black",
        buttonsBackground: "white",
        buttonsType: 1,
        loop: false,
        pagination: true,
        autoslide: false,
        delay: 4000,
        isButtonVisble: true,
      },
      options
    );

    /// insertion du la cdn Material+Icons
    let fontawesome_CDN = `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`;
    document.head.insertAdjacentHTML("beforeend", fontawesome_CDN);

    /******* section ************/
    this.currentSlice = 0;
    this.root = root;
    this.panorama = this.create_element_width_class("div", "panorama");
    this.items = [...this.root.children];

    /******* dragging ************/
    this.prevX;
    this.prevScrollLeft;
    this.isDragStart = false;

    /******* section ************/
    this.insert_items();
    this.creatNavigationButton();
    this.goToItem(0);
    this.setResponsive();
    this.setStyle();

    /******* autoslide ************/
    if (this.options.autoslide)
      setInterval(this.move_right.bind(this), this.options.delay * 1000);

    /******* EventsListerners ************/
    this.nex_button.addEventListener("click", this.move_right.bind(this));
    this.prev_button.addEventListener("click", this.move_left.bind(this));
    this.nex_button.addEventListener(
      "mouseenter",
      (e) => (e.target.style.opacity = "1")
    );
    this.nex_button.addEventListener(
      "mouseleave",
      (e) => (e.target.style.opacity = ".8")
    );
    this.prev_button.addEventListener(
      "mouseenter",
      (e) => (e.target.style.opacity = "1")
    );
    this.prev_button.addEventListener(
      "mouseleave",
      (e) => (e.target.style.opacity = ".8")
    );
    // moblie slide
    this.root.addEventListener("touchstart", this.starDrag.bind(this));
    this.root.addEventListener("touchmove", this.drag.bind(this));
    this.root.addEventListener("touchend", this.dragend.bind(this));

    /******* pagintions   ************/
    if (this.options.pagination) {
      this.creattPagiantion();
      this.show_actif_pagination(0);

      this.pagination_tag.forEach((pagination, index) => {
        //slider en utilisant les paginations
        pagination.addEventListener("click", () => {
          // ici on verifie s'il existe d'autre items apres l'item courant
          // si oui on continue le slide si non soit on boucle soit on recomence
          this.currentSlice = index;
          this.goToItem(this.currentSlice);
        });
      });
    }
  }

  //METHODES______________________________________________________

  /******* Insertion des items dans le panorama ************/
  insert_items() {
    for (let item of this.items) {
      this.panorama.appendChild(item);
    }
    this.root.appendChild(this.panorama);
  }

  //********* Navigation *******/
  creattPagiantion() {
    //les styles necessaire pour le div paginationContainer_style
    let paginationContainer_style = {
      display: "flex",
      border: "none",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "7px",
      position: "absolute",
      left: "50%",
      bottom: "5px",
      transform: "translateX(-50%)",
    };

    //les styles necessaire pour les elements paginations
    let pagination_style = {
      borderRadius: "50px",
      width: "8px",
      height: "8px",
      transition: `${this.options.duration / 10}s`,
      background: `${this.options.buttonsBackground}`,
    };

    /******** Création du div paginationContainer **********/
    this.paginationContainer = this.create_element_width_class(
      "div",
      "paginationContainer"
    );

    // on aplique les styles sur le div paginationContainer
    for (let [propreite, value] of Object.entries(paginationContainer_style)) {
      this.paginationContainer.style[propreite] = value;
    }

    /******** Création des elements de pagination **********/
    for (let i = 0; i < this.items.length + 1 - this.options.visibles; i++) {
      this.pagination = this.create_element_width_class("span", "pagination");

      // on aplique les styles sur chaque pagination puis les inserer dans le div paginationContainer
      for (let [propreite, value] of Object.entries(pagination_style)) {
        this.pagination.style[propreite] = value;
        this.paginationContainer.appendChild(this.pagination);
      }
    }
    this.root.appendChild(this.paginationContainer);
  }

  /**
   *  Fontion pour metre en evidance la pagination courante
   * @param {index} item_index
   */

  show_actif_pagination(item_index) {
    this.pagination_tag = document.querySelectorAll(".pagination");

    this.pagination_tag.forEach((pagination, index) => {
      // si l'index de la pagination et celle de l'item courant sont equaux on ajoute une class actif
      // si non on enleve la class
      if (index === item_index) {
        pagination.classList.add("actif");
      } else {
        pagination.classList.remove("actif");
      }

      // on ajoute un style sur la pagination avec la class actif
      pagination.style.background = pagination.classList.contains("actif")
        ? `${this.options.buttonsBackground}`
        : "#0c0c0c88";
    });
  }

  creatNavigationButton() {
    //Style des boutons
    let buttons_style = {
      width: "30px",
      height: "30px",
      display: "flex",
      border: "none",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50px",
      textAlign: "center",
      lineHeight: "40px",
      opacity: ".8",
      transition: ".3s",
      fontSize: "16px",
      background: `${this.options.buttonsBackground}`,
      color: `${this.options.buttonsColor}`,
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    };

    this.nex_button = this.create_element_width_class("button", "nex_button");
    this.prev_button = this.create_element_width_class("button", "prev_button");

    // on aplique les style depuis l'objet buttons_style
    for (let [propreite, value] of Object.entries(buttons_style)) {
      this.nex_button.style[propreite] = value;
      this.prev_button.style[propreite] = value;
    }
    // on stylise les bouton seleon l'option choisit
    if (this.options.buttonsType === 2) {
      this.prev_button.style.borderRadius = "0";
      this.nex_button.style.borderRadius = "0";
      this.nex_button.style.right = "0px";
      this.prev_button.style.left = "0px";

      // on stylise les bouton seleon l'option choisit
    } else if (this.options.buttonsType === 3) {
      this.prev_button.style.height = "50%";
      this.nex_button.style.height = "50%";
      this.prev_button.style.borderRadius = "0";
      this.nex_button.style.borderRadius = "0";
      this.prev_button.style.left = "0px";
      this.prev_button.style.left = "0px";
    } else {
      this.nex_button.style.right = "5px";
      this.prev_button.style.left = "5px";
    }

    // insertion des icons depuis la cdn material-icons
    this.nex_button.innerHTML = '<i class="material-icons">chevron_right</i>';
    this.prev_button.innerHTML = '<i class="material-icons">chevron_left</i>';

    // insertion des boutons
    this.root.appendChild(this.nex_button);
    this.root.appendChild(this.prev_button);
  }

  /************** Mouvement des items **************/
  move_right() {
    if (
      this.currentSlice >=
      this.panorama.children.length - this.options.visibles ||
      // ici on verifie s'il existe d'autre items apres l'item courant
      this.items[this.currentSlice + this.options.visibles] === undefined
    ) {
      this.currentSlice = -this.options.scrollable;
      this.goToItem(this.currentSlice);
    }

    this.currentSlice += this.options.scrollable; // on scroll en fonction de l'option scrolable
    this.goToItem(this.currentSlice);
  }

  move_left() {
    if (this.currentSlice <= 0) {
      this.currentSlice =
        this.items.length + this.options.scrollable - this.options.visibles;
      this.goToItem(this.currentSlice);
    }
    this.currentSlice -= this.options.scrollable; // on scroll en fonction de l'option scrolable
    this.goToItem(this.currentSlice);
  }

  /**
   * @param {index courant} index
   */

  goToItem(index) {
    this.show_actif_pagination(index);
    this.panorama.style.transform = `translateX(${(-this.items[0].offsetWidth - 10) * index
      }px)`;

    // si l'option loop est true on cache les boutons lord du dernier slides
    if (
      this.options.loop &&
      !window.matchMedia("(max-width: 550px)").matches &&
      this.options.isButtonVisble
    ) {
      if (
        index >= this.panorama.children.length - this.options.visibles ||
        // ici on verifie s'il existe d'autre items apres l'item courant
        this.items[index + this.options.visibles] === undefined
      ) {
        this.nex_button.style.display = "none";
      } else {
        this.nex_button.style.display = "flex";
      }
      if (index <= 0) {
        this.prev_button.style.display = "none";
      } else {
        this.prev_button.style.display = "flex";
      }
    }
  }

  /************** methode pour gerer les style **************/
  setStyle() {
    // On recupere la largeur du div container
    let root_width = this.root.offsetWidth;

    //les styles necessaires pour le div container
     this.root.style.width = "calc(100% + 20px)";
    this.root.style.height = root_width / this.options.visibles + "px";
    this.root.style.overflow = "hidden";
    this.root.style.position = "relative";

    //les style style necessaire pour chaque item et son element enfant
    this.items.map((item, index) => {
      item.style.width = root_width / this.options.visibles + 10 + "px";
      item.firstElementChild.style.width = "100%";
      item.firstElementChild.style.height = "100%";
    });

    //les styles necessaire pour le div panorama
    this.panorama.style.width =
      this.items[0].offsetWidth * this.items.length + "px";
    this.panorama.style.height = "100%";
    this.panorama.style.display = "flex";
    this.panorama.style.gap = "10px";
    this.panorama.setAttribute("tabindex", "1");
    this.panorama.style.transition = `${this.options.duration / 10}s`;

    if (!this.options.isButtonVisble) {
      this.nex_button.style.display = "none";
      this.prev_button.style.display = "none";
    }
  }

  /************** section **************/
  /**
   * Methode pour creer un element html avec une class
   * @param {HTMLElement} el
   * @param {classAttribut} el_class
   * @returns {HTMLElement}
   */

  create_element_width_class(el, el_class = "") {
    let div = document.createElement(el);
    div.classList.add(el_class);
    return div;
  }


  /************** Dragging **************/
  starDrag(e) {
    if (e.touches) {
      // si la doigt detecté est est superieur à 1 on return
      if (e.touches.length > 1) {
        return;
      } else {
        e = e.touches[0];
      }
    }
    this.isDragStart = true;
    // on recupère la valeur du  dernier point de touche
    this.prevX = e.pageX;
    // on recupère la valeur du dernier translate
    this.prevTransform = this.panorama.style.transform
      .split("(")[1]
      .split("px")[0];
  }

  drag(e) {
    if (!this.isDragStart) return;
    // si la doigt detecté est est superieur à 1 on return
    if (e.touches) {
      e = e.touches[0];
    } else {
      e.preventDefault();
    }
    // on fait la difference de entre le dernier point de touche et celle effectué en ce moment puis sauvegarder la valeur dans une variable
    this.postDiff = this.prevX - e.pageX;
    // on cree une nouvelle variable puis l'initialiser a la valeur absolue de posDiff
    this.initPosDiff = Math.abs(this.postDiff);
    this.item_width = parseFloat(this.items[0].offsetWidth);
    // si le mouvement du doigt est superieur à 1/2 de l'iteme on cree la condition qui permet d'appeler la fonction moveRight ou mouvLeft
    if (this.initPosDiff > this.item_width / 2) {
      this.ratio = parseFloat(this.item_width / 2) <= this.postDiff;
    }
    this.translate = parseFloat(this.prevTransform) - this.postDiff;
    this.panorama.style.transform = `translateX(${this.translate}px)`;
  }

  dragend() {
    this.isDragStart = false;
    // si le ratio est positive et que le mouvement du doigt est superieur à 1/2 de l'iteme on va vers la droite
    if (this.ratio && this.initPosDiff > this.item_width / 2) {
      // s'il n'existe pas d'autre items apres l'item courant on termine le slide si non continue
      if (
        this.items[this.currentSlice + this.options.visibles] === undefined ||
        this.currentSlice >=
        this.panorama.children.length - this.options.visibles
      ) {
        this.panorama.style.transform = `translateX(${this.prevTransform}px)`;
      } else {
        this.move_right();
        // on initialise la variable initPosDiff à 0 pour poursuivre le slide
        this.initPosDiff = 0;
      }
      //si le ratio est négatif et que le mouvement du doigt est superieur à 1/2 de l'iteme on va vers la gauche
    } else if (!this.ratio && this.initPosDiff > this.item_width / 2) {
      // s'il n'existe pas d'autre items apres l'item courant on termine le slide si non continue
      if (this.currentSlice <= 0) {
        this.panorama.style.transform = `translateX(${this.prevTransform}px)`;
      } else {
        this.move_left();
        this.initPosDiff = 0;
      }
      // si auccunes de ces condition n'est respecté on rest sur place
    } else {
      this.panorama.style.transform = `translateX(${this.prevTransform}px)`;
    }
  }

  /************** Responsive **************/
  setResponsive() {
    if (window.matchMedia("(max-width: 800px)").matches) {
      this.options.visibles = 2;
      this.options.isButtonVisble = false;
    }
   
    if (window.matchMedia("(max-width: 550px)").matches) {
      this.options.visibles = 1;
      this.root.style.width = "calc(100% + 20px)";
      this.nex_button.style.display = "none";
      this.prev_button.style.display = "none";
      this.options.isButtonVisble = false;
    }
  }
}
