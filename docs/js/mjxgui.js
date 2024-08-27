// Builds the expression/equation being typed in by the user
// Exposes its API for the cursor module to use

/**
 * @class
 * Thin wrapper around the Component class that collects all the components together in an Expression
 * that can be easily rendered and converted to LaTeX.
**/
class Expression {
    constructor(nestingDepth = 0) {
        this.components = [];
        this.nestingDepth = nestingDepth;
    }

    add(component, position = this.components.length) {
        // Insert component at position in this Expression.
        // Defaults to adding the component to the end of Expression
        this.components.splice(position, 0, component);
    }

    remove(position = this.components.length-1) {
        // Remove the component at position in this Expression.
        // Defaults to removing the last component in this Expression
        this.components.splice(position, 1);
    }

    toLatex() {
        // Generate LaTeX code from the components in this Expression
        let latex = '';
        for (let c of this.components) {
            latex += c.toLatex() + '';
        }
        return latex.trim();
    }
}

/**
 * @class
 * Represents a block. A fundamental unit of the Expression.
 *
 * All data is ultimately stored in
 * a Block. A Component or any child class of Component has a fixed number of Blocks in it, and a Block can
 * have a variable number of 'children'. An element in a Block's children array can either be a string
 * or another Component, allowing for nesting of Components.
 */
class Block {
    constructor(parent) {
        /**
         * @param parent: The component to which this block belongs
         */
        this.children = [];
        this.parent = parent;
    }

    toLatex() {
        // Generate LaTeX code from the contents of this block.
        // A block's children can contain either strings or an arbitrary child class of Component.
        if (this.children.length === 0) {
            return  `\\color{${this.parent.color}}{\\boxed{&#8200;}}`;
        }
        let latex = '';
        for (let c of this.children) {
            if (typeof c === 'string') {
                latex += c;
            }
            else {
                latex += c.toLatex() + '';
            }
        }
        return latex.trim();
    }

    addChild(component, position = this.children.length) {
        // Setter method to add some component to this block at position. Component can be any child class of Component.
        // Defaults to adding the component at the end.
        this.children.splice(position, 0, component);
    }

    removeChild(position = this.children.length-1) {
        // Remove some component from this block.
        // Defaults to removing the last component.
        this.children.splice(position, 1);
    }
}

/**
 * @class
 * Base class representing a Component of the equation. Inherited by the TextComponent, all *Symbol,
 * and all *Function classes. All child classes of Component override the toLatex method
 * to customize the LaTeX generated. You can define your own child classes to add support for
 * LaTeX syntax not yet supported.
 */
class Component {
    constructor(blocks = [], parent = null) {
        /**
         * @param blocks: The blocks contained by the component
         * @param parent: The block the component is inside (if any), null if no parent
         * @param color: Color of the block to identify parts of component
         */
        this.blocks = blocks;
        this.parent = parent;
        this.color = null; //only needed by multi block components
    }

    toLatex() {
        return '';
    }

    addBlock(block, position) {
        this.blocks.splice(position, 0, block);
    }

    removeBlock(position) {
        this.blocks.splice(position, 1);
    }

    isEmpty() {
        // Returns true if the blocks in the component are empty
        for (let block of this.blocks) {
            if (block.children.length) return false;
        }
        return true;
    }
}


/**
 * @class
 * A component with one block
 */
 class OneBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
        if(!(this instanceof FrameBox)) {
            this.color = Colors.getNew();
        }
    }
}


/**
 * @class
 * A component with two blocks
 */
class TwoBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        super([b1, b2], parent);
        b1.parent = this;
        b2.parent = this;
        this.color = Colors.getNew();
    }
}

/**
 * @class
 * A component with Matrix
 */
class MatrixComponent extends Component {

    constructor(parent, latexData) {
        let rc = latexData.split("x");
        let rows = parseInt(rc[0]);
        let cols = parseInt(rc[1]);
        let blocks = [];
        for(let i = 0; i< rows*cols; i++) {
            blocks[i] = new Block();
        }
        super(blocks, parent);
        this.rows = rows;
        this.cols = cols;
        for(let i = 0; i< rows*cols; i++) {
            blocks[i].parent = this;
        }

        this.color = Colors.getNew();
    }

