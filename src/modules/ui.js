// Draws the editor UI and canvas inside the given div

const symbolLatexMap = {
    // Lowercase greek letters
    alpha: '\\alpha',
    beta: '\\beta',
    gamma: '\\gamma',
    delta: '\\delta',
    varepsilon: '\\varepsilon',
    epsilon: '\\epsilon',
    zeta: '\\zeta',
    eta: '\\eta',
    theta: '\\theta',
    iota: '\\iota',
    kappa: '\\kappa',
    lambda: '\\lambda',
    mu: '\\mu',
    nu: '\\nu',
    xi: '\\xi',
    omicron: '\\omicron',
    pi: '\\pi',
    rho: '\\rho',
    sigma: '\\sigma',
    tau: '\\tau',
    upsilon: '\\upsilon',
    phi: '\\phi',
    chi: '\\chi',
    psi: '\\psi',
    omega: '\\omega',
    varphi: '\\varphi',
    varsigma: '\\varsigma',
    varpi: '\\varpi',
    vartheta: '\\vartheta',

    // Uppercase greek letters
    Alpha: 'A',
    Beta: 'B',
    Gamma: '\\Gamma',
    Delta: '\\Delta',
    Epsilon: 'E',
    Zeta: 'Z',
    Eta: 'H',
    Theta: '\\Theta',
    Iota: 'I',
    Kappa: 'K',
    Lambda: '\\Lambda',
    Mu: 'M',
    Nu: 'N',
    Xi: '\\Xi',
    Omicron: 'O',
    Pi: '\\Pi',
    Rho: 'P',
    Sigma: '\\Sigma',
    Tau: 'T',
    Upsilon: '\\Upsilon',
    Phi: '\\Phi',
    Chi: 'X',
    Psi: '\\Psi',
    Omega: '\\Omega',

    // Operators and symbols
    times: '\\times',
    div: '\\div',
    setminus: '\\setminus',
    centerdot: '\\cdot',
    centerdots: '\\cdots',
    blacksquare: '\\blacksquare',
    oplus: '\\oplus',
    ominus: '\\ominus',
    otimes: '\\otimes',
    odot: '\\odot',
    forall: '\\forall',
    equiv: '\\equiv',
    sim:'\\sim',
    sime: '\\simeq',
    cong: '\\cong',
    plusmn: '\\pm',
    mnplus: '\\mp',
    starf: '\\star',
    bigcup: '\\bigcup',
    bigcap: '\\bigcap',
    cup: '\\cup',
    cap: '\\cap',
    lt: '\\lt',
    gt: '\\gt',
    leq: '\\leq',
    GreaterEqual: '\\geq',
    equals: '=',
    approx: '\\approx',
    NotEqual: '\\neq',
    sub: '\\subset',
    sup: '\\supset',
    sube: '\\subseteq',
    supe: '\\supseteq',
    nsub: '\\not\\subset',
    nsup: '\\not\\supset',
    nsube: '\\not\\subseteq',
    nsupe: '\\not\\supseteq',
    propto: '\\propto',
    parallel: '\\parallel',
    npar: '\\nparallel',
    asympeq: '\\asymp',
    ast: '\\ast',
    isin: '\\in',
    ni: '\\ni',
    notin: '\\notin',
    exist: '\\exists',
    nexist: '\\nexists',
    perp: '\\perp',
    angle: '\\angle',
    angmsd: '\\measuredangle',
    Leftarrow: '\\Leftarrow',
    Rightarrow: '\\Rightarrow',
    Leftrightarrow: '\\Leftrightarrow',
    rightarrow: '\\to',
    leftarrow: '\\gets',
    leftrightarrow: '\\leftrightarrow',
    leftrightarrows: '\\leftrightarrows',
    rightleftarrows: '\\rightleftarrows',
    leftleftarrows: '\\leftleftarrows',
    rightrightarrows: '\\rightrightarrows',
    longrightarrow: '\\longrightarrow',
    Longrightarrow: '\\Longrightarrow',
    longleftarrow: '\\longleftarrow',
    Longleftarrow: '\\Longleftarrow',
    longleftrightarrow: '\\longleftrightarrow',
    Longleftrightarrow: '\\Longleftrightarrow',
    uparrow: '\\uparrow',
    downarrow: '\\downarrow',
    Uparrow: '\\Uparrow',
    Downarrow: '\\Downarrow',
    updownarrow: '\\updownarrow',
    Updownarrow: '\\Updownarrow',
    upuparrows: '\\upuparrows',
    downdownarrows: '\\downdownarrows',
    leftharpoonup: '\\leftharpoonup',
    rightharpoonup: '\\rightharpoonup',
    leftharpoondown: '\\leftharpoondown',
    rightharpoondown: '\\rightharpoondown',
    leftrightharpoons: '\\leftrightharpoons',
    rightleftharpoons: '\\rightleftharpoons',
    PartialD: '\\partial',
    eth: '\\eth',
    hbar: '\\hbar',
    hslash: '\\hslash',
    real: '\\Re',
    nabla: '\\nabla',
    infin: '\\infty',
    leqslant: '\\leqslant',
    geqslant: '\\geqslant',
    langle: '\\langle',
    rangle: '\\rangle',
    there4: '\\therefore',
    since: '\\because',
    sin: '\\sin',
    cos: '\\cos',
    tan: '\\tan',
    cot: '\\cot',
    sec: '\\sec',
    csc: '\\text{cosec}',
    space: '\\:',

};

