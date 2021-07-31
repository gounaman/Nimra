/*
The MIT License (MIT)
Copyright © 2021 Gounaman
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class Tokenizer {

    // private data

    static #op = ['+', '-', '*', '/'];
    #previous_token = null;
    #previous_token_type = null;

    #tokens;
    constructor() {
        this.#tokens = [];
    }

    // getters: invoked without parens

    get getToken() {

        let indxRow = this.#tokens.length - 1;
        let indxCol = this.#tokens[indxRow].length - 1;

        return this.#tokens[indxRow][indxCol];

    }

    get printBufffer() {

        return this.#tokens.length > 0 ? this.#tokens.slice() : false;

    }

    get buffSz() {

        if (this.#tokens.length > 0) {
            return true;
        } else return false;

    }

    get rowCount() {

        return this.#tokens.length;

    }

    get getCurrRowValues() {

        const row = this.#currentRow();
        if (row === false) { return false; }
        else return this.#tokens[row].slice();

    }

    get getPreviousToken() {

        return this.#previous_token;

    }

    get getPreviousTokenType() {

        return this.#previous_token_type;

    }

    get flattenTokens() {

        return this.#tokens.flat();

    }

    /*
     * public methods
     */

    getRowValues(indx) {

        if (indx === null) { return false; }
        else return this.#tokens[indx].slice();

    }

    // raw access to internal array

    addTokenAt(token, row) {

        return this.#tokens[row].unshift(token);

    }

    removeTokenAt(row, col) {

        return this.#tokens[row].splice(col, 1);

    }

    // safer access to internal array

    addToken(t, token_type) {

        let len = this.#tokens.length;

        if ((isNaN(t)) && (len === 0)) return false;

        if (((t === "0") && (len === 0)) || ((t === 0) && (len === 0))) {
            return false;
        }

        // if t is a num, make sure it follows an operator

        if ((!isNaN(t)) && (len > 1)) {
            let v = this.#checkOperatorRule();
            if (v === false) {
                return false;
            }
        }

        // if t is an operator, make sure it follows a num

        if ((isNaN(t)) && (len > 0)) {
            let v2 = this.#checkNumberRule();
            if (v2 === false) {
                return false;
            }
        }

        // validate against single digit num range or allowed operators

        if (this.#validateToken(t)) {
            this.#tokens.push([t]);
            this.#previous_token = t;
            this.#previous_token_type = token_type;
            return true;
        } else return false;

    }

    handleDecimal(token, type) {

        if ((token === null) || (type != "dec")) return false;

        let decimal_representation = token;

        if (decimal_representation === "٫") {
            decimal_representation = ".";
        }

        if (this.buffSz === false) {  // tokens array is empty
            let resZero = this.#zeroPrepend();
            if (resZero === true) { return true; }
            else return false;
        }

        // inserting into an array that already has tokens

        const rowIndx = this.#currentRow();
        // compute index of next item slot    
        const colIndx = this.#currentCol(rowIndx) + 1;

        if (this.#previous_token_type != 'numeral') {
            return false;
        }
        else {
            this.#tokens[rowIndx][colIndx] = this.#previous_token = decimal_representation;
            this.#previous_token_type = "dec";
            return true;
        }

    }

    delete() {

        let prevElement = null;
        let rowSeqNum = this.#tokens.length - 1;
        let colSeqNum = this.#tokens[rowSeqNum].length - 1;

        if (rowSeqNum >= 0) {
            this.#tokens[rowSeqNum].splice(colSeqNum);
            --colSeqNum;
        } else {
            return false;
        }

        if (colSeqNum === -1) {
            this.#tokens.splice(rowSeqNum);
            rowSeqNum = this.#tokens.length - 1;
            if (rowSeqNum != -1) {
                colSeqNum = this.#tokens[rowSeqNum].length - 1;
            }
        }

        if (rowSeqNum === -1) {
            this.clearAll(); // debug is this redundant?
            this.#previous_token = null;
            this.#previous_token_type = null;
            resetFirstIteration();
            return true;
        }

        prevElement = this.#tokens[rowSeqNum].slice(colSeqNum);

        const int = parseInt(prevElement);

        if (!isNaN(int)) {
            this.#previous_token = int.toString();
            this.#previous_token_type = "numeral";
            return true;
        }

        const str = prevElement.toString();

        if (Tokenizer.#op.includes(str)) {
            this.#previous_token = str;
            this.#previous_token_type = "operator";
            return true;
        }

        if (str === ".") {
            this.#previous_token = str;
            this.#previous_token_type = "dec";
            return true;
        }

        return false;

    }

    clearAll() {

        this.#tokens = [];
        return true;

    }

    // creates multi dimensional array on the fly

    expandCurrentRow(t, token_type) {

        // negative not allowed in middle of row

        if (Math.sign(t) === -1) return false;

        if (this.#validateToken(t) === false) return false;

        const currRowType = this.#checkRowType();

        // add to an existing number

        if ((currRowType === 'typeNum') && (token_type === 'numeral')) {
            var res = this.#rowUpdate(t);
            if (res === false) {
                return false;
            } else {
                this.#previous_token = t;
                this.#previous_token_type = "numeral";
                return true;
            }
        }

        // if curr row type is operator, t has to be an operator that replaces existing one

        if ((currRowType === 'typeOP') && (token_type != 'numeral')) {
            var len = this.#tokens.length;
            if (len === 0) {
                return false;
            }
            this.#tokens[len - 1][0] = t;
            this.#previous_token = t;
            this.#previous_token_type = "operator";
            return true;
        }

    }

    addOrExpand(type) {

        if ((this.#previous_token_type === null)
            && (this.#previous_token === null)) {
            return "add";
        }

        if ((this.#previous_token_type === "dec")
            && (type === "numeral")) {
            return "expand";
        }

        if ((this.#previous_token_type === "dec")
            && (type === "operator")) {
            return false;
        }

        if ((this.#previous_token_type === "dec")
            && (type === "dec")) {
            return false;
        }

        if ((this.#previous_token_type === "numeral")
            && (type === "numeral")) {
            return "expand";
        }

        if ((this.#previous_token_type === "numeral")
            && (type === "operator")) {
            return "add";
        }

        if ((this.#previous_token_type === "numeral")
            && (type === "dec")) {
            return "expand";
        }

        if ((this.#previous_token_type === "operator")
            && (type === "dec")) {
            return false;
        }

        if ((this.#previous_token_type === "operator")
            && (type === "operator")) {
            return false;
        }

        if ((this.#previous_token_type === "operator")
            && (type === "numeral")) {
            return "add";
        }

        return false;

    }

    updatePreviousToken(token, type) {

        this.#previous_token = token;
        this.#previous_token_type = type;
        return true;
    }

    stringify() {

        let str = "";
        const space = '\u0020';

        if (!this.buffSz) return false;

        this.#tokens.forEach(function (row) {
            row.forEach(function (col) {
                // if col value is -0, JS silently turns it into "0"
                if (isNaN(col)) {
                    if ((col === ".") || (col === "٫")) {
                        str += col;
                    } else str += (space + col + space);
                } else str += col;
            });
        });

        return str;

    }

    calculate() {

        const e = this.#arr2Str();
        if (e === false) return false;

        const dot = ".";
        const lastChar = e.slice(-1);

        if ((lastChar != dot) && (isNaN(lastChar))) {
            return false;
        }

        try {
            return Function(`return (${e})`)();

        } catch (error) {
            console.error(error);
        }

    }

    percent() {

        const ROWLEN = this.#tokens.length;
        if (!ROWLEN === 3) return false;

        const arr1 = this.getRowValues(0);
        if (arr1 === false) return false;

        const str1 = arr1.toString();
        const string1 = str1.replace(/,/g,"");
        const operand1 = parseFloat(string1);
        if (isNaN(operand1)) return false;

        const OPERATOR = this.#tokens[1][0];

        if ((!OPERATOR === '+') || (!OPERATOR === '-')) return false;

        // refactoring candidate

        const arr2 = this.getRowValues(2);
        if (arr2 === false) return false;
        const str2 = arr2.toString();
        const string2 = str2.replace(/,/g,"");
        const operand2 = parseFloat(string2);
        if (isNaN(operand2)) return false;

        const res = this.#percentHelperFunc(OPERATOR, operand1, operand2);
        if (res === false) return false;

        return res;

    }

    /*
     * private methods
     */

    #zeroPrepend() {

        if (this.#previous_token === null) {
            this.#tokens.push([0]);
            this.#tokens[0][1] = ".";
            this.#previous_token = ".";
            this.#previous_token_type = "dec";
            return true;
        } else return false;

    }

    #percentHelperFunc(op, operand1, operand2) {

        if (op === '+') {
            return operand1 + (operand1 * operand2 / 100);
        }

        if (op === '-') {
            return operand1 - (operand1 * operand2 / 100);
        }

        return false;

    }

    #currentRow() {

        return this.#tokens.length > 0 ? this.#tokens.length - 1 : false;

    }

    #previousRow() {

        return this.#tokens.length > 1 ? this.#tokens.length - 2 : false;

    }

    #currentCol(row) {

        if (row < 0) return false;
        var col = this.#tokens[row].length - 1;
        return col;

    }

    #validateToken(t) {

        const OPERATOR = Tokenizer.#op;

        if (this.#tokens.length > 2) {
            if (!this.#handleDivbyZero(t)) return false;
        }

        if (!isNaN(t)) {

            if (t > 9) {
                return false;
            } // only single digits allowed

        }

        if (isNaN(t)) {

            if (!OPERATOR.includes(t)) {
                return false;
            }

        }

        return true;

    }

    #checkOperatorRule() {

        const OPERATOR = Tokenizer.#op;

        if (OPERATOR.includes(this.#previous_token)) {
            return true;
        } else {
            return false;
        }

    }

    #checkNumberRule() {

        if (isNaN(this.#previous_token)) {
            return false;
        } else {
            return true;
        }

    }

    #checkRowType() {

        const arrValue = this.#tokens.slice(-1)[0]; // copy 1st el of curr array
        const value = parseInt(arrValue[0]);
        if (typeof value === "number") {
            return "typeNum";
        }
        return "typeOp"; // NaN

    }

    #rowUpdate(t) {

        const row = this.#currentRow();
        if (row === false) {
            return false;
        }

        const col = this.#currentCol(row) + 1;
        if (col === false) {
            return false
        }

        this.#tokens[row][col] = t;

    }

    #arr2Str() {

        let str = "";
        let prevNum = "";

        if (this.#tokens.length === 0) return false;

        this.#tokens.forEach(function (row) {
            row.forEach(function (col) {
                if ((prevNum === "-") && (Math.sign(col) === -1) ) {
                    str += '\xa0';
                }
                str += col;
                prevNum = col;
            });
        });

        return str;

    }


    #handleDivbyZero(t) {

        const PreviousRowIndx = this.#tokens.length - 1;

        if (((this.#tokens[PreviousRowIndx][0]) === "/") && (t === 0)) {
            return false;
        } else return true;

    }

    #createOperand(row, len) {

        let i = 0;
        let num1 = Number();
        let num2 = Number();

        num1 = this.#tokens[row][i];
        i++;

        while (i < len) {
            num2 = this.#tokens[row][i];
            num1 = this.#concat2Numbers(num1, num2)
            i++;
        }

        return num1;

    }

    #concat2Numbers(num1, num2) {

        const a = parseInt(num1);
        const b = parseInt(num2);

        let n = Number();
        n = a * Math.pow(10, Math.floor(Math.log10(b)) + 1) + b;

        return n;

    }

}

// EOF