    toLatex() {
        let output = `\\begin{matrix}`;
        for (let i=0;i<this.rows;i++){
            for (let j=0;j<this.cols;j++) {

                output += `${this.blocks[(i*this.cols)+j].toLatex()}`;

                if (j === this.cols - 1) {
                    if (i !== this.rows - 1 ) {
                        output += " \\\\ ";
                    }
                } else {
                    output += " & ";
                }
            }

        }
        output += `\\end{matrix}`;
        return output;
    }
}


/**
 * @class
 * A component with three blocks. We could further subclass ThreeBlockComponent to define a class that
 * takes in some LaTeX data, since that is mostly the only thing that varies between functions, and that would
 * make this file much DRYer
 */
class ThreeBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        let b3 = new Block();
        super([b1, b2, b3], parent);
        b1.parent = this;
        b2.parent = this;
        b3.parent = this;
        this.color = Colors.getNew();
    }
}


/**
 * @class
 * A template three block component that contains three blocks and uses the same LaTeX template.
 * Only the LaTeX command changes, but the template remains the same for every three block component.
 * We don't define a two block template component because the LaTeX generation for two block components
 * differs significantly from component to component.
 */
class TemplateThreeBlockComponent extends ThreeBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}_{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}`;
    }
}

class TemplateOneBlockComponent extends OneBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}{${this.blocks[0].toLatex()}}`;
    }
}

class TemplateTwoBlockComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}
class TemplateTwoBlockContinuousComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * A template two block component for trigonometric functions, which all use the same LaTeX template.
 * Every trigonometric component will, by default, have an empty block as a superscript. MathJax removes the
 * empty block while rendering, so users will be able to raise the function to any power without us having to
 * define a separate template component to support exponents for trigonometric components.
 */
class TrigonometricTwoBlockComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${this.latexData}^{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

class TemplateUndersetComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\displaystyle\\${this.latexData}\\underset{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

class TemplateOversetUndersetComponent extends ThreeBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\displaystyle\\${this.latexData}\\overset{${this.blocks[0].toLatex()}}{\\underset{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}}`;
    }
}


/**
 * @class
 * A component with only text and no symbol, function of other LaTeX data. Safe to assume that
 * it only has one block with a string inside. Equivalent to a single block.
 */
class TextComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }

    toLatex() {
        return this.blocks[0].toLatex();
    }
}



/**
 * @class
 * A symbol which is just some latex with no arguments to be inserted into the expression.
 */
// TODO - Add support for the backslash character as a symbol
class MJXGUISymbol extends Component {
    constructor(parent, latexData) {
        super([], parent);
        this.latexData = latexData;
    }

    toLatex() {
        return this.latexData;
    }
}


/**
 * @class
 * A framebox
 */
class FrameBox extends OneBlockComponent {
    toLatex() {
        return `\\boxed{${this.blocks[0].toLatex()}}`;
    }
}


/**
 * @class
 * The limit function
 */
class Limit extends TwoBlockComponent {
    toLatex() {
        return `\\lim_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Subscript
 */
class Subscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}`;
    }
}
class SubscriptLeft extends TwoBlockComponent {
    toLatex() {
        return `_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Superscript
 */

class Superscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}`;
    }
}
class SuperscriptLeft extends TwoBlockComponent {
    toLatex() {
        return `^{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}


/**
 * @class
 * Some text with both a subscript as well as a superscript on the left side
 */
class SubSupRight extends ThreeBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}^{${this.blocks[2].toLatex()}}`;
    }
}
class SubSupLeft extends ThreeBlockComponent {
    toLatex() {
        return `^{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}`;
    }
}
class Degree extends OneBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}^{\\circ}`;
    }
}

/**
 * @class
 * The square root function
 */