const functionComponentMap = {
    lim: Limit,
    sqrt: Sqrt,
    nsqrt: NthRoot,
    sub: Subscript,
    subleft: SubscriptLeft,
    sup: Superscript,
    supleft: SuperscriptLeft,
    subsup: SubSupRight,
    subsupleft: SubSupLeft,
    degree: Degree,
    bracketr: BracketR,
    bracketrl: BracketRL,
    bracketrr: BracketRR,
    brackets: BracketS,
    bracketsl: BracketSL,
    bracketsr: BracketSR,
    bracketc: BracketC,
    bracketcl: BracketCL,
    bracketcr: BracketCR,
    bracketa: BracketA,
    bracketal: BracketAL,
    bracketar: BracketAR,
    bracketv: BracketV,
    bracketvl: BracketVL,
    bracketvr: BracketVR,
    bracketp: BracketP,
    pipe:Pipe,
    'overset-overbrace':OversetOverbrace,
    'underset-underbrace':UndersetUnderbrace,
    'over-leftrightarrow':OversetLeftRightArrow,
    'under-rightarrow':UnderRightArrow,
    'under-leftarrow':UnderLeftArrow,
    'under-leftrightarrow':UndersetLeftRightArrow,
    xrightarrow: XRightArrow,
    xleftarrow: XLeftArrow,
    xleftrightarrow: XLeftRightArrow,
    harpoons: Harpoons,
    'over-harpoons': OverHarpoons,
    'under-harpoons': UnderHarpoons,
    larray: LArray,
    divide: Divide,
    'over-under': OverUnder,
    rfloor: RFloor
};

class MJXGUI {
    constructor(
        elementSelector,
        successCallback = function (latex, instance) {},
        options = {},
    ) {
        this.selector = elementSelector;
        this.elements = document.querySelectorAll(elementSelector);
        this.options = options;
        this.mathDelimiter = this.options.mathDelimiter || '$$';
        this.successCallback = successCallback;
        this.eqnHistory = [];
        this.expression = new Expression();
        this.isMobileDevice = 'ontouchstart' in document.documentElement;
        this.pseudoMobileKeyboard = null;
        this.showUI = () => {
            // Show the editor window
            this.editorWindow.style.display = 'block';
            this.editorWindow.dataset.visible = 'true';
        };
        this.hideUI = () => {
            // Hide the editor window
            this.editorWindow.removeAttribute('style');
            this.editorWindow.dataset.visible = 'false';
        };

        if (
            this.elements instanceof String ||
            typeof this.elements === 'string'
        ) {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.cursor = new Cursor(this.expression, this.eqnDisplay);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });
        var lastKey;
        document.addEventListener('keydown', evt => {
            if (this.editorWindow.dataset.visible === 'false') return;
            MathJax.typesetClear([this.eqnDisplay]);
            this.cursor.keyPress(evt, lastKey);
            if(!evt.shiftKey) {
                lastKey = evt.key;
            }
            // if(evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight' ) {
            //     this.eqnDisplay.innerHTML =
            //         this.mathDelimiter +
            //         this.cursor.toDisplayLatex() +
            //         this.mathDelimiter;
            //     MathJax.typesetPromise([this.eqnDisplay]).then(() => {});
            // }
        });

        const symbols = this.editorWindow.querySelectorAll(
            '.mjxgui-operator, .mjxgui-greek-letter',
        );
        const functions =
            this.editorWindow.querySelectorAll('.mjxgui-function');

