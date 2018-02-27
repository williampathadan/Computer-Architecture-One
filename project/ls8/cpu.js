/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT = 0b00000001; // Halt CPU
// LDI
const LDI = 0b10011001;
// MUL
const MUL = 0b10101010;
// Add
const ADD = 0b10101000;
// PRN
const PRN = 0b01000011;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register

        this.setupBranchTable();
    }
    
    /**
     * Sets up the branch table
     */
    setupBranchTable() {
        let bt = {};

        bt[HLT] = this.HLT;
        // !!! IMPLEMENT ME
        // LDI
        bt[LDI] = this.LDI;
        // MUL
        bt[MUL] = this.MUL;
        // ADD
        bt[ADD] = this.ADD;
        // PRN
        bt[PRN] = this.PRN;

        this.branchTable = bt;
    }

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'ADD':
                this.reg[regA] = this.reg[regA] + this.reg[regB];
                break;
            case 'MUL':
                this.reg[regA] = this.reg[regA] * this.reg[regB];
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (IR) from the current PC
        // !!! IMPLEMENT ME
        this.reg.IR = this.ram.read(this.reg.PC);

        // Debugging output
        //console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, locate the
        // appropriate hander in the branchTable
        // !!! IMPLEMENT ME
        const handler = this.branchTable[this.reg.IR];

        // Check that the handler is defined, halt if not (invalid
        // instruction)
        if (handler === undefined) {
            console.log(`Instruction ${ this.reg.IR } is invalid`);
            this.stopClock();
            return;
        }

        // !!! IMPLEMENT ME
        const operandA = this.ram.read(this.reg.PC + 1);
        const operandB = this.ram.read(this.reg.PC + 2);

        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        handler.call(this, operandA, operandB);

        // Increment the PC register to go to the next instruction
        // !!! IMPLEMENT ME
        const num = (this.reg.IR >> 6) & 0b00000011;
        this.reg.PC += (num + 1);
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * HLT
     */
    HLT() {
        this.stopClock();
    }

    /**
     * LDI R,I
     */
    LDI(reg, value) {
        // !!! IMPLEMENT ME
        this.reg[reg] = value;
    }

    /**
     * MUL R,R
     */
    MUL(regA, regB) {
        // !!! IMPLEMENT ME
        // Call the ALU
        this.alu('MUL', regA, regB);
    }

    /**
     * ADD R,R
     */
    ADD(regA, regB) {
        // !!! IMPLEMENT ME
        // Call the ALU
        this.alu('ADD', regA, regB);
    }

    /**
     * PRN R
     */
    PRN(regA) {
        // !!! IMPLEMENT ME
        const value = this.reg[regA];
        // Print
        console.log(value);
    }
}

module.exports = CPU;