class Sqrt extends OneBlockComponent {
    toLatex() {
        return `\\sqrt{${this.blocks[0].toLatex()}}`;
    }
}


/**
 * @class
 * The nth root function
 */
class NthRoot extends TwoBlockComponent {
    toLatex() {
        return `\\sqrt[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }
}

class BracketR extends OneBlockComponent {
    toLatex() {
        return `\\left({${this.blocks[0].toLatex()}}\\right)`;
    }
}
class BracketRL extends OneBlockComponent {
    toLatex() {
        return `\\left({${this.blocks[0].toLatex()}}\\right.`;
    }
}
class BracketRR extends OneBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right)`;
    }
}
class BracketS extends OneBlockComponent {
    toLatex() {
        return `\\left[{${this.blocks[0].toLatex()}}\\right]`;
    }
}
class BracketSL extends OneBlockComponent {
    toLatex() {
        return `\\left[{${this.blocks[0].toLatex()}}\\right.`;
    }
}
class BracketSR extends OneBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right]`;
    }
}
class BracketC extends OneBlockComponent {
    toLatex() {
        return `\\left\\{{${this.blocks[0].toLatex()}}\\right\\}`;
    }
}
class BracketCL extends OneBlockComponent {
    toLatex() {
        return `\\left\\{{${this.blocks[0].toLatex()}}\\right.`;
    }
}
class BracketCR extends OneBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right\\}`;
    }
}
class BracketA extends OneBlockComponent {
    toLatex() {
        return `\\left\\langle{${this.blocks[0].toLatex()}}\\right\\rangle`;
    }
}
class BracketAL extends OneBlockComponent {
    toLatex() {
        return `\\left\\langle{${this.blocks[0].toLatex()}}\\right.`;
    }
}
class BracketAR extends OneBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right\\rangle`;
    }
}
class BracketV extends OneBlockComponent {
    toLatex() {
        return `\\left|{${this.blocks[0].toLatex()}}\\right|`;
    }
}
class BracketVL extends OneBlockComponent {
    toLatex() {
        return `\\left|{${this.blocks[0].toLatex()}}\\right.`;
    }
}
class BracketVR extends OneBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right|`;
    }
}
class BracketP extends OneBlockComponent {
    toLatex() {
        return `\\left\\|{${this.blocks[0].toLatex()}}\\right\\|`;
    }
}
class Pipe extends TwoBlockComponent {
    toLatex() {
        return `\\left.{${this.blocks[0].toLatex()}}\\right|{${this.blocks[1].toLatex()}}`;
    }
}

class OversetOverbrace extends TwoBlockComponent {
    toLatex() {
        return `\\overset{${this.blocks[0].toLatex()}}{\\overbrace{${this.blocks[1].toLatex()}}}`;
    }
}
class UndersetUnderbrace extends TwoBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}{\\underbrace{${this.blocks[1].toLatex()}}}`;
    }
}
class OversetLeftRightArrow extends OneBlockComponent {
    toLatex() {
        return `\\overset{${this.blocks[0].toLatex()}}{\\longleftrightarrow}`;
    }
}
class UnderRightArrow extends OneBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}{\\longrightarrow}`;
    }
}
class UnderLeftArrow extends OneBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}{\\longleftarrow}`;
    }
}
class UndersetLeftRightArrow extends OneBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}{\\longleftrightarrow}`;
    }
}
class XRightArrow extends TwoBlockComponent {
    toLatex() {
        return `\\xrightarrow[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }
}
class XLeftArrow extends TwoBlockComponent {
    toLatex() {
        return `\\xleftarrow[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }
}
class XLeftRightArrow extends TwoBlockComponent {
    toLatex() {
        // return `\\xleftrightarrow[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
        return `\\underset{${this.blocks[0].toLatex()}}{\\stackrel{${this.blocks[1].toLatex()}}{\\longleftrightarrow}}`;
    }
}
class Harpoons extends TwoBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}{\\stackrel{${this.blocks[1].toLatex()}}{\\rightleftharpoons}}`;
    }
}
class UnderHarpoons extends OneBlockComponent {
    toLatex() {
        return `\\underset{${this.blocks[0].toLatex()}}\\rightleftharpoons`;
    }
}
class OverHarpoons extends OneBlockComponent {
    toLatex() {
        return `\\overset{${this.blocks[0].toLatex()}}\\rightleftharpoons`;
    }
}
class LArray extends TwoBlockComponent {
    toLatex() {
        return `\\begin{array}{c}{${this.blocks[0].toLatex()}}\\\\{${this.blocks[1].toLatex()}}\\end{array}`;
    }
}
class Divide extends TwoBlockComponent {
    toLatex() {
        return `^{${this.blocks[0].toLatex()}}/_{${this.blocks[1].toLatex()}}`;
    }
}
class OverUnder extends ThreeBlockComponent {
    toLatex() {
        return `\\overset{${this.blocks[0].toLatex()}}{\\underset{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}}`;
    }
}
class RFloor extends OneBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}\\rfloor`;
    }
}