        symbols.forEach(symbol => {
            symbol.addEventListener('click', () => {
                if (symbol.dataset.latexData in symbolLatexMap) {
                    let _ = new MJXGUISymbol(
                        this.cursor.block,
                        symbolLatexMap[symbol.dataset.latexData],
                    );
                    this.cursor.addComponent(_);
                    this.cursor.updateDisplay();
                }
            });
        });

        functions.forEach(func => {
            func.addEventListener('click', () => {
                let _;
                if (func.dataset.templateType !== 'null') {
                    if (func.dataset.templateType === 'three') {
                        _ = new TemplateThreeBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'two') {
                        _ = new TemplateTwoBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'twoc') {
                        _ = new TemplateTwoBlockContinuousComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'one') {
                        _ = new TemplateOneBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    }else if (func.dataset.templateType === 'under') {
                        _ = new TemplateUndersetComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    }else if (func.dataset.templateType === 'over-under') {
                        _ = new TemplateOversetUndersetComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'trigonometric') {
                        _ = new TrigonometricTwoBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    } else if (func.dataset.templateType === 'matrix') {
                        _ = new MatrixComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                        );
                    }
                } else {
                    _ = new functionComponentMap[func.dataset.functionId](
                        this.cursor.block,
                    );
                }
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });
    }

    // Inject the editor HTML into the DOM
    constructUI() {
        // Injects the UI HTML into the DOM and binds the needed event listeners
        const editorDiv = document.createElement('div');
        editorDiv.classList.add('_mjxgui_editor_window');
        editorDiv.dataset.visible = 'false';
        // do not change this 'editorDiv.innerHTML = ' as it is used in grunt task
        editorDiv.innerHTML = `{{ editor_html }}`;
        if (this.options.theme?.toLowerCase().trim() === 'dark') {
            editorDiv.classList.add('_mjxgui_dark_theme');
        }

        this.editorWindow = editorDiv;
        this.eqnDisplay = editorDiv.querySelector('._mjxgui_editor_display');
        this.eqnDisplay.innerHTML = `${this.mathDelimiter} | ${this.mathDelimiter}`;

        this.pseudoMobileKeyboard = editorDiv.querySelector(
            '.mjxgui-pseudo-mobile-keyboard',
        );
        const mjxguiTabButtons = editorDiv.querySelectorAll(
            '.mjxgui_tab_container',
        );
        const mjxguiTabs = editorDiv.querySelectorAll('.mjxgui_tab');

        const leftArrowButton = editorDiv.querySelector('.leftArrowButton');
        const rightArrowButton = editorDiv.querySelector('.rightArrowButton');

        leftArrowButton.addEventListener('click', () => {
            this.cursor.seekLeft();
            this.cursor.updateDisplay();
        });

        rightArrowButton.addEventListener('click', () => {
            this.cursor.seekRight();
            this.cursor.updateDisplay();
        });

        mjxguiTabButtons.forEach(btn => {
            btn.addEventListener('mouseover', function () {
                mjxguiTabs.forEach(tab => {
                    if (tab.dataset.tab === btn.dataset.tab) {
                        tab.style.display = 'flex';
                    } else {
                        tab.removeAttribute('style');
                    }
                });
            });
        });
        mjxguiTabButtons[0].classList.add('_mjxgui_active_tab');
        mjxguiTabButtons.forEach(btn => {
            btn.addEventListener('mouseover', () => {
                mjxguiTabButtons.forEach(tabBtn => {
                    tabBtn.classList.remove('_mjxgui_active_tab');
                });
                btn.classList.add('_mjxgui_active_tab');
            });
        });

        const closeEditor = editorDiv.querySelector('.mjxgui_close_button_svg');
        closeEditor.addEventListener('click', this.hideUI);

        const clearEquationButton = editorDiv.querySelector(
            '._mjxgui_clear_equation',
        );
        clearEquationButton.addEventListener('click', () => {
            this.clearEquation();
        });

        const saveEquationButton = editorDiv.querySelector(
            '._mjxgui_save_equation',
        );
        saveEquationButton.addEventListener('click', () => {
            this.successCallback(this.getLatex(), this);
            this.hideUI();
            this.clearEquation();
        });

        document.body.appendChild(editorDiv);
    }

