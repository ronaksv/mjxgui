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