// Listens for keypress and modifies the Expression accordingly



class Colors {
    static colorSet;
    static _init() {
        this.colorSet = new Set();
        for (let col of ['red','blue','green','black','gray','brown','olive','orange','purple','teal','violet']) {
            this.colorSet.add(col);
        }
    }
    static getNew() {
        if(!this.colorSet) {
            this._init();
        }
        const colors = Array.from(this.colorSet);
        return colors[Math.floor(Math.random()*colors.length)];
    }
}
const characters = new Set();
for (let char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@^*()[];:\'"/?.,<>-=+`~') {
    characters.add(char);
}
/**
 * @class
 *
 */
class Cursor {
    constructor(expression, display) {
        this.expression = expression;
        this.block = null;
        this.component = null;
        this.child = -0.5;
        this.position = -0.5;
        this.latex = '';
        this.display = display;
    }

    addText(text) {
        // Insert some text into the Expression, either as its own block or into the block
        // we are in currently.
        if (this.block === null) {
            // Safe to assume we are not in any block and are between two components in the
            // Expression or at the start or end of the Expression.
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.expression.add(_, Math.ceil(this.position));

            this.child = -0.5;
            this.position++;
        } else {
            // We are in some Block in some Component of the Expression.
            // The child we are in changes, the component, block, and position remain the same
            const _ = new TextComponent(this.block);
            _.blocks[0].addChild(text);
            this.block.addChild(_, Math.ceil(this.child));
            this.child++;
        }
    }

    addComponent(component) {
        // Insert a new Component into the Expression at the position of the cursor.
        // If we are in a block, we add a Component to the block as a child, otherwise
        // we insert the Component on the top level as a new component in the
        // Expression
        if (this.block === null) {
            this.expression.add(component, Math.ceil(this.position));
            this.position = Math.ceil(this.position);
            if (
                component instanceof MJXGUISymbol ||
                component instanceof TextComponent
            ) {
                this.block = null;
                this.component = null;
                this.position += 0.5;
            } else {
                this.block = component.blocks[0];
                this.component = component;
            }
            this.child = -0.5;
        } else {
            // Add the component to the block's children and increment this.child in preparation to move
            // inside the inserted component
            this.block.addChild(component, Math.ceil(this.child));
            // this.child += 0.5;
            if (
                component instanceof MJXGUISymbol ||
                component instanceof TextComponent
            ) {
                // If the component we just inserted is a Symbol or Text, don't move into it and increment
                // this.child by 0.5 again
                this.child += 1;
            } else {
                // Otherwise, move into the new component
                this.component = component;
                this.block = component.blocks[0];
                this.child = -0.5;
            }
        }
    }

