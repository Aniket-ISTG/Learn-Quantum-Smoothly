import { Observable, ObservableValue } from "../base/Obs.js";
import { Revision } from "../base/Revision.js";
import { CircuitDefinition } from "../circuit/CircuitDefinition.js";
import { fromJsonText_CircuitDefinition } from "../circuit/Serializer.js";
import { DisplayedInspector } from "./DisplayedInspector.js";

class StepByStepInspector {
    /**
     * 
     * @param {Observable<DisplayedInspector>} displayedInspector
     * @param {Revision} revision
     */
    constructor(displayedInspector, revision) {
        this.displayedInspector = displayedInspector;
        this.revision = revision;
        this.displayedColumns = 1;
        this.playing = new ObservableValue(false);
        this.container = document.getElementById("circuit-inspector");

        this.createListeners();
    }
    
    /**
     * @returns {CircuitDefinition}
     */
    getPreviousDefinition() {
        return fromJsonText_CircuitDefinition(this.revision.peekActiveCommit());
    }
    
    setColumnCount(number) {
        if(number < 1 || number > this.getMaxColumnCount()) return;
        this.displayedColumns = number;
        
        const circuitDefinition = this.getPreviousDefinition();
        const columns = circuitDefinition.columns.filter((_, index) => index < number);

        this.displayedInspector.set(this.displayedInspector.get()
            .withCircuitDefinition(circuitDefinition.withColumns(columns)));
    }
    
    increaseColumns() {
        this.setColumnCount(this.displayedColumns + 1);        
    }

    reduceColumns() {
        this.setColumnCount(this.displayedColumns - 1);
    }
    
    showAllColumns() {
        this.setColumnCount(this.getMaxColumnCount());
    }
    
    getMaxColumnCount() {
        return this.getPreviousDefinition().columns.length;
    }
    
    createListeners() {
        /** @type {[[string, Function]]} */
        const buttons = [
            ["enable-inspector-button", () => this.enable()],
            ["circuit-inspector-overlay", () => this.disable()],
            ["inspector-start", () => this.setColumnCount(1)],
            ["inspector-step-left", () => this.reduceColumns()],
            ["inspector-play", () => this.play()],
            ["inspector-pause", () => this.pause()],
            ["inspector-step-right", () => this.increaseColumns()],
            ["inspector-end", () => this.showAllColumns()]];
        
        buttons.forEach(([bId, callback]) => {
            document.getElementById(bId).addEventListener("click", callback);
        });
        
        this.playing.observable().subscribe(playing => {
            if(playing) this.frame();
            document.getElementById("inspector-play").style.display = !playing ? "inline-block" : "none";
            document.getElementById("inspector-pause").style.display = playing ? "inline-block" : "none";
        });
    }
    
    frame() {
        if(!this.playing.get() || this.displayedColumns >= this.getMaxColumnCount()) {
            this.playing.set(false);
            return;
        }
        
        this.increaseColumns();
        setTimeout(() => this.frame(), 1500);
    }
    
    play() {
        this.playing.set(true);
    }
    
    pause() {
        this.playing.set(false);
    }
    
    enable() {
        this.setColumnCount(1);
        this.container.style.display = 'block';
    }
    
    disable() {
        this.pause();
        this.displayedInspector.set(this.displayedInspector.get()
            .withCircuitDefinition(this.getPreviousDefinition()));
        this.container.style.display = 'none';
    }
}

export default StepByStepInspector;