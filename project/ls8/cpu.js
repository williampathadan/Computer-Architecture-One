/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT = 0b00000001;

const LDI = 0b10011001;
const PRN = 0b01000011;

const ADD = 0b10101000;
const SUB = 0b10101001;
const MUL = 0b10101010;
const DIV = 0b10101011;
const MOD = 0b10101100;

const INC = 0b01111000;
const DEC = 0b01111001;

const AND = 0b10110011;
const OR  = 0b10110001;
const XOR = 0b10110010;
const NOT = 0b01110000;

const PUSH = 0b01001101;
const POP  = 0b01001100;

const CALL = 0b01001000;
const RET  = 0b00001001;

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
        this.reg.FL = 0; // Flags

        this.reg[IM] = 0;
        this.reg[IS] = 0;
        this.reg[SP] = 0xF4 // Stack Pointer

        this.setupBranchTable();
    }
    
    /**
     * Sets up the branch table
     */
    setupBranchTable() {
        let bt = {};

        bt[HLT] = this.HLT;
        
        bt[LDI] = this.LDI;
        bt[PRN] = this.PRN;

        bt[ADD] = this.ADD;
        bt[SUB] = this.SUB;
        bt[MUL] = this.MUL;
        bt[DIV] = this.DIV;
        bt[MOD] = this.MOD;

        bt[INC] = this.INC;
        bt[DEC] = this.DEC;

        bt[AND] = this.AND;
        bt[OR]  = this.OR;
        bt[XOR] = this.XOR;
        bt[NOT] = this.NOT;

        bt[PUSH] = this.PUSH;
        bt[POP]  = this.POP;

        bt[CALL] = this.CALL;
        bt[RET]  = this.RET;

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
                this.reg[regA] = (this.reg[regA] + this.reg[regB]) & 255;
                break;
            case 'SUB':
                this.reg[regA] = (this.reg[regA] - this.reg[regB]) & 255;
                break;
            case 'MUL':
                this.reg[regA] = (this.reg[regA] * this.reg[regB]) & 255;
                break;
            case 'DIV':
                this.reg[regA] = this.reg[regA] / this.reg[regB];
                break;            
            case 'MOD':
                this.reg[regA] = this.reg[regA] % this.reg[regB];
                break;

            case 'INC':
                this.reg[regA] = (this.reg[regA] + 1) & 255;
                break;
            case 'DEC':
                this.reg[regA] = (this.reg[regA] - 1) & 255;
                break;
            
            case 'AND':
                this.reg[regA] = this.reg[regA] & this.reg[regB];
                break;
            case 'OR':
                this.reg[regA] = this.reg[regA] | this.reg[regB];
                break;
            case 'XOR':
                this.reg[regA] = this.reg[regA] ^ this.reg[regB];
                break;
            case 'NOT':
                this.reg[regA] = (~this.reg[regA]);
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (IR) from the current PC
        this.reg.IR = this.ram.read(this.reg.PC);

        // Debugging output
        //console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, locate the
        // appropriate hander in the branchTable
        const handler = this.branchTable[this.reg.IR];

        // Check that the handler is defined, halt if not (invalid
        // instruction)
        if (handler === undefined) {
            console.log(`Instruction ${ this.reg.IR } is invalid`);
            this.stopClock();
            return;
        }

        const operandA = this.ram.read(this.reg.PC + 1);
        const operandB = this.ram.read(this.reg.PC + 2);

        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        const newPC = handler.call(this, operandA, operandB);

        // Increment the PC register to go to the next instruction
        const count = (this.reg.IR >> 6) & 0b00000011;
        this.reg.PC += (count + 1);

    }

    // INSTRUCTION HANDLER CODE:

    
    HLT() {
        this.stopClock();
    }
    
    LDI(reg, value) {
        this.reg[reg] = value;
    }
    
    PRN(reg) {
        // !!! IMPLEMENT ME
        const value = this.reg[reg];
        // Print
        console.log(value);
    }
    
    ADD(regA, regB) {
        this.alu('ADD', regA, regB);
    }

    SUB(regA, regB) {
        this.alu('SUB', regA, regB);
    }
    
    MUL(regA, regB) {
        this.alu('MUL', regA, regB);
    }

    DIV(regA, regB) {
        if (this.reg[regB] === 0){
            console.log('regB should not be zero');
            this.HLT();
        }
        this.alu('DIV', regA, regB);
    }

    MOD(regA, regB) {
        if (this.reg[regB] === 0){
            console.log('regB should not be zero');
            this.HLT();
        }
        this.alu('MOD', regA, regB);
    }

    INC(reg) {
        this.alu('INC', reg);
    }
    
    DEC(reg) {
        this.alu('DEC', reg);
    }

    AND(regA, regB) {
        this.alu('AND', regA, regB);
    }
    
    OR(regA, regB) {
        this.alu('OR', regA, regB);
    }
    
    XOR(regA, regB) {
        this.alu('XOR', regA, regB);
    }
    
    NOT(reg) {
        this.alu('NOT', reg);
    }
    
    _push(value) {
        this.alu('DEC', SP);
        this.ram.write(this.reg[SP], value);
    }
    PUSH(reg) {
        this._push(this.reg[reg]);
    }

    _pop() {
        const value = this.ram.read(this.reg[SP]);
        this.alu('INC', SP);
        return value;
    }
    POP(reg) {
        this.reg[reg] = this._pop();
    }

    CALL(reg) {
        this._push(this.reg.PC + 2);
        const addr = this.reg[reg];
        return addr;
    }
    
    RET() {
        const value = this._pop();
        return value
    }

}

module.exports = CPU;