    removeComponent() {
        if (this.block === null) {
            // If we are not in a block then we check if the component to the left is a TextComponent
            // If it is, we remove it, else we do nothing.
            let prevComponent =
                this.expression.components[Math.floor(this.position)];
            if (
                prevComponent instanceof TextComponent ||
                prevComponent instanceof MJXGUISymbol
            ) {
                this.position = Math.floor(this.position);
                this.component = prevComponent;
                this.block = prevComponent.blocks[0];
                this.child = -0.5;
                this.removeComponent();
            }
        } else if (this.component.parent === null) {
            // Find the component in the expression and remove it, change the cursor object's
            // component and block pointers
            for (let i = 0; i < this.expression.components.length; i++) {
                if (this.expression.components[i] === this.component) {
                    this.expression.remove(i);
                    break;
                }
            }
            this.position -= 0.5;
            this.component = null;
            this.block = null;
            this.child = -0.5;
        } else {
            // Capture the block above us to move into after we remove this component
            let parentBlock = this.component.parent;
            for (let i = 0; i < parentBlock.children.length; i++) {
                if (parentBlock.children[i] === this.component) {
                    parentBlock.removeChild(i);
                    this.child = i - 0.5;
                    break;
                }
            }
            this.block = parentBlock;
            this.component = parentBlock.parent;
        }
    }