    // Remove the current expression from the display, add it to the history, create a new expression and reset
    // all cursor properties to defaults.
    clearEquation() {
        // push this entire expression onto the eqnHistory array so the user can access it again
        this.eqnHistory.push(this.expression);
        this.expression = new Expression();
        this.cursor.expression = this.expression;
        this.cursor.block = null;
        this.cursor.component = null;
        this.cursor.child = -0.5;
        this.cursor.position = -0.5;
        this.cursor.latex = '';
        this.cursor.updateDisplay();
    }

    // Getter method that just returns the cursor's LaTeX.
    getLatex() {
        return this.cursor.toLatex();
    }

    /**
     * Removes all MJXGUI click listeners for the current selector,
     * selects DOM elements again, and rebinds MJXGUI click listeners. Meant
     * to be called if the DOM changes after the MJXGUI instance is created.
     */
    rebindListeners() {
        this.elements.forEach(el => {
            el.removeEventListener('click', this.showUI);
        });
        this.elements = document.querySelectorAll(this.selector);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });
    }

    /**
     * Adds a function to the UI that is not supported out of the box.
     @param componentClass A class that inherits from one of MJXGUI's many component classes
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerFunction(
        componentClass,
        buttonContent,
        title = '',
        typeset = false,
    ) {
        const el = document.createElement('span');
        el.classList.add('mjxgui-btn', 'mjxgui-function');
        el.title = title;
        el.dataset.templateType = 'user-defined';
        el.dataset.functionId = 'user-defined';
        el.innerHTML = buttonContent;
        this.editorWindow
            .querySelector('._mjxgui_functions_tab')
            .appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            this.cursor.addComponent(new componentClass());
            this.cursor.updateDisplay();
        });
    }

    /**
     * Adds a symbol to the UI that is not supported out of the box.
     @param latexData LaTeX code for the symbol
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerSymbol(latexData, buttonContent, title = '', typeset = false) {
        const el = document.createElement('span');
        el.classList.add('mjxgui-btn', 'mjxgui-symbol');
        el.title = title;
        el.dataset.latexData = latexData;
        el.innerHTML = buttonContent;
        this.editorWindow.querySelector('._mjxgui_symbols_tab').appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            let _ = new MJXGUISymbol(this.cursor.block, latexData);
            this.cursor.addComponent(_);
            this.cursor.updateDisplay();
        });
    }

    /**
     * Transforms an <input> element into a button that allows users to enter an equation using MJXGUI.
     * Stores the resulting LaTeX of the equation as the value of the input.
     * @param selector A CSS selector that identifies the input(s) to be converted
     * @param options An object of options for configuring the MJXGUI widget
     */
    static createEquationInput(selector, options = {}) {
        const inputs = document.querySelectorAll(selector);
        // do not change this 'const formInputHTML = ' as it is used in grunt task
        const formInputHTML =  ` {{ form_input_html }}`;
        for (let i = 0; i < inputs.length; i++) {
            let inp = inputs[i];
            inp.style.display = 'none';
            inp.value = '';

            const newEl = document.createElement('div');
            newEl.classList.add('_mjxgui_equation_input_wrapper');
            newEl.innerHTML = formInputHTML;
            inp.insertAdjacentElement('afterend', newEl);

            const inputEl = newEl.querySelector('._mjxgui_equation_input');
            const inpButton = newEl.querySelector(
                '._mjxgui_insert_equation_button',
            );
            const eqnDisplay = newEl.querySelector(
                '._mjxgui_equation_input_preview',
            );
            inpButton.id = `_mjxgui_insert_equation_button_${i}`;

            const widget = new MJXGUI(
                `#_mjxgui_insert_equation_button_${i}`,
                function () {},
                options,
            );
            widget.successCallback = function (latex, instance) {
                if (latex.length > 0) {
                    // Set input value and show equation preview
                    inp.value = latex;
                    MathJax.typesetClear([eqnDisplay]);
                    eqnDisplay.innerHTML = `$ ${latex} $`;
                    MathJax.typesetPromise([eqnDisplay]).then(() => {});

                    inpButton.textContent = 'Edit';
                } else {
                    inp.value = '';
                    MathJax.typesetClear([eqnDisplay]);
                    eqnDisplay.innerHTML = '';
                    inpButton.textContent = 'Add Equation';
                }

                if (inp.validity.valid) {
                    inputEl.classList.remove('_mjxgui_equation_input_invalid');
                    inputEl.classList.add('_mjxgui_equation_input_valid');
                } else {
                    inputEl.classList.add('_mjxgui_equation_input_invalid');
                    inputEl.classList.remove('_mjxgui_equation_input_valid');
                }
            };
        }
    }
}