    keyPress(event, lastKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.ctrlKey){
            let _;
            let symbolKey = 'y';
            let greekKey = 'w';
            let trigoKey = 't';
            switch(event.key){
                case 'R':
                    _ = new NthRoot(this.block);
                    break;
                case 'f':
                    _ = new TemplateTwoBlockContinuousComponent(this.block,'dfrac');
                    break;
                case 'h':
                    _ = new Superscript(this.block);
                    break;
                case 'r':
                    if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\rho');
                    }else {
                        _ = new Sqrt(this.block);
                    }
                    break;
                case '0':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\phi');
                    }
                    break;
                case '3':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\epsilon');
                    }
                    break;
                case '9':
                    _ = new BracketR(this.block);
                    break;
                case '[':
                    _ = new BracketS(this.block);
                    break;
                case '{':
                    _ = new BracketC(this.block);
                    break;
                case 'i':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\infty');
                    } else {
                        _ = new TemplateThreeBlockComponent(this.block, 'displaystyle\\int\\limits');
                    }
                    break;
                case 'I':
                    _ = new TemplateOneBlockComponent(this.block, 'displaystyle\\int');
                    break;
                case 's':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\sigma');
                    } else if(lastKey === trigoKey) {
                        _ = new MJXGUISymbol(this.block, '\\sin');
                    } else {
                        _ = new TemplateThreeBlockComponent(this.block, 'displaystyle\\sum');
                    }
                    break;
                case 'c':
                    if(lastKey === trigoKey) {
                        _ = new MJXGUISymbol(this.block, '\\cos');
                    }
                    break;
                case 'S':
                    _ = new TemplateOneBlockComponent(this.block, 'displaystyle\\sum');
                    break;
                case 'v':
                    _ = new TemplateOneBlockComponent(this.block, 'overrightarrow');
                    break;
                case 'a':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\alpha');
                    } else {
                        _ = new MJXGUISymbol(this.block, '\\longrightarrow');
                    }
                    break;
                case 'q':
                    _ = new MJXGUISymbol(this.block, '\\leftrightharpoons');
                    break;
                case 'l':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\leq');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\lambda');
                    } else {
                        _ = new Subscript(this.block);
                    }
                    break;
                case 'g':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\geq');
                    }
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\gamma');
                    }
                    break;
                case 't':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\therefore');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\theta');
                    } else if (lastKey === trigoKey) {
                        _ = new MJXGUISymbol(this.block, '\\tan');
                    }
                    break;
                case 'b':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\because');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\beta');
                    }
                    break;
                case 'e':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\equiv');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\eta');
                    } else {
                        _ = new MJXGUISymbol(this.block, '\\Rightarrow');
                    }
                    break;
                case 'm':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\times');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\mu');
                    }
                    break;
                case 'p':
                    if(lastKey === symbolKey) {
                        _ = new MJXGUISymbol(this.block, '\\propto');
                    } else if (lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\pi');
                    }
                    break;
                case 'D':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\Delta');
                    }
                    break;
                case 'd':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\delta');
                    }
                    break;
                case 'o':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\omega');
                    }
                    break;
                case 'O':
                    if(lastKey === greekKey) {
                        _ = new MJXGUISymbol(this.block, '\\Omega');
                    }
                    break;

            }
            if(_) this.addComponent(_);

        }
        else if (characters.has(event.key)) {
            this.addText(event.key);
        } else if (event.key === 'ArrowLeft') {
            this.seekLeft();
        } else if (event.key === 'ArrowRight') {
            this.seekRight();
        } else if (event.key === 'Backspace') {
            this.backspace();
        } else if (event.key === 'Enter') {
            document.getElementById('mjxgui_save_equation').click();
        } else if (event.key === ' ') {
            let _ = new MJXGUISymbol(this.block, '\\:\\:');
            this.addComponent(_);
        } else if (event.key === '\\') {
            let _ = new MJXGUISymbol(this.block, '\\backslash');
            this.addComponent(_);
        } else if (['$', '#', '%', '&', '_', '{', '}'].includes(event.key)) {
            let _ = new MJXGUISymbol(this.block, `\\${event.key}`);
            this.addComponent(_);
        }
        this.updateDisplay();
    }

    seekRight() {
        let maxPos = this.expression.components.length - 0.5;
        if (this.position >= maxPos) return;
        else if (this.block === null) {
            this.position += 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, skip it and go to the next
            if (
                this.expression.components[this.position] instanceof
                    TextComponent ||
                this.expression.components[this.position] instanceof
                    MJXGUISymbol
            ) {
                // If the component to the right of the cursor is a TextComponent, we skip it and
                // move one more position to the right and into the space between two components
                this.position += 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            } else {
                // Otherwise we moved into a function
                // Set the block to be the last block of the function and set the child to be at the left most end
                this.component = this.expression.components[this.position];
                this.block = this.component.blocks[0];
                this.child = -0.5;
                // this.position remains the same
            }
        } else {
            if (this.child === this.block.children.length - 0.5) {
                // If we are at the end of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === this.component.blocks.length - 1) {
                    // If we are in the last block of the current component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position += 0.5;
                    } else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor here
                        this.child =
                            this.block.children.indexOf(this.component) + 0.5;
                        this.component = this.block.parent;
                    }
                } else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos + 1];
                    this.child = -0.5;
                }
            } else {
                // We are not at the end of the block
                // Detect the component to the right
                let nextComponent = this.block.children[Math.ceil(this.child)];
                if (
                    nextComponent instanceof TextComponent ||
                    nextComponent instanceof MJXGUISymbol
                ) {
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child++;
                } else {
                    this.component = nextComponent;
                    this.block = this.component.blocks[0];
                    this.child = -0.5;
                }
            }
        }
    }

    seekLeft() {
        if (this.position <= -0.5) return;
        else if (this.block === null) {
            this.position -= 0.5;
            // If the component at this index is a MJXGUISymbol or a TextComponent, we skip this component and go one more step backward
            if (
                this.expression.components[this.position] instanceof
                    TextComponent ||
                this.expression.components[this.position] instanceof
                    MJXGUISymbol
            ) {
                // If the component to the left of the cursor is a TextComponent, we skip it and
                // move one more position to the left and into the space between two components
                this.position -= 0.5;
                this.child = -0.5;
                this.block = null;
                this.component = null;
            } else {
                // Otherwise we moved into a Function
                // Set the block to be the last block of the function and set the child to be at the right most end
                this.component = this.expression.components[this.position];
                this.block =
                    this.component.blocks[this.component.blocks.length - 1];
                this.child = this.block.children.length - 0.5;
                // this.position remains the same
            }
        } else {
            if (this.child === -0.5) {
                // If we are at the start of the block, we want to move to a different block
                // and possibly a new component
                let pos = this.component.blocks.indexOf(this.block);
                if (pos === 0) {
                    // If we are in the first block of this component, we want to move out of this component
                    if (this.component.parent === null) {
                        // We are at the top level, our component and blocks become null
                        this.component = null;
                        this.block = null;
                        this.child = -0.5;
                        this.position -= 0.5;
                    } else {
                        // Otherwise, we move one level above and our component becomes the parent component
                        // our block becomes the block that the current component was in
                        this.block = this.component.parent;
                        // Record the position the current component is in. We move the cursor there.
                        this.child =
                            this.block.children.indexOf(this.component) - 0.5;
                        this.component = this.block.parent;
                    }
                } else {
                    // this.component and this.position remain the same
                    this.block = this.component.blocks[pos - 1];
                    this.child = this.block.children.length - 0.5;
                }
            } else {
                // We are not at the start of the block
                // Detect the component to the left
                let prevComponent = this.block.children[Math.floor(this.child)];
                if (
                    prevComponent instanceof TextComponent ||
                    prevComponent instanceof MJXGUISymbol
                ) {
                    // If it is a TextComponent or Symbol, skip it and move on
                    this.child--;
                } else {
                    this.component = prevComponent;
                    this.block =
                        this.component.blocks[this.component.blocks.length - 1];
                    this.child = this.block.children.length - 0.5;
                }
            }
        }
    }

    backspace() {
        if (this.expression.components.length === 0) return;
        else if (this.position === -0.5) return;

        if (this.block === null) {
            // If we are not in a block, we are in between two components, remove the previous component if it is
            // a TextComponent
            let prevComponent =
                this.expression.components[Math.floor(this.position)];
            if (
                prevComponent instanceof TextComponent ||
                prevComponent instanceof MJXGUISymbol
            ) {
                this.removeComponent();
            } else {
                this.component = prevComponent;
                this.block =
                    this.component.blocks[this.component.blocks.length - 1];
                this.child = this.block.children.length - 0.5;
                this.position = Math.floor(this.position);
            }
        } else {
            if (this.component.isEmpty()) {
                this.removeComponent();
            } else {
                if (this.child <= -0.5) {
                    const blockPos = this.component.blocks.indexOf(this.block);
                    if (blockPos === 0) return;
                    this.block = this.component.blocks[blockPos - 1];
                    this.child = this.block.children.length - 0.5;
                } else {
                    this.block.removeChild(Math.floor(this.child));
                    this.child--;
                }
            }
        }
    }

    toLatex() {
        // Generate LaTeX from the expression built till now
        let latex = this.expression.toLatex();
        this.latex = latex;
        return latex;
    }

    toDisplayLatex() {
        // Generate LaTeX to show in the display by adding a caret character to the expression.
        // This is not the real LaTeX of the expression but the LaTeX resulting after we add
        // a caret as a | character in the expression
        let caret = new TextComponent(this.block);
        caret.blocks[0].addChild('|');

        let frame = new FrameBox(this.block);

        if (this.block === null) {
            // If we are not in any block, we just add the caret, generate latex
            // and reset the components
            this.expression.add(caret, Math.ceil(this.position));
        } else {
            // We add the current component inside the frame, add the caret in the
            // right position, generate latex and reset the components
            let i = this.component.blocks.indexOf(this.block);

            this.component.removeBlock(i);
            this.component.addBlock(frame, i);
            frame.blocks[0] = this.block;

            this.block.addChild(caret, Math.ceil(this.child));
        }

        let latex = this.toLatex();

        if (this.block === null) {
            this.expression.remove(Math.ceil(this.position));
        } else {
            let i = this.component.blocks.indexOf(frame);
            this.component.removeBlock(i);
            this.component.addBlock(this.block, i);
            this.block.removeChild(Math.ceil(this.child));
        }

        return latex;
    }

    updateDisplay() {
        if (
            this.display instanceof String ||
            typeof this.display === 'string'
        ) {
            this.display = document.querySelector(this.display);
        }
        MathJax.typesetClear([this.display]);
        this.display.innerHTML = '$$' + this.toDisplayLatex() + '$$';
        MathJax.typesetPromise([this.display]).then(() => {});
    }
}
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
    rightrightarrows: '\\rightarrows',
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
    hslash: '\\lfloor{ron?}',
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
            lastKey = evt.key;